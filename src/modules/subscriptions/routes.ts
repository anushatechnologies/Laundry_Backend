import { Router, Request, Response } from 'express';
import { db } from '../../lib/db';
import { requireAdmin, requireConfiguredAdmin } from '../../middleware/admin';
import { subscriptionView } from './view';
import { pool } from '../../lib/mysql';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { verifyAccessToken } from '../../lib/customer-tokens';

const router = Router();

function getGateway() {
  const key = process.env.RAZORPAY_KEY_ID?.trim();
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!key || !secret || secret.includes('your_razorpay_secret')) throw new Error('Online payment is not configured.');
  return { key, secret, client: new Razorpay({ key_id: key, key_secret: secret }) };
}

function requireSubscriptionCustomer(req: Request, res: Response, next: () => void) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer /, '') || '';
    const customer = verifyAccessToken(token);
    const customerId = req.params.customerId || req.body.customerId;
    if (!customer.customerId || customer.customerId !== customerId) {
      return res.status(403).json({ success: false, message: 'You can only access your own memberships.' });
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Please sign in to manage memberships.' });
  }
}

// GET /api/subscriptions/plans - List all subscription plans
router.get('/plans', (req: Request, res: Response) => {
  res.json({ success: true, count: db.getSubscriptionPlans().length, data: db.getSubscriptionPlans() });
});

// POST /api/subscriptions/plans - Create new subscription plan
router.post('/plans', requireAdmin, (req: Request, res: Response) => {
  const { name, price, originalPrice, durationMonths, includedKg, validityDays, freePickupDelivery, priorityService, features, popular, isActive } = req.body;
  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'name and price are required' });
  }

  const months = parseInt(durationMonths) || 1;
  const days = parseInt(validityDays) || months * 30;

  const newPlan = {
    id: req.body.id ? String(req.body.id) : `sub-${Date.now()}`,
    name: String(name).trim(),
    slug: req.body.slug ? String(req.body.slug) : String(name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    durationMonths: months,
    price: parseFloat(price) || 0,
    originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
    validityDays: days,
    includedKg: parseFloat(includedKg) || 20,
    freePickupDelivery: freePickupDelivery !== undefined ? Boolean(freePickupDelivery) : true,
    priorityService: priorityService !== undefined ? Boolean(priorityService) : false,
    maxFamilyMembers: req.body.maxFamilyMembers ? parseInt(req.body.maxFamilyMembers) : 1,
    features: Array.isArray(features) ? features : (features ? [String(features)] : []),
    popular: Boolean(popular),
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  };

  db.addSubscriptionPlan(newPlan);
  res.status(201).json({ success: true, message: `Subscription plan ${newPlan.name} created`, data: newPlan });
});

// PUT /api/subscriptions/plans/:id - Update subscription plan
router.put('/plans/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateSubscriptionPlan(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Subscription plan not found' });
  }
  res.json({ success: true, message: `Subscription plan updated`, data: updated });
});

// DELETE /api/subscriptions/plans/:id - Delete subscription plan
router.delete('/plans/:id', requireAdmin, (req: Request, res: Response) => {
  const deleted = db.deleteSubscriptionPlan(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Subscription plan not found' });
  }
  res.json({ success: true, message: `Subscription plan removed` });
});

// ============================================
// CUSTOMER SUBSCRIPTIONS
// ============================================

// GET /api/subscriptions/customer/:customerId - Get customer's active subscriptions
router.get('/customer/:customerId', requireSubscriptionCustomer, async (req: Request, res: Response) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, message: 'Database connection not available' });
    }

    const [rows]: any = await pool.query(
      `SELECT cs.*, s.name as plan_name, s.slug, s.included_kg, s.validity_days, s.features, s.free_pickup_delivery, s.priority_service
       FROM customer_subscriptions cs
       LEFT JOIN subscriptions s ON cs.subscription_id = s.id
       WHERE cs.customer_id = ?
       ORDER BY cs.created_at DESC`,
      [req.params.customerId]
    );

    const subscriptions = rows.map((row: any) => subscriptionView(row));

    res.json({ success: true, count: subscriptions.length, data: subscriptions });
  } catch (error: any) {
    console.error('Error fetching customer subscriptions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subscriptions', error: error.message });
  }
});

