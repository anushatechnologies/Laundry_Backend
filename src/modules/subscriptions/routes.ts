import { Router, Request, Response } from 'express';
import { db } from '../../lib/db';
import { requireAdmin } from '../../middleware/admin';
import { pool } from '../../lib/mysql';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

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
router.get('/customer/:customerId', async (req: Request, res: Response) => {
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

    const subscriptions = rows.map((row: any) => ({
      id: row.id,
      customerId: row.customer_id,
      subscriptionId: row.subscription_id,
      planName: row.plan_name,
      slug: row.slug,
      status: row.status,
      paymentId: row.payment_id,
      paymentStatus: row.payment_status,
      amount: parseFloat(row.amount),
      startDate: row.start_date,
      endDate: row.end_date,
      autoRenew: Boolean(row.auto_renew),
      usedKg: parseFloat(row.used_kg || 0),
      remainingKg: parseFloat(row.remaining_kg || 0),
      includedKg: parseFloat(row.included_kg || 0),
      ordersCount: row.orders_count || 0,
      features: row.features ? JSON.parse(row.features) : [],
      freePickupDelivery: Boolean(row.free_pickup_delivery),
      priorityService: Boolean(row.priority_service),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json({ success: true, count: subscriptions.length, data: subscriptions });
  } catch (error: any) {
    console.error('Error fetching customer subscriptions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subscriptions', error: error.message });
  }
});

// POST /api/subscriptions/purchase - Create Razorpay order for subscription purchase
router.post('/purchase', async (req: Request, res: Response) => {
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

    // Create Razorpay order
    const options = {
      amount: Math.round(plan.price * 100), // Amount in paise
      currency: 'INR',
      receipt: `sub_${customerId}_${Date.now()}`,
      notes: {
        customerId,
        subscriptionId,
        planName: plan.name,
        type: 'SUBSCRIPTION',
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_live_TO6q7NUVnPM6bA',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_live_TO6q7NUVnPM6bA',
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
router.post('/verify-payment', async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customerId, subscriptionId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !customerId || !subscriptionId) {
      return res.status(400).json({ success: false, message: 'Missing required payment verification parameters' });
    }

    // Verify signature
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(text)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
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

    // Calculate start and end dates
    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + plan.validityDays * 24 * 60 * 60 * 1000).toISOString();

    // Create customer subscription record
    const subscriptionRecord = {
      id: `custsub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customer_id: customerId,
      subscription_id: subscriptionId,
      status: 'ACTIVE',
      payment_id: razorpay_payment_id,
      payment_status: 'PAID',
      amount: plan.price,
      start_date: startDate,
      end_date: endDate,
      auto_renew: 0,
      used_kg: 0,
      remaining_kg: plan.includedKg,
      orders_count: 0,
      created_at: startDate,
      updated_at: startDate,
    };

    await pool.query(
      `INSERT INTO customer_subscriptions (id, customer_id, subscription_id, status, payment_id, payment_status, amount, start_date, end_date, auto_renew, used_kg, remaining_kg, orders_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
