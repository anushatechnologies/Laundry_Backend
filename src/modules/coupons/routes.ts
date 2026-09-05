import { verifyAccessToken } from '../../lib/customer-tokens';
import { referralRewardDiscount } from '../referrals/service';
import { Router, Request, Response } from 'express';
import { db } from '../../lib/db';
import { requireAdmin } from '../../middleware/admin';

const router = Router();

// GET /api/coupons - List all active coupons
router.get('/', (req: Request, res: Response) => {
  const activeCoupons = db.getCoupons().filter((coupon) => coupon.isActive && new Date(`${coupon.expiryDate}T23:59:59`).getTime() >= Date.now());
  res.json({ success: true, count: activeCoupons.length, data: activeCoupons });
});

// POST /api/coupons - Create new coupon
router.post('/', requireAdmin, (req: Request, res: Response) => {
  const { code, title, description, discountType, discountValue, minOrderValue, maxDiscountCap, firstOrderOnly, expiryDate, isActive } = req.body;
  if (!code || !title) {
    return res.status(400).json({ success: false, message: 'code and title are required' });
  }

  const newCoupon = {
    id: `cp-${Date.now()}`,
    code: String(code).toUpperCase().trim(),
    title: String(title).trim(),
    description: description || '',
    discountType: discountType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FLAT',
    discountValue: parseFloat(discountValue) || 100,
    minOrderValue: parseFloat(minOrderValue) || 299,
    maxDiscountCap: maxDiscountCap ? parseFloat(maxDiscountCap) : undefined,
    firstOrderOnly: Boolean(firstOrderOnly),
    expiryDate: expiryDate || '2026-12-31',
    usageCount: 0,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  };

  db.addCoupon(newCoupon as any);
  res.status(201).json({ success: true, message: `Coupon ${newCoupon.code} created`, data: newCoupon });
});

// PUT /api/coupons/:id - Update coupon
router.put('/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateCoupon(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Coupon not found' });
  }
  res.json({ success: true, message: `Coupon updated`, data: updated });
});

// DELETE /api/coupons/:id - Delete coupon
router.delete('/:id', requireAdmin, (req: Request, res: Response) => {
  const deleted = db.deleteCoupon(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Coupon not found' });
  }
  res.json({ success: true, message: `Coupon removed` });
});

// POST /api/coupons/apply - Validate coupon in checkout
router.post('/apply', async (req: Request, res: Response) => {
  const { code, orderTotal, isFirstOrder } = req.body;
  if (typeof code === 'string' && code.trim().toUpperCase().startsWith('RWD')) {
    let customerId: string;
    try {
      const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : '';
      customerId = verifyAccessToken(token).customerId || '';
      if (!customerId) throw new Error('Sign in required.');
    } catch { return res.status(401).json({ success: false, message: 'Please sign in to redeem rewards.' }); }
    try {
      const reward = await referralRewardDiscount(customerId, code.trim().toUpperCase(), Number(orderTotal));
      return res.json({ success: true, data: { isValid: true, discount: reward.discountAmount, message: 'Referral reward applied.' } });
    } catch (error: any) {
      return res.json({ success: true, data: { isValid: false, discount: 0, message: error.code ? 'Reward service is unavailable.' : error.message } });
    }
  }
  const coupon = db.getCoupons().find((c) => c.code.toUpperCase() === (code || '').toUpperCase() && c.isActive);

  if (!coupon) {
    return res.json({ success: true, data: { isValid: false, discount: 0, message: 'Invalid or expired coupon code' } });
  }

  if (new Date(`${coupon.expiryDate}T23:59:59`).getTime() < Date.now()) {
    return res.json({ success: true, data: { isValid: false, discount: 0, message: 'This coupon has expired' } });
  }

  if (coupon.firstOrderOnly && !Boolean(isFirstOrder)) {
    return res.json({ success: true, data: { isValid: false, discount: 0, message: 'This coupon is only available on your first order' } });
  }

  if (orderTotal < coupon.minOrderValue) {
    return res.json({ success: true, data: { isValid: false, discount: 0, message: `Minimum order value of ₹${coupon.minOrderValue} required` } });
  }

  let discount = coupon.discountType === 'FLAT' ? coupon.discountValue : (orderTotal * coupon.discountValue) / 100;
  if (coupon.maxDiscountCap && discount > coupon.maxDiscountCap) discount = coupon.maxDiscountCap;

  res.json({
    success: true,
    data: {
      isValid: true,
      discount: Math.round(discount),
      message: `Coupon ${coupon.code} applied!`,
      coupon,
    },
  });
});

export default router;