// Admin purchase ledger uses the same status calculation as the customer screen.
router.get('/purchases', requireConfiguredAdmin, async (req: Request, res: Response) => {
  if (!pool) return res.status(503).json({ success: false, message: 'Membership storage is unavailable.' });
  const customerId = typeof req.query.customerId === 'string' ? req.query.customerId.trim() : '';
  try {
    const [rows]: any = await pool.query(
      `SELECT cs.*, s.name AS plan_name, s.slug, s.included_kg, s.features,
              s.free_pickup_delivery, s.priority_service, c.name AS customer_name, c.phone AS customer_phone
       FROM customer_subscriptions cs
       LEFT JOIN subscriptions s ON s.id = cs.subscription_id
       LEFT JOIN customers c ON c.id = cs.customer_id
       ${customerId ? 'WHERE cs.customer_id = ?' : ''}
       ORDER BY cs.created_at DESC`, customerId ? [customerId] : []);
    const purchases = rows.map((row: any) => ({
      ...subscriptionView(row), customerName: row.customer_name || 'Customer', customerPhone: row.customer_phone || '',
    }));
    return res.json({ success: true, count: purchases.length, data: purchases });
  } catch (error) {
    console.error('Error fetching subscription purchases:', error);
    return res.status(500).json({ success: false, message: 'Unable to load purchased subscriptions.' });
  }
});

// POST /api/subscriptions/purchase - Create Razorpay order for subscription purchase
router.post('/purchase', requireSubscriptionCustomer, async (req: Request, res: Response) => {
  try {
    const { customerId, subscriptionId } = req.body;

    if (!customerId || !subscriptionId) {
      return res.status(400).json({ success: false, message: 'customerId and subscriptionId are required' });
    }

    const plans = db.getSubscriptionPlans();
    const plan = plans.find((p: any) => p.id === subscriptionId);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Subscription plan not found' });
    }

    if (!plan.isActive) {
      return res.status(400).json({ success: false, message: 'This subscription plan is not available' });
    }

    if (!pool) return res.status(503).json({ success: false, message: 'Membership storage is unavailable. Please try later.' });
    const gateway = getGateway();

    // Create Razorpay order
    const options = {
      amount: Math.round(plan.price * 100), // Amount in paise
      currency: 'INR',
      receipt: `sub_${crypto.randomUUID()}`.slice(0, 40),
      notes: {
        customerId,
        subscriptionId,
        planName: plan.name,
        type: 'SUBSCRIPTION',
        validityDays: String(plan.validityDays),
        includedKg: String(plan.includedKg),
      },
    };

    const razorpayOrder = await gateway.client.orders.create(options);

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      keyId: gateway.key,
      key: gateway.key,
      amount: plan.price,
      currency: 'INR',
      planName: plan.name,
      validityDays: plan.validityDays,
      includedKg: plan.includedKg,
    });
  } catch (error: any) {
    console.error('Error creating subscription purchase order:', error);
    res.status(500).json({ success: false, message: 'Failed to create purchase order', error: error.message });
  }
});

// POST /api/subscriptions/verify-payment - Verify Razorpay payment and activate subscription
router.post('/verify-payment', requireSubscriptionCustomer, async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customerId, subscriptionId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !customerId || !subscriptionId) {
      return res.status(400).json({ success: false, message: 'Missing required payment verification parameters' });
    }

    const gateway = getGateway();
    // Verify signature
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', gateway.secret)
      .update(text)
      .digest('hex');

    if (typeof razorpay_signature !== 'string' || !/^[a-f0-9]{64}$/i.test(razorpay_signature) ||
        !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature))) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    if (!pool) {
      return res.status(503).json({ success: false, message: 'Database connection not available' });
    }

    const plans = db.getSubscriptionPlans();
    const plan = plans.find((p: any) => p.id === subscriptionId);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Subscription plan not found' });
    }

    const gatewayOrder = await gateway.client.orders.fetch(razorpay_order_id);
    const payment = await gateway.client.payments.fetch(razorpay_payment_id);
    if (gatewayOrder.notes?.type !== 'SUBSCRIPTION' || gatewayOrder.notes?.customerId !== customerId ||
        gatewayOrder.notes?.subscriptionId !== subscriptionId || payment.order_id !== gatewayOrder.id ||
        payment.status !== 'captured' || payment.currency !== 'INR' ||
        Number(payment.amount) !== Number(gatewayOrder.amount)) {
      return res.status(409).json({ success: false, message: 'Payment is not captured for this membership. Please contact support before paying again.' });
    }
    const [existing]: any = await pool.query('SELECT * FROM customer_subscriptions WHERE payment_id = ?', [razorpay_payment_id]);
    if (existing.length) return res.json({ success: true, data: existing[0] });

    const validityDays = Number(gatewayOrder.notes?.validityDays || plan.validityDays);
    const includedKg = Number(gatewayOrder.notes?.includedKg || plan.includedKg);
    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();

    // Create customer subscription record
    const subscriptionRecord = {
      id: `custsub_${razorpay_payment_id}`,
      customer_id: customerId,
      subscription_id: subscriptionId,
      status: 'ACTIVE',
      payment_id: razorpay_payment_id,
      payment_status: 'PAID',
      amount: Number(gatewayOrder.amount) / 100,
      start_date: startDate,
      end_date: endDate,
      auto_renew: 0,
      used_kg: 0,
      remaining_kg: includedKg,
      orders_count: 0,
      created_at: startDate,
      updated_at: startDate,
    };

    await pool.query(
      `INSERT INTO customer_subscriptions (id, customer_id, subscription_id, status, payment_id, payment_status, amount, start_date, end_date, auto_renew, used_kg, remaining_kg, orders_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id = id`,
      [
        subscriptionRecord.id,
        subscriptionRecord.customer_id,
        subscriptionRecord.subscription_id,
        subscriptionRecord.status,
        subscriptionRecord.payment_id,
        subscriptionRecord.payment_status,
        subscriptionRecord.amount,
        subscriptionRecord.start_date,
        subscriptionRecord.end_date,
        subscriptionRecord.auto_renew,
        subscriptionRecord.used_kg,
        subscriptionRecord.remaining_kg,
        subscriptionRecord.orders_count,
        subscriptionRecord.created_at,
        subscriptionRecord.updated_at,
      ]
    );

    res.json({
      success: true,
      message: 'Subscription activated successfully',
      data: {
        ...subscriptionRecord,
        planName: plan.name,
        validityDays: plan.validityDays,
        includedKg: plan.includedKg,
      },
    });
  } catch (error: any) {
    console.error('Error verifying subscription payment:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment', error: error.message });
  }
});

