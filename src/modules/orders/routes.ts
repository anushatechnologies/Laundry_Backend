import { referralRewardDiscount } from '../referrals/service';
import { getWallet, debitWallet, creditWallet, reverseOrderWalletDeduction } from '../wallet/service';
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db';
import { pool } from '../../lib/mysql';
import { requireAdmin } from '../../middleware/admin';
import { verifyAccessToken } from '../../lib/customer-tokens';
import {
  sendPickupScheduledNotification,
  sendPickupCompletedNotification,
  sendWashingInProgressNotification,
  sendWashCompleteNotification,
  sendOutForDeliveryNotification,
  sendOrderDeliveredNotification,
  sendAdminOrderAlert,
} from '../../lib/email';
import type { Order, OrderStatus, PaymentMethod } from '../../types';
import { sendOrderStatusPushNotification } from '../../lib/push';
import { logAuditEvent } from '../../lib/audit';
import { renderTaxInvoiceHtml } from './invoice';
import { computeDeliveryFee } from '../../lib/delivery';

const router = Router();

function requireCustomerScope(req: Request, res: Response, next: () => void) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ success: false, message: 'Customer sign-in is required.' });

  try {
    const customer = verifyAccessToken(token);
    const requestedId = String(req.query.customerId || '').trim();
    if (!customer.customerId || !requestedId || requestedId !== customer.customerId) {
      return res.status(403).json({ success: false, message: 'You can only access your own orders.' });
    }
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Customer session expired. Please sign in again.' });
  }
}

function requireCustomerIdentity(req: Request, res: Response, next: () => void) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (token) {
    try {
      const customer = verifyAccessToken(token);
      if (customer.customerId) {
        if (!req.body.customerId || req.body.customerId === 'anonymous-customer') {
          req.body.customerId = customer.customerId;
        }
        return next();
      }
    } catch {
      // If token expired, fallback to guest order if phone is present
    }
  }

  const phone = String(req.body?.customerPhone || '').trim();
  if (phone) {
    if (!req.body.customerId || req.body.customerId === 'anonymous-customer') {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      req.body.customerId = `guest-${cleanPhone || Date.now()}`;
    }
    if (!req.body.customerName) {
      req.body.customerName = 'Guest Customer';
    }
    return next();
  }

  return res.status(401).json({ success: false, message: 'Please provide a contact phone number to place an order.' });
}

const orderStatuses = [
  'ORDER_PLACED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'RECEIVED_AT_FACILITY', 'WEIGHED_VERIFIED',
  'WASHING', 'DRYING', 'IRONING', 'QUALITY_CHECK', 'PACKED', 'DELIVERY_ASSIGNED',
  'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED',
] as const;

const paymentMethods = ['ONLINE_RAZORPAY', 'UPI', 'CARD', 'NET_BANKING', 'WALLET', 'COD', 'SUBSCRIPTION'] as const;

const orderItemSchema = z.object({
  id: z.string().trim().min(1).max(160),
  serviceId: z.string().trim().min(1).max(100),
  serviceName: z.string().trim().min(1).max(200),
  categoryName: z.string().trim().min(1).max(160),
  pricingModel: z.enum(['PER_KG', 'PER_ITEM']),
  quantity: z.coerce.number().finite().positive().max(250),
  unit: z.string().trim().min(1).max(32),
  unitPrice: z.coerce.number().optional().nullable(),
  specialInstructions: z.string().trim().max(1000).optional().nullable(),
});

const createOrderSchema = z.object({
  customerId: z.string().trim().min(1).max(100),
  customerName: z.string().trim().min(1).max(120),
  customerPhone: z.string().trim().min(6).max(30),
  customerEmail: z.string().trim().email().max(254).optional().or(z.literal('')).nullable(),
  address: z.object({
    id: z.string().trim().max(100).optional().nullable(),
    type: z.enum(['Home', 'Office', 'Other']),
    street: z.string().trim().min(1).max(300),
    landmark: z.string().trim().max(200).optional().nullable(),
    city: z.string().trim().min(1).max(120),
    pincode: z.string().trim().regex(/^\d{6}$/),
    latitude: z.coerce.number().optional().nullable(),
    longitude: z.coerce.number().optional().nullable(),
  }),
  items: z.array(orderItemSchema).min(1).max(50),
  expressTier: z.enum(['REGULAR', 'EXPRESS_24H', 'SAME_DAY']).default('REGULAR'),
  pickupSlot: z.object({ date: z.string().trim().min(8).max(20), slot: z.string().trim().min(3).max(100) }),
  deliverySlot: z.object({ date: z.string().trim().max(20), slot: z.string().trim().min(3).max(100) }).optional().nullable(),
  couponCode: z.string().trim().max(40).optional().nullable(),
  notes: z.string().trim().max(1500).optional().nullable(),
  paymentMethod: z.enum(paymentMethods),
  useWallet: z.boolean().optional().default(false),
  customerSubscriptionId: z.string().trim().max(100).optional().nullable(),
  subscriptionKgUsed: z.coerce.number().min(0).max(200).optional().nullable(),
});

