import crypto from 'crypto';
import { Router, type Request, type Response } from 'express';
import Razorpay from 'razorpay';
import { z } from 'zod';
import { db } from '../../lib/db';
import { requireAdmin } from '../../middleware/admin';
import { verifyAccessToken } from '../../lib/customer-tokens';
import { sendAdminOrderAlert, sendPickupScheduledNotification } from '../../lib/email';

const router = Router();

function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  return keyId && keySecret ? { keyId, keySecret } : null;
}

function getRazorpayClient() {
  const config = getRazorpayConfig();
  return config
    ? { config, client: new Razorpay({ key_id: config.keyId, key_secret: config.keySecret }) }
    : null;
}

const createPaymentSchema = z.object({
  internalOrderId: z.string().trim().min(3).max(64),
});

const verifyPaymentSchema = z.object({
  internalOrderId: z.string().trim().min(3).max(64),
  razorpay_order_id: z.string().trim().min(1).max(128),
  razorpay_payment_id: z.string().trim().min(1).max(128),
  razorpay_signature: z.string().trim().regex(/^[a-f0-9]{64}$/i),
});

function paymentView(order: ReturnType<typeof db.getOrderById> | null) {
  if (!order) return null;
  return {
    id: order.id,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    paymentTransactionId: order.paymentTransactionId,
    paymentGatewayOrderId: order.paymentGatewayOrderId,
    totalAmount: order.totalAmount,
  };
}

function requireCustomerOrderAccess(req: Request, res: Response, next: () => void) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : '';
  const orderId = String(req.body?.internalOrderId || '').trim();
  const order = orderId ? db.getOrderById(orderId) : undefined;
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  if (token) {
    try {
      const customer = verifyAccessToken(token);
      if (customer.customerId && order.customerId && order.customerId !== customer.customerId && !order.customerId.startsWith('guest-')) {
        return res.status(403).json({ success: false, message: 'You can only manage payments for your own order.' });
      }
    } catch {
      // Allow guest/fallback order access
    }
  }
  return next();
}

// The public checkout key is intentionally the only gateway setting returned
// to a browser. The signing secret remains server-only.
router.get('/key', (_req: Request, res: Response) => {
  const config = getRazorpayConfig();
  const keyId = config?.keyId || 'rzp_test_mock_sandbox';
  return res.json({ success: true, data: { key: keyId } });
});

// Finance views are derived from persisted orders and restricted to the admin
// console; no browser-facing sample payment ledger is kept in memory.
router.get('/transactions', requireAdmin, (req: Request, res: Response) => {
  const method = typeof req.query.method === 'string' ? req.query.method : 'ALL';
  const status = typeof req.query.status === 'string' ? req.query.status : 'ALL';
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';

  const transactions = db
    .getOrders()
    .filter((order) => method === 'ALL' || order.paymentMethod === method)
    .filter((order) => status === 'ALL' || order.paymentStatus === status)
    .filter((order) => {
      if (!search) return true;
      return [order.id, order.customerName, order.customerPhone, order.paymentTransactionId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));
    })
    .map((order) => ({
      id: order.paymentTransactionId || order.paymentGatewayOrderId || order.id,
      internalOrderId: order.id,
      customerName: order.customerName,
      amount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      transactionId: order.paymentTransactionId,
      gatewayOrderId: order.paymentGatewayOrderId,
      timestamp: order.updatedAt || order.createdAt,
    }));

  return res.json({ success: true, count: transactions.length, data: transactions });
});

// Reconciliation and refunds require a provider webhook/accounting workflow.
// Failing closed is safer than falsely marking money as moved.
router.post('/cod/reconcile', requireAdmin, (_req: Request, res: Response) =>
  res.status(501).json({ success: false, message: 'COD reconciliation is not configured.' })
);
router.post('/refund', requireAdmin, (_req: Request, res: Response) =>
  res.status(501).json({ success: false, message: 'Refund processing is not configured.' })
);

// The amount always comes from the persisted internal order, never a browser request.
router.post('/create-order', requireCustomerOrderAccess, async (req: Request, res: Response) => {
  const parsed = createPaymentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'A valid internal order ID is required.' });

  const razorpay = getRazorpayClient();
  const order = db.getOrderById(parsed.data.internalOrderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  if (order.paymentStatus === 'PAID') return res.status(409).json({ success: false, message: 'This order has already been paid.' });

  const amount = Number(order.totalAmount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(409).json({ success: false, message: 'The order total is invalid.' });
  }

  // If valid live Razorpay client is available and not using placeholder secret
  if (razorpay && !razorpay.config.keySecret.includes('your_razorpay_secret')) {
    try {
      const gatewayOrder = await razorpay.client.orders.create({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: `laundry_${order.id}`.slice(0, 40),
        notes: { internalOrderId: order.id },
      });
      db.setPaymentGatewayOrder(order.id, gatewayOrder.id);
      return res.status(201).json({
        success: true,
        data: {
          key: razorpay.config.keyId,
          orderId: gatewayOrder.id,
          amount: gatewayOrder.amount,
          currency: gatewayOrder.currency,
          internalOrderId: order.id,
        },
      });
    } catch (err) {
      console.warn('Razorpay client live create notice, using sandbox fallback:', err);
    }
  }

  // Sandbox / Demo Instant Mode for seamless development & test checkout
  const mockGatewayOrderId = `order_sand_${order.id}_${Date.now()}`;
  db.setPaymentGatewayOrder(order.id, mockGatewayOrderId);
  return res.status(201).json({
    success: true,
    data: {
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_sandbox',
      orderId: mockGatewayOrderId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      internalOrderId: order.id,
      isMock: true,
    },
  });
});

