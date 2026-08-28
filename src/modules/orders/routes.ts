import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db';
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

const paymentMethods = ['ONLINE_RAZORPAY', 'UPI', 'CARD', 'NET_BANKING', 'WALLET', 'COD'] as const;

const orderItemSchema = z.object({
  id: z.string().trim().min(1).max(160),
  serviceId: z.string().trim().min(1).max(100),
  serviceName: z.string().trim().min(1).max(200),
  categoryName: z.string().trim().min(1).max(160),
  pricingModel: z.enum(['PER_KG', 'PER_ITEM']),
  quantity: z.coerce.number().finite().positive().max(250),
  unit: z.string().trim().min(1).max(32),
  specialInstructions: z.string().trim().max(1000).optional(),
});

const createOrderSchema = z.object({
  customerId: z.string().trim().min(1).max(100),
  customerName: z.string().trim().min(2).max(120),
  customerPhone: z.string().trim().min(6).max(30),
  customerEmail: z.string().email().max(254).optional(),
  address: z.object({
    id: z.string().trim().min(1).max(100),
    type: z.enum(['Home', 'Office', 'Other']),
    street: z.string().trim().min(5).max(300),
    landmark: z.string().trim().max(200).optional(),
    city: z.string().trim().min(2).max(120),
    pincode: z.string().trim().regex(/^\d{6}$/),
  }),
  items: z.array(orderItemSchema).min(1).max(50),
  expressTier: z.enum(['REGULAR', 'EXPRESS_24H', 'SAME_DAY']).default('REGULAR'),
  pickupSlot: z.object({ date: z.string().trim().min(8).max(20), slot: z.string().trim().min(3).max(100) }),
  deliverySlot: z.object({ date: z.string().trim().max(20), slot: z.string().trim().min(3).max(100) }).optional(),
  couponCode: z.string().trim().min(2).max(40).optional(),
  notes: z.string().trim().max(1500).optional(),
  paymentMethod: z.enum(paymentMethods),
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
  const { pickupOtp, deliveryOtp, assignedPickupAgent, assignedDeliveryAgent, internalNotes, ...safeOrder } = order;
  return safeOrder;
}

function trackingView(order: Order) {
  return {
    id: order.id,
    currentStatus: order.currentStatus,
    statusHistory: order.statusHistory,
    pickupSlot: order.pickupSlot,
    deliverySlot: order.deliverySlot,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

function priceItems(items: z.infer<typeof orderItemSchema>[], expressTier: Order['expressTier']) {
  return items.map((item) => {
    const catalogPrice = db
      .getPriceMatrix()
      .find((price) => price.isActive && item.id === `${price.clothTypeId}-${price.serviceId}` && item.serviceId === price.serviceId);
    const catalogService = db.getServices().find((service) => service.id === item.serviceId);

    if (!catalogPrice && !catalogService) {
      throw new Error(`The selected service is no longer available: ${item.serviceName}.`);
    }

    const unitPrice = catalogPrice
      ? expressTier === 'REGULAR' || !catalogPrice.expressPrice
        ? catalogPrice.price
        : catalogPrice.expressPrice
      : catalogService!.basePrice;
    const pricingModel = catalogPrice ? 'PER_ITEM' : catalogService!.pricingModel;

    return {
      ...item,
      serviceName: catalogPrice ? `${catalogPrice.clothName} (${catalogPrice.serviceName})` : catalogService!.name,
      categoryName: catalogPrice ? catalogPrice.categoryTag : catalogService!.categoryId,
      pricingModel,
      unitPrice,
      estimatedWeightKg: pricingModel === 'PER_KG' ? item.quantity : undefined,
      subtotal: Number((unitPrice * item.quantity).toFixed(2)),
    };
  });
}

function calculateCouponDiscount(code: string | undefined, itemTotal: number) {
  if (!code) return { couponCode: undefined, discountAmount: 0 };
  const coupon = db.getCoupons().find((item) => item.isActive && item.code.toUpperCase() === code.toUpperCase());
  if (!coupon) throw new Error('That coupon is no longer valid.');
  if (new Date(`${coupon.expiryDate}T23:59:59`).getTime() < Date.now()) throw new Error('That coupon has expired.');
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

  const orders = db.getOrders().filter((order) => order.customerId === customerId).map(customerOrderView);
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

router.post('/', requireCustomerIdentity, (req: Request, res: Response) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid order details.' });
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
    if (input.paymentMethod === 'WALLET') {
      return res.status(422).json({ success: false, message: 'Wallet payments require a verified server-side wallet and are unavailable at checkout.' });
    }

    const items = priceItems(input.items, input.expressTier);
    const itemTotal = Number(items.reduce((total, item) => total + item.subtotal, 0).toFixed(2));
    const { couponCode, discountAmount } = calculateCouponDiscount(input.couponCode, itemTotal);
    const settings = db.getPricingSettings();
    const pickupDeliveryFee = itemTotal >= zone.minFreeOrderValue ? 0 : zone.standardFee;
    const expressFee = input.expressTier === 'REGULAR' ? 0 : input.expressTier === 'SAME_DAY' ? settings.expressDeliveryFee * 2 : settings.expressDeliveryFee;
    const taxableAmount = Math.max(0, itemTotal - discountAmount + pickupDeliveryFee + expressFee);
    const taxAmount = Number((taxableAmount * (settings.taxPercentage / 100)).toFixed(2));
    const totalAmount = Number((taxableAmount + taxAmount).toFixed(2));

    const order = db.createOrder({
      customerId: input.customerId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      address: input.address,
      items,
      pricingModelSummary: items.some((item) => item.pricingModel === 'PER_KG') ? 'PER_KG' : 'PER_ITEM',
      expressTier: input.expressTier,
      pickupSlot: input.pickupSlot,
      deliverySlot: input.deliverySlot,
      itemTotal,
      discountAmount,
      couponCode,
      pickupDeliveryFee,
      expressFee,
      taxAmount,
      totalAmount,
      paymentMethod: input.paymentMethod as PaymentMethod,
      paymentStatus: 'PENDING',
      notes: input.notes,
      estimatedWeightKg: items.filter((item) => item.pricingModel === 'PER_KG').reduce((total, item) => total + item.quantity, 0) || undefined,
    });

    // Auto-trigger Pickup Scheduled email
    triggerOrderEmail(order, 'ORDER_PLACED');

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

  // 1. If new order placed → Alert Admin immediately
  if (targetStatus === 'ORDER_PLACED') {
    sendAdminOrderAlert(emailData).catch((err) => console.error('Admin order alert error:', err));
  }

  // 2. If customer has an email address → dispatch customer status update email
  if (email) {
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

router.patch('/:id/status', requireAdmin, (req: Request, res: Response) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid order status update.' });

  const current = db.getOrderById(req.params.id);
  if (!current) return res.status(404).json({ success: false, message: 'Order not found.' });
  if (current.currentStatus !== parsed.data.status && !allowedTransitions[current.currentStatus]?.includes(parsed.data.status)) {
    return res.status(409).json({ success: false, message: `Cannot move an order from ${current.currentStatus} to ${parsed.data.status}.` });
  }

  const updated = db.updateOrderStatus(req.params.id, parsed.data.status, parsed.data.notes, parsed.data.updatedBy);
  
  if (updated) {
    triggerOrderEmail(updated, parsed.data.status);
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
  return res.json({ success: true, data: updated });
});

export default router;