const statusSchema = z.object({
  status: z.enum(orderStatuses),
  notes: z.string().trim().max(1000).optional(),
  updatedBy: z.string().trim().max(120).optional(),
});

const weightSchema = z.object({
  actualWeightKg: z.coerce.number().finite().positive().max(200),
});

const allowedTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
  ORDER_PLACED: ['PICKUP_ASSIGNED', 'CANCELLED'],
  PICKUP_ASSIGNED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['RECEIVED_AT_FACILITY', 'CANCELLED'],
  RECEIVED_AT_FACILITY: ['WEIGHED_VERIFIED', 'WASHING', 'CANCELLED'],
  WEIGHED_VERIFIED: ['WASHING', 'CANCELLED'],
  WASHING: ['DRYING', 'CANCELLED'],
  DRYING: ['IRONING', 'CANCELLED'],
  IRONING: ['QUALITY_CHECK', 'CANCELLED'],
  QUALITY_CHECK: ['PACKED', 'WASHING', 'CANCELLED'],
  PACKED: ['DELIVERY_ASSIGNED', 'CANCELLED'],
  DELIVERY_ASSIGNED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['COMPLETED'],
};

function customerOrderView(order: Order) {
  const { pickupOtp, deliveryOtp, internalNotes, ...safeOrder } = order;
  return {
    ...safeOrder,
    assignedPickupAgent: order.assignedPickupAgent || undefined,
    assignedDeliveryAgent: order.assignedDeliveryAgent || undefined,
  };
}