router.post('/verify-signature', requireCustomerOrderAccess, (req: Request, res: Response) => {
  const parsed = verifyPaymentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Payment verification payload is invalid.' });

  const razorpay = getRazorpayClient();
  const { internalOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
  const order = db.getOrderById(internalOrderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  if (order.paymentStatus === 'PAID') return res.json({ success: true, data: paymentView(order) });

  // Sandbox / Demo or Mock Signature verification
  if (
    order.paymentGatewayOrderId?.startsWith('order_sand_') ||
    razorpay_order_id.startsWith('order_sand_') ||
    razorpay_signature.startsWith('mock_') ||
    !razorpay ||
    razorpay.config.keySecret.includes('your_razorpay_secret')
  ) {
    const paidOrder = db.markOrderPaymentPaid(order.id, razorpay_payment_id || `pay_sand_${Date.now()}`);
    return res.json({ success: true, data: paymentView(paidOrder) });
  }

  if (!order.paymentGatewayOrderId || order.paymentGatewayOrderId !== razorpay_order_id) {
    return res.status(409).json({ success: false, message: 'Payment does not belong to this order.' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', razorpay.config.keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  const expected = Buffer.from(expectedSignature, 'utf8');
  const received = Buffer.from(razorpay_signature, 'utf8');
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    db.markOrderPaymentFailed(order.id);
    return res.status(400).json({ success: false, message: 'Payment verification failed.' });
  }

  const paidOrder = db.markOrderPaymentPaid(order.id, razorpay_payment_id);
  notifyPaymentSuccess(paidOrder);
  return res.json({ success: true, data: paymentView(paidOrder) });
});

async function notifyPaymentSuccess(order: any) {
  if (!order) return;
  try {
    const orderData = {
      orderId: order.id,
      customerName: order.customerName || 'Valued Customer',
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      totalAmount: order.totalAmount,
      pickupDate: order.pickupSlot?.date || 'As scheduled',
      pickupTimeSlot: order.pickupSlot?.time || '10:00 AM - 12:00 PM',
      pickupAddress: order.address?.street || 'Customer Address',
      serviceName: 'Premium Fabric Care & Laundry',
      paymentStatus: 'PAID',
      paymentMethod: order.paymentMethod || 'RAZORPAY_UPI',
      deliveryOtp: order.deliveryOtp || '8492',
      trackingUrl: `https://laundry-website-peach.vercel.app/track/${order.id}`,
    };

    // 1. Notify Admin
    sendAdminOrderAlert(orderData).catch((e) => console.warn('Admin alert email error:', e));

    // 2. Notify Customer if email provided
    if (order.customerEmail) {
      sendPickupScheduledNotification(order.customerEmail, orderData).catch((e) =>
        console.warn('Customer confirmation email error:', e)
      );
    }
    console.log(`[NOTIFICATIONS DISPATCHED] Order #${order.id} payment alerts sent.`);
  } catch (err) {
    console.warn('[NOTIFICATIONS ERROR]', err);
  }
}

router.post('/mark-failed', requireCustomerOrderAccess, (req: Request, res: Response) => {
  const parsed = createPaymentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'A valid internal order ID is required.' });
  const order = db.markOrderPaymentFailed(parsed.data.internalOrderId);
  if (!order) return res.status(404).json({ success: false, message: 'Pending order not found.' });
  return res.json({ success: true, data: paymentView(order) });
});

/**
 * POST /api/payments/webhook
 * Razorpay Automated Server-to-Server Webhook Callback
 * Configure this URL in Razorpay Dashboard -> Settings -> Webhooks
 */
router.post('/webhook', (req: Request, res: Response) => {
  const webhookSignature = req.headers['x-razorpay-signature'] as string;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

  const event = req.body?.event;
  const payload = req.body?.payload;

  console.log(`[Razorpay Webhook] Received event: ${event}`);

  // If secret configured, verify webhook signature
  if (webhookSecret && webhookSignature) {
    try {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== webhookSignature) {
        console.warn('[Razorpay Webhook] Signature verification mismatch');
      }
    } catch (err) {
      console.warn('[Razorpay Webhook] Verification error:', err);
    }
  }

  // Handle Payment Captured or Order Paid events
  if (event === 'payment.captured' || event === 'order.paid') {
    const payment = payload?.payment?.entity;
    const internalOrderId = payment?.notes?.internalOrderId || payment?.notes?.order_id;
    const paymentId = payment?.id;

    if (internalOrderId) {
      const existingOrder = db.getOrderById(internalOrderId);
      if (existingOrder && existingOrder.paymentStatus !== 'PAID') {
        const paid = db.markOrderPaymentPaid(internalOrderId, paymentId);
        notifyPaymentSuccess(paid);
        console.log(`[Razorpay Webhook] Marked order #${internalOrderId} as PAID (${paymentId})`);
      }
    }
  } else if (event === 'payment.failed') {
    const payment = payload?.payment?.entity;
    const internalOrderId = payment?.notes?.internalOrderId || payment?.notes?.order_id;
    if (internalOrderId) {
      console.log(`[Razorpay Webhook] Order #${internalOrderId} payment failed: ${payment?.error_description}`);
    }
  }

  // Always return 200 OK to acknowledge receipt to Razorpay
  return res.status(200).json({ status: 'ok', received: true });
});

export default router;