// PUT /api/subscriptions/customer/:subscriptionId/toggle-auto-renew - Toggle auto-renewal
router.put('/customer/:subscriptionId/toggle-auto-renew', async (req: Request, res: Response) => {
  try {
    const { autoRenew } = req.body;

    if (!pool) {
      return res.status(503).json({ success: false, message: 'Database connection not available' });
    }

    await pool.query(
      'UPDATE customer_subscriptions SET auto_renew = ?, updated_at = ? WHERE id = ?',
      [autoRenew ? 1 : 0, new Date().toISOString(), req.params.subscriptionId]
    );

    res.json({ success: true, message: 'Auto-renewal setting updated' });
  } catch (error: any) {
    console.error('Error toggling auto-renew:', error);
    res.status(500).json({ success: false, message: 'Failed to update auto-renewal', error: error.message });
  }
});

// PUT /api/subscriptions/customer/:subscriptionId/cancel - Cancel subscription
router.put('/customer/:subscriptionId/cancel', async (req: Request, res: Response) => {
  try {
    if (!pool) {
      return res.status(503).json({ success: false, message: 'Database connection not available' });
    }

    await pool.query(
      'UPDATE customer_subscriptions SET status = ?, auto_renew = 0, updated_at = ? WHERE id = ?',
      ['CANCELLED', new Date().toISOString(), req.params.subscriptionId]
    );

    res.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel subscription', error: error.message });
  }
});

// PUT /api/subscriptions/customer/:subscriptionId/usage - Update usage (internal use)
router.put('/customer/:subscriptionId/usage', async (req: Request, res: Response) => {
  try {
    const { usedKg } = req.body;

    if (!pool) {
      return res.status(503).json({ success: false, message: 'Database connection not available' });
    }

    const [rows]: any = await pool.query(
      'SELECT used_kg, remaining_kg FROM customer_subscriptions WHERE id = ?',
      [req.params.subscriptionId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    const currentUsed = parseFloat(rows[0].used_kg || 0);
    const newUsed = currentUsed + parseFloat(usedKg);
    const remaining = parseFloat(rows[0].remaining_kg) - parseFloat(usedKg);

    await pool.query(
      'UPDATE customer_subscriptions SET used_kg = ?, remaining_kg = ?, orders_count = orders_count + 1, updated_at = ? WHERE id = ?',
      [newUsed, Math.max(0, remaining), new Date().toISOString(), req.params.subscriptionId]
    );

    res.json({ success: true, message: 'Usage updated', usedKg: newUsed, remainingKg: Math.max(0, remaining) });
  } catch (error: any) {
    console.error('Error updating subscription usage:', error);
    res.status(500).json({ success: false, message: 'Failed to update usage', error: error.message });
  }
});

export default router;