function trackingView(order: Order) {
  const pickupAgent = order.assignedPickupAgent || undefined;
  const deliveryAgent = order.assignedDeliveryAgent || undefined;

  return {
    id: order.id,
    currentStatus: order.currentStatus,
    statusHistory: order.statusHistory,
    pickupSlot: order.pickupSlot,
    deliverySlot: order.deliverySlot,
    paymentStatus: order.paymentStatus,
    assignedPickupAgent: pickupAgent,
    assignedDeliveryAgent: deliveryAgent,
    driverName: deliveryAgent?.name || pickupAgent?.name || undefined,
    driverPhone: deliveryAgent?.phone || pickupAgent?.phone || undefined,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

function priceItems(items: z.infer<typeof orderItemSchema>[], expressTier: Order['expressTier']) {
  return items.map((item) => {
    const cleanId = item.id.replace(/^(garment-|home-|bulk-svc-)/, '');

    // 1. Direct or normalized price matrix lookup
    const catalogPrice = db
      .getPriceMatrix()
      .find(
        (price) =>
          price.isActive &&
          (item.id === `${price.clothTypeId}-${price.serviceId}` ||
            cleanId === `${price.clothTypeId}-${price.serviceId}` ||
            (cleanId.startsWith(price.clothTypeId) && item.serviceId === price.serviceId))
      );

    const catalogService = db.getServices().find((service) => service.id === item.serviceId);
    const serviceMaster = db.getServiceMasters().find((service) => service.id === item.serviceId && service.isActive);

    // Fallback: Check if item.serviceId happened to be a clothId or if item.unitPrice is valid
    if (!catalogPrice && !catalogService && !serviceMaster) {
      // Check if priceMatrix has any entry for this cloth
      const clothMatch = db.getPriceMatrix().find((p) => p.isActive && (p.clothTypeId === item.serviceId || cleanId.startsWith(p.clothTypeId)));
      if (clothMatch) {
        const unitPrice = clothMatch.price;
        return {
          ...item,
          serviceName: item.serviceName || clothMatch.clothName,
          categoryName: item.categoryName || clothMatch.categoryTag,
          pricingModel: 'PER_ITEM' as const,
          unitPrice,
          subtotal: unitPrice * item.quantity,
        };
      }

      // If client supplied a valid price, honor it gracefully instead of rejecting checkout
      if (item.unitPrice && item.unitPrice > 0) {
        return {
          ...item,
          serviceName: item.serviceName || 'Custom Fabric Care',
          categoryName: item.categoryName || 'General',
          pricingModel: item.pricingModel || ('PER_ITEM' as const),
          unitPrice: item.unitPrice,
          subtotal: item.unitPrice * item.quantity,
        };
      }

      throw new Error(`The selected service is no longer available: ${item.serviceName}.`);
    }

    const unitPrice = catalogPrice
      ? catalogPrice.price
      : catalogService?.basePrice ?? serviceMaster?.baseKgPrice ?? (item.unitPrice || 0);
    const pricingModel = catalogPrice
      ? 'PER_ITEM'
      : catalogService?.pricingModel ?? (serviceMaster?.pricingType === 'PER_KG' ? 'PER_KG' : 'PER_ITEM');

    const rawCloth = (catalogPrice?.clothName || item.serviceName?.split('(')[0]?.trim() || '').replace(/null/gi, '').trim() || 'Garment Care';
    const rawSrv = (catalogPrice?.serviceName || catalogService?.name || serviceMaster?.name || 'Steam Care & Press').replace(/null/gi, '').trim() || 'Care';
    const resolvedServiceName = catalogPrice ? `${rawCloth} (${rawSrv})` : (catalogService?.name ?? serviceMaster?.name ?? rawCloth);

    return {
      ...item,
      serviceName: resolvedServiceName,
      categoryName: catalogPrice ? catalogPrice.categoryTag : (catalogService?.categoryId ?? 'Bulk Laundry'),
      pricingModel,
      unitPrice,
      estimatedWeightKg: pricingModel === 'PER_KG' ? item.quantity : undefined,
      subtotal: Number((unitPrice * item.quantity).toFixed(2)),
    };
  });
}

function calculateCouponDiscount(code: string | undefined, itemTotal: number, customerId: string) {
  if (!code) return { couponCode: undefined, discountAmount: 0 };
  const coupon = db.getCoupons().find((item) => item.isActive && item.code.toUpperCase() === code.toUpperCase());
  if (!coupon) throw new Error('That coupon is no longer valid.');
  if (new Date(`${coupon.expiryDate}T23:59:59`).getTime() < Date.now()) throw new Error('That coupon has expired.');
  if (coupon.firstOrderOnly && db.getOrders().some((order) => order.customerId === customerId && order.currentStatus !== 'CANCELLED')) {
    throw new Error('That coupon is only available on a first order.');
  }
  if (itemTotal < coupon.minOrderValue) throw new Error(`A minimum order value of ₹${coupon.minOrderValue} is required for this coupon.`);

  const rawDiscount = coupon.discountType === 'FLAT' ? coupon.discountValue : (itemTotal * coupon.discountValue) / 100;
  return {
    couponCode: coupon.code,
    discountAmount: Number(Math.min(rawDiscount, coupon.maxDiscountCap ?? Number.POSITIVE_INFINITY).toFixed(2)),
  };
}

// Admin operations receive the complete order record through an authenticated endpoint.
router.get('/admin', requireAdmin, (_req: Request, res: Response) => {
  return res.json({ success: true, data: db.getOrders() });
});

// Customers may only list their own orders; never return a global order feed.
router.get('/', requireCustomerScope, (req: Request, res: Response) => {
  const customerId = String(req.query.customerId || '').trim();
  if (!customerId) return res.status(400).json({ success: false, message: 'customerId is required.' });

  const orders = db.getOrders()
    .filter((order) => {
      if (order.customerId !== customerId) return false;
      // Filter out abortive checkout orders that never completed online payment
      if (order.paymentMethod === 'ONLINE_RAZORPAY' && order.paymentStatus === 'FAILED' && order.currentStatus === 'CANCELLED') {
        return false;
      }
      return true;
    })
    .map(customerOrderView);
  return res.json({ success: true, data: orders });
});

router.get('/:id/track', (req: Request, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Tracking code not found.' });
  return res.json({ success: true, data: trackingView(order) });
});

router.get('/:id', requireCustomerScope, (req: Request, res: Response) => {
  const customerId = String(req.query.customerId || '').trim();
  if (!customerId) return res.status(400).json({ success: false, message: 'customerId is required.' });

  const order = db.getOrderById(req.params.id);
  if (!order || order.customerId !== customerId) return res.status(404).json({ success: false, message: 'Order not found.' });
  return res.json({ success: true, data: customerOrderView(order) });
});

router.post('/', requireCustomerIdentity, async (req: Request, res: Response) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ') });
  }

  try {
    const input = parsed.data;
    const zone = db.checkPincode(input.address.pincode);
    if (!zone?.isServiceable) {
      return res.status(422).json({ success: false, message: 'This pincode is not currently serviceable.' });
    }
    if (input.expressTier !== 'REGULAR' && !zone.expressAvailable) {
      return res.status(422).json({ success: false, message: 'Express service is not available for this pincode.' });
    }
    const items = priceItems(input.items, input.expressTier);
    const itemTotal = Number(items.reduce((total, item) => total + item.subtotal, 0).toFixed(2));
    const rewardCode = input.couponCode?.trim().toUpperCase();
    if (rewardCode?.startsWith('RWD')) {
      const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : '';
      const identity = verifyAccessToken(token);
      if (identity.customerId !== input.customerId) throw new Error('You can only redeem rewards on your own orders.');
    }
    const { couponCode, discountAmount } = rewardCode?.startsWith('RWD')
      ? await referralRewardDiscount(input.customerId, rewardCode, itemTotal)
      : calculateCouponDiscount(input.couponCode || undefined, itemTotal, input.customerId);
    const settings = db.getPricingSettings();
    const deliveryCalc = computeDeliveryFee({
      customerLat: typeof input.address.latitude === 'number' && !isNaN(input.address.latitude) ? input.address.latitude : undefined,
      customerLng: typeof input.address.longitude === 'number' && !isNaN(input.address.longitude) ? input.address.longitude : undefined,
      customerPincode: input.address.pincode,
      subtotal: itemTotal,
      isExpress: input.expressTier !== 'REGULAR',
      expressTier: input.expressTier,
      settings,
    });

    // Calculate combined order weight (Bulk KG + Garments estimated weight)
    const bulkKg = items
      .filter((item) => item.pricingModel === 'PER_KG')
      .reduce((total, item) => total + item.quantity, 0);
    const pieceCount = items
      .filter((item) => item.pricingModel !== 'PER_KG')
      .reduce((total, item) => total + item.quantity, 0);
    const pieceKg = Number((pieceCount * 0.25).toFixed(1));
    const calculatedOrderWeight = bulkKg > 0 ? Number((bulkKg + pieceKg).toFixed(1)) : Math.max(1, pieceKg);

    // Handle Active Customer Subscription perks (Free Delivery & Bulk/Garment Quota)
    let subscriptionPerkFreeDelivery = false;
    let subscriptionKgToDeduct = 0;
    let subscriptionDiscount = 0;
    let subscriptionPlanName = '';

    if (input.customerSubscriptionId && pool) {
      try {
        const [subRows]: any = await pool.query(
          `SELECT cs.*, s.free_pickup_delivery, s.name as plan_name
           FROM customer_subscriptions cs
           LEFT JOIN subscriptions s ON cs.subscription_id = s.id
           WHERE cs.id = ? AND cs.customer_id = ? AND cs.status = 'ACTIVE'`,
          [input.customerSubscriptionId, input.customerId]
        );

        if (subRows && subRows.length > 0) {
          const sub = subRows[0];
          subscriptionPlanName = sub.plan_name || 'Active Membership';
          if (sub.free_pickup_delivery || Number(sub.free_pickup_delivery) === 1) {
            subscriptionPerkFreeDelivery = true;
          }
          const remainingKg = Number(sub.remaining_kg || 0);
          const requestedKg = Number(input.subscriptionKgUsed || calculatedOrderWeight || 0);
          if (remainingKg > 0 && calculatedOrderWeight > 0) {
            subscriptionKgToDeduct = Math.min(requestedKg, remainingKg, calculatedOrderWeight);
            const coverageFraction = Math.min(1, subscriptionKgToDeduct / calculatedOrderWeight);
            // Subscription quota discount covers item costs up to the covered weight fraction
            subscriptionDiscount = Math.min(itemTotal, Number((itemTotal * coverageFraction).toFixed(2)));
          }
        }
      } catch (subErr) {
        console.warn('[Orders] Error checking customer subscription:', subErr);
      }
    }

    const pickupDeliveryFee = subscriptionPerkFreeDelivery ? 0 : deliveryCalc.deliveryFee;
    const expressFee = deliveryCalc.expressFee;
    const totalDiscounts = Number((discountAmount + subscriptionDiscount).toFixed(2));
    const taxableAmount = Math.max(0, Number((itemTotal - totalDiscounts + pickupDeliveryFee + expressFee).toFixed(2)));
    const effectiveTaxPercentage = (settings.isGstEnabled !== false) ? (settings.taxPercentage ?? 5) : 0;
    const taxAmount = Number((taxableAmount * (effectiveTaxPercentage / 100)).toFixed(2));
    const initialTotalAmount = Number((taxableAmount + taxAmount).toFixed(2));

    // Handle Wallet Balance deduction
    let walletDeduction = 0;
    if (input.useWallet || input.paymentMethod === 'WALLET') {
      try {
        const wallet = await getWallet(input.customerId);
        if (input.paymentMethod === 'WALLET') {
          if (wallet.balance < initialTotalAmount) {
            return res.status(422).json({
              success: false,
              message: `Insufficient wallet balance (₹${wallet.balance.toFixed(2)}). Order total is ₹${initialTotalAmount.toFixed(2)}.`,
            });
          }
          walletDeduction = initialTotalAmount;
        } else if (input.useWallet && wallet.balance > 0) {
          walletDeduction = Math.min(wallet.balance, initialTotalAmount);
        }
      } catch (err: any) {
        console.warn('Wallet check error on order creation:', err?.message);
      }
    }

    const totalAmount = Number((initialTotalAmount - walletDeduction).toFixed(2));
    
    // Payment status logic:
    // - If initial total is 0 (covered completely by subscription quota + free delivery) -> PAID with SUBSCRIPTION
    // - If wallet covers full amount -> PAID with WALLET
    // - If COD -> PENDING (confirmed order, pay at doorstep)
    // - If ONLINE_RAZORPAY with remaining amount -> PENDING (pay via Razorpay)
    const isFullyPaid = initialTotalAmount === 0 || walletDeduction >= initialTotalAmount;
    const paymentMethod: PaymentMethod = isFullyPaid
      ? (subscriptionDiscount > 0 && initialTotalAmount === 0 ? 'SUBSCRIPTION' : 'WALLET')
      : (input.paymentMethod as PaymentMethod);
    const paymentStatus = isFullyPaid ? 'PAID' : 'PENDING';

    // Email fallback: if customer didn't provide email at sign-up,
    // try to load it from their saved customer profile
    let resolvedCustomerEmail = input.customerEmail || '';
    if (!resolvedCustomerEmail && input.customerId) {
      const customerProfile = db.getCustomers?.()?.find?.(
        (c: any) => c.id === input.customerId || c.phone?.slice(-10) === input.customerPhone?.slice(-10)
      );
      if (customerProfile?.email) {
        resolvedCustomerEmail = customerProfile.email;
      }
    }

    const order = await db.createOrder({
      customerId: input.customerId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: resolvedCustomerEmail || undefined,
      address: {
        id: input.address.id || `addr_${Date.now()}`,
        type: input.address.type,
        street: input.address.street,
        landmark: input.address.landmark || undefined,
        city: input.address.city,
        pincode: input.address.pincode,
      },
      items,
      pricingModelSummary: items.some((item) => item.pricingModel === 'PER_KG') ? 'PER_KG' : 'PER_ITEM',
      expressTier: input.expressTier,
      pickupSlot: input.pickupSlot,
      deliverySlot: input.deliverySlot || undefined,
      itemTotal,
      discountAmount,
      couponCode: couponCode || undefined,
      customerSubscriptionId: input.customerSubscriptionId || undefined,
      subscriptionPlanName: subscriptionPlanName || undefined,
      subscriptionKgUsed: subscriptionKgToDeduct > 0 ? subscriptionKgToDeduct : undefined,
      subscriptionDiscount: subscriptionDiscount > 0 ? subscriptionDiscount : undefined,
      walletDeduction: walletDeduction > 0 ? walletDeduction : undefined,
      pickupDeliveryFee,
      expressFee,
      taxAmount,
      totalAmount,
      paymentMethod,
      paymentStatus,
      notes: input.notes || undefined,
      estimatedWeightKg: calculatedOrderWeight || undefined,
    });

    if (walletDeduction > 0) {
      await debitWallet(
        input.customerId,
        walletDeduction,
        `Applied to Order #${order.id}`,
        order.id
      ).catch((err) => console.error('Failed to debit wallet on order creation:', err));
    }

    if (subscriptionKgToDeduct > 0 && input.customerSubscriptionId && pool) {
      await pool.query(
        'UPDATE customer_subscriptions SET used_kg = used_kg + ?, remaining_kg = GREATEST(0, remaining_kg - ?), orders_count = orders_count + 1, updated_at = ? WHERE id = ?',
        [subscriptionKgToDeduct, subscriptionKgToDeduct, new Date().toISOString(), input.customerSubscriptionId]
      ).catch((err) => console.error('[Orders] Failed to deduct subscription kg quota:', err));
    }

    // An online order is only a payment intent at this point. Do not announce
    // it to the customer or operations until Razorpay payment is verified.
    // COD and wallet orders are already confirmed when they are created.
    if (order.paymentStatus === 'PAID' || order.paymentMethod === 'COD') {
      triggerOrderEmail(order, 'ORDER_PLACED');
    }

    // Audit Log Entry
    logAuditEvent({
      actorId: order.customerId,
      actorName: order.customerName,
      actorEmail: order.customerEmail,
      actorRole: 'CUSTOMER',
      action: 'ORDER_CREATED',
      resourceType: 'ORDERS',
      resourceId: order.id,
      details: `Order #${order.id} placed by ${order.customerName} for ₹${order.totalAmount} (${order.items.length} items, ${order.expressTier} tier).`,
      riskLevel: 'INFO',
      payloadAfter: {
        orderId: order.id,
        totalAmount: order.totalAmount,
        itemCount: order.items.length,
        paymentMethod: order.paymentMethod,
        pincode: order.address?.pincode,
      },
      ipAddress: req.ip,
    }).catch(() => {});

    return res.status(201).json({ success: true, data: customerOrderView(order) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create the order.';
    return res.status(422).json({ success: false, message });
  }
});

function triggerOrderEmail(order: Order, status?: OrderStatus) {
  const email = order.customerEmail;

  const emailData = {
    orderId: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    pickupDate: order.pickupSlot?.date,
    pickupTimeSlot: order.pickupSlot?.slot,
    deliveryDate: order.deliverySlot?.date,
    deliveryTimeSlot: order.deliverySlot?.slot,
    pickupAddress: order.address ? `${order.address.street}, ${order.address.city} - ${order.address.pincode}` : undefined,
    itemsSummary: order.items?.map((it) => ({
      name: it.serviceName,
      qty: it.quantity,
      price: it.unitPrice,
    })),
    totalAmount: order.totalAmount,
    taxAmount: order.taxAmount,
    deliveryFee: (order.pickupDeliveryFee || 0) + (order.expressFee || 0),
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    driverName: order.assignedDeliveryAgent?.name || order.assignedPickupAgent?.name || 'In-House Valet Driver',
    driverPhone: order.assignedDeliveryAgent?.phone || order.assignedPickupAgent?.phone || '+91 98765 11001',
    deliveryOtp: order.deliveryOtp || '4829',
    trackingUrl: `https://laundry-website-peach.vercel.app/track/${order.id}`,
    weightKg: order.actualWeightKg || order.estimatedWeightKg,
    specialNotes: order.notes,
  };

  const targetStatus = status || order.currentStatus;
  const prefs = order.customerId ? db.getCustomerPreferences(order.customerId) : undefined;

  // Push delivery respects customer pushNotifications preference (defaults to true)
  if (!prefs || prefs.pushNotifications !== false) {
    sendOrderStatusPushNotification(order, targetStatus).catch((err: any) =>
      console.warn(`Order push notification error for #${order.id}:`, err)
    );
  }

  // 1. If new order placed → Alert Admin immediately
  if (targetStatus === 'ORDER_PLACED') {
    sendAdminOrderAlert(emailData).catch((err) => console.error('Admin order alert error:', err));
  }

  // 2. If customer has an email address and has not disabled email receipts/invoices
  if (email && (!prefs || prefs.emailInvoices !== false)) {
    switch (targetStatus) {
      case 'ORDER_PLACED':
      case 'PICKUP_ASSIGNED':
        sendPickupScheduledNotification(email, emailData).catch((err) => console.error('Email error:', err));
        break;
      case 'PICKED_UP':
      case 'RECEIVED_AT_FACILITY':
        sendPickupCompletedNotification(email, emailData).catch((err) => console.error('Email error:', err));
        break;
      case 'WASHING':
      case 'DRYING':
      case 'IRONING':
        sendWashingInProgressNotification(email, emailData).catch((err) => console.error('Email error:', err));
        break;
      case 'QUALITY_CHECK':
      case 'PACKED':
        sendWashCompleteNotification(email, emailData).catch((err) => console.error('Email error:', err));
        break;
      case 'DELIVERY_ASSIGNED':
      case 'OUT_FOR_DELIVERY':
        sendOutForDeliveryNotification(email, emailData).catch((err) => console.error('Email error:', err));
        break;
      case 'DELIVERED':
      case 'COMPLETED':
        sendOrderDeliveredNotification(email, emailData).catch((err) => console.error('Email error:', err));
        break;
    }
  }
}

export interface CancelOrderResult {
  success: boolean;
  order?: Order;
  refundAmount: number;
  restoredKg: number;
  restoredOrderCount: boolean;
  message: string;
}

export async function cancelAndRefundOrder(
  orderId: string,
  options: {
    cancelledBy?: string;
    role?: 'CUSTOMER' | 'ADMIN' | 'SYSTEM';
    reason?: string;
  } = {}
): Promise<CancelOrderResult> {
  const current = db.getOrderById(orderId);
  if (!current) {
    return {
      success: false,
      refundAmount: 0,
      restoredKg: 0,
      restoredOrderCount: false,
      message: 'Order not found.',
    };
  }

  if (current.currentStatus === 'CANCELLED') {
    return {
      success: false,
      order: current,
      refundAmount: 0,
      restoredKg: 0,
      restoredOrderCount: false,
      message: 'This order is already cancelled.',
    };
  }

  const role = options.role || 'CUSTOMER';
  const cancelledBy = options.cancelledBy || 'Customer';
  const reason = options.reason || (role === 'ADMIN' ? 'Cancelled by Operations Admin' : 'Cancelled by customer');

  // Customer self-cancellation validations
  if (role === 'CUSTOMER') {
    if (options.cancelledBy && current.customerId && current.customerId !== options.cancelledBy) {
      return {
        success: false,
        order: current,
        refundAmount: 0,
        restoredKg: 0,
        restoredOrderCount: false,
        message: 'You are not authorized to cancel this order.',
      };
    }

    const nonCancellableStatuses: OrderStatus[] = [
      'PICKED_UP',
      'RECEIVED_AT_FACILITY',
      'WEIGHED_VERIFIED',
      'WASHING',
      'DRYING',
      'IRONING',
      'QUALITY_CHECK',
      'PACKED',
      'DELIVERY_ASSIGNED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'COMPLETED',
    ];
    if (nonCancellableStatuses.includes(current.currentStatus)) {
      return {
        success: false,
        order: current,
        refundAmount: 0,
        restoredKg: 0,
        restoredOrderCount: false,
        message: `Orders cannot be self-cancelled once garments are picked up or in ${current.currentStatus.replace(/_/g, ' ')} stage. Please contact support.`,
      };
    }
  } else if (role === 'ADMIN') {
    if (['DELIVERED', 'COMPLETED'].includes(current.currentStatus)) {
      return {
        success: false,
        order: current,
        refundAmount: 0,
        restoredKg: 0,
        restoredOrderCount: false,
        message: 'Delivered or completed orders cannot be cancelled.',
      };
    }
  }

  // 1. Calculate Refund Amount (Online paid + Wallet deduction)
  const paidOnline = current.paymentStatus === 'PAID' ? Number(current.totalAmount || 0) : 0;
  const paidWallet = Number(current.walletDeduction || 0);
  const totalCustomerPayment = Number((paidOnline + paidWallet).toFixed(2));

  let amountToRefund = 0;
  if (totalCustomerPayment > 0 && pool) {
    try {
      const [creditRows]: any = await pool.query(
        'SELECT COALESCE(SUM(amount), 0) AS total_refunded FROM wallet_transactions WHERE reference_id = ? AND type = "CREDIT"',
        [current.id]
      );
      const alreadyRefunded = Number(creditRows?.[0]?.total_refunded || 0);
      amountToRefund = Math.max(0, Number((totalCustomerPayment - alreadyRefunded).toFixed(2)));
    } catch (txErr) {
      console.warn('[Orders] Error checking existing wallet refunds:', txErr);
      amountToRefund = totalCustomerPayment;
    }
  } else if (totalCustomerPayment > 0) {
    amountToRefund = totalCustomerPayment;
  }

  // 2. Process Wallet Credit if amountToRefund > 0
  if (amountToRefund > 0 && current.customerId) {
    try {
      await creditWallet(
        current.customerId,
        amountToRefund,
        'DISPUTE_REFUND',
        `Refund for cancelled Order #${current.id}${reason ? ` (${reason})` : ''}`,
        current.id
      );
      console.log(`[Orders] Successfully credited ₹${amountToRefund} to customer ${current.customerId} wallet for cancelled #${current.id}`);
    } catch (refundErr) {
      console.error(`[Orders] Failed to credit wallet for cancelled #${current.id}:`, refundErr);
    }
  }

  // 3. Restore Subscription Quota & Orders Count
  let restoredKg = 0;
  let restoredOrderCount = false;
  if (current.customerSubscriptionId && pool) {
    restoredKg = Number(current.subscriptionKgUsed || 0);
    try {
      await pool.query(
        `UPDATE customer_subscriptions 
         SET used_kg = GREATEST(0, COALESCE(used_kg, 0) - ?), 
             remaining_kg = COALESCE(remaining_kg, 0) + ?, 
             orders_count = GREATEST(0, COALESCE(orders_count, 0) - 1), 
             updated_at = ? 
         WHERE id = ?`,
        [restoredKg, restoredKg, new Date().toISOString(), current.customerSubscriptionId]
      );
      restoredOrderCount = true;
      console.log(`[Orders] Restored ${restoredKg} kg and decremented order count for subscription ${current.customerSubscriptionId}`);
    } catch (subErr) {
      console.error(`[Orders] Failed to restore subscription quota for cancelled #${current.id}:`, subErr);
    }
  }

  // 4. Update Order Status to CANCELLED and paymentStatus to REFUNDED (if payment was made)
  const newPaymentStatus = (totalCustomerPayment > 0 || current.paymentStatus === 'PAID') ? 'REFUNDED' : current.paymentStatus;
  const updatedOrder = db.markOrderCancelledAndRefunded(current.id, reason, cancelledBy, newPaymentStatus) || current;

  // 5. Send Cancellation Push Notification & Email
  triggerOrderEmail(updatedOrder, 'CANCELLED');

  // 6. Audit Trail
  logAuditEvent({
    actorId: cancelledBy,
    actorName: role === 'ADMIN' ? 'Staff Operations' : (current.customerName || 'Customer'),
    actorRole: role === 'ADMIN' ? 'HUB_MANAGER' : 'CUSTOMER',
    action: 'ORDER_STATUS_CHANGED',
    resourceType: 'ORDERS',
    resourceId: current.id,
    details: `Order #${current.id} cancelled by ${role}. Refunded ₹${amountToRefund} to wallet.${restoredKg > 0 ? ` Restored ${restoredKg} kg to subscription.` : ''} Note: ${reason}`,
    riskLevel: 'HIGH_RISK',
    payloadBefore: { status: current.currentStatus, paymentStatus: current.paymentStatus },
    payloadAfter: { status: 'CANCELLED', paymentStatus: newPaymentStatus, refundedAmount: amountToRefund, restoredKg },
  }).catch(() => {});

  const messageParts = [`Order #${current.id} has been cancelled.`];
  if (amountToRefund > 0) {
    messageParts.push(`₹${amountToRefund.toFixed(2)} has been credited to your LaundryFresh Wallet.`);
  }
  if (restoredKg > 0) {
    messageParts.push(`${restoredKg} KG fabric quota has been restored to your subscription.`);
  }

  return {
    success: true,
    order: updatedOrder,
    refundAmount: amountToRefund,
    restoredKg,
    restoredOrderCount,
    message: messageParts.join(' '),
  };
}

// POST /api/orders/:id/cancel - Customer or authorized user cancels order
router.post('/:id/cancel', async (req: Request, res: Response) => {
  const { customerId, reason } = req.body || {};
  const orderId = req.params.id;

  const result = await cancelAndRefundOrder(orderId, {
    cancelledBy: customerId ? String(customerId).trim() : undefined,
    role: 'CUSTOMER',
    reason: reason ? String(reason).trim() : 'Customer requested cancellation',
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.json(result);
});

router.patch('/:id/status', requireAdmin, async (req: Request, res: Response) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid order status update.' });

  const current = db.getOrderById(req.params.id);
  if (!current) return res.status(404).json({ success: false, message: 'Order not found.' });
  if (current.currentStatus !== parsed.data.status && !allowedTransitions[current.currentStatus]?.includes(parsed.data.status)) {
    return res.status(409).json({ success: false, message: `Cannot move an order from ${current.currentStatus} to ${parsed.data.status}.` });
  }

  if (parsed.data.status === 'CANCELLED') {
    const cancelResult = await cancelAndRefundOrder(req.params.id, {
      cancelledBy: parsed.data.updatedBy || 'admin',
      role: 'ADMIN',
      reason: parsed.data.notes || 'Cancelled by Operations Admin',
    });
    return res.json({ success: true, data: cancelResult.order, refundAmount: cancelResult.refundAmount, message: cancelResult.message });
  }

  const updated = db.updateOrderStatus(req.params.id, parsed.data.status, parsed.data.notes, parsed.data.updatedBy);
  
  if (updated) {
    triggerOrderEmail(updated, parsed.data.status);

    // Audit Log Entry
    logAuditEvent({
      actorId: parsed.data.updatedBy || 'admin',
      actorName: parsed.data.updatedBy || 'Staff Operations',
      actorRole: 'HUB_MANAGER',
      action: 'ORDER_STATUS_CHANGED',
      resourceType: 'ORDERS',
      resourceId: req.params.id,
      details: `Order #${req.params.id} status updated from ${current.currentStatus} to ${parsed.data.status}.${parsed.data.notes ? ` Note: ${parsed.data.notes}` : ''}`,
      riskLevel: 'INFO',
      payloadBefore: { status: current.currentStatus },
      payloadAfter: { status: parsed.data.status, notes: parsed.data.notes },
      ipAddress: req.ip,
    }).catch(() => {});
  }

  return res.json({ success: true, data: updated });
});

router.patch('/:id/weight', requireAdmin, (req: Request, res: Response) => {
  const parsed = weightSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'A valid actualWeightKg value is required.' });

  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  if (!['RECEIVED_AT_FACILITY', 'WEIGHED_VERIFIED'].includes(order.currentStatus)) {
    return res.status(409).json({ success: false, message: 'An order can only be weighed after it reaches the facility.' });
  }

  const updated = db.updateOrderWeight(req.params.id, parsed.data.actualWeightKg);

  if (updated) {
    logAuditEvent({
      actorId: 'stf-quality-01',
      actorName: 'Facility Inspector',
      actorRole: 'QUALITY_INSPECTOR',
      action: 'ORDER_WEIGHT_VERIFIED',
      resourceType: 'ORDERS',
      resourceId: req.params.id,
      details: `Verified actual weight for Order #${req.params.id}: ${parsed.data.actualWeightKg} kg.`,
      riskLevel: 'INFO',
      payloadBefore: { weight: order.actualWeightKg },
      payloadAfter: { weight: parsed.data.actualWeightKg },
      ipAddress: req.ip,
    }).catch(() => {});
  }

  return res.json({ success: true, data: updated });
});

// GET /api/orders/:id/invoice - Render full GST-compliant printable tax invoice
router.get('/:id/invoice', (req: Request, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).send('<h1>Order not found</h1>');
  const html = renderTaxInvoiceHtml(order);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
});

