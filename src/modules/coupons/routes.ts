import { Router, Request, Response } from 'express';
import { db } from '../../lib/db';
import { requireAdmin } from '../../middleware/admin';

const router = Router();

// GET /api/coupons - List all active coupons
router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, count: db.getCoupons().length, data: db.getCoupons() });
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
router.post('/apply', (req: Request, res: Response) => {
  const { code, orderTotal, isFirstOrder } = req.body;
  const coupon = db.getCoupons().find((c) => c.code.toUpperCase() === (code || '').toUpperCase() && c.isActive);

  if (!coupon) {
    return res.json({ success: false, data: { isValid: false, discount: 0, message: 'Invalid or expired coupon code' } });
  }

  if (orderTotal < coupon.minOrderValue) {
    return res.json({ success: false, data: { isValid: false, discount: 0, message: `Minimum order value of ₹${coupon.minOrderValue} required` } });
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