// GET /api/orders/:id/pdf - Alias for direct invoice PDF download/viewing
router.get('/:id/pdf', (req: Request, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).send('<h1>Order not found</h1>');
  const settings = db.getPricingSettings(); // Get laundry hub details
  const html = renderTaxInvoiceHtml(order, settings);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
});

// PATCH /api/orders/:id/assign-driver - Admin assigns pickup or delivery pilot
router.patch('/:id/assign-driver', requireAdmin, (req: Request, res: Response) => {
  const { agentType, name, phone, vehicle, rating } = req.body;
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  if (!name || !String(name).trim()) {
    return res.status(400).json({ success: false, message: 'Pilot or Driver name is required.' });
  }

  const isDelivery = agentType === 'DELIVERY';
  const agentObj = {
    id: req.body.id || `agent-${Date.now()}`,
    name: String(name).trim(),
    phone: phone ? String(phone).trim() : '+91 91219 99999',
    rating: Number(rating) || 4.9,
    vehicle: vehicle ? String(vehicle).trim() : (isDelivery ? 'Delivery Van' : 'Valet Pilot Bike'),
  };

  const savedOrder = db.assignOrderDriver(req.params.id, isDelivery ? 'DELIVERY' : 'PICKUP', agentObj);
  if (!savedOrder) return res.status(404).json({ success: false, message: 'Order not found.' });

  // Update lifecycle status if applicable
  if (!isDelivery && savedOrder.currentStatus === 'ORDER_PLACED') {
    db.updateOrderStatus(savedOrder.id, 'PICKUP_ASSIGNED', `Assigned pickup pilot ${agentObj.name}`, req.body.updatedBy || 'admin');
  } else if (isDelivery && (savedOrder.currentStatus === 'PACKED' || savedOrder.currentStatus === 'QUALITY_CHECK')) {
    db.updateOrderStatus(savedOrder.id, 'DELIVERY_ASSIGNED', `Assigned delivery pilot ${agentObj.name}`, req.body.updatedBy || 'admin');
  }

  logAuditEvent({
    actorId: req.body.updatedBy || 'admin',
    actorName: 'Operations Admin',
    actorRole: 'HUB_MANAGER',
    action: 'ORDER_DRIVER_ASSIGNED',
    resourceType: 'ORDERS',
    resourceId: req.params.id,
    details: `Assigned ${isDelivery ? 'DELIVERY' : 'PICKUP'} driver ${agentObj.name} (${agentObj.phone}) to Order #${req.params.id}.`,
    riskLevel: 'INFO',
    payloadAfter: { agentType: isDelivery ? 'DELIVERY' : 'PICKUP', agent: agentObj },
    ipAddress: req.ip,
  }).catch(() => {});

  triggerOrderEmail(savedOrder, isDelivery ? 'DELIVERY_ASSIGNED' : 'PICKUP_ASSIGNED');

  return res.json({ success: true, data: savedOrder });
});

export default router;
