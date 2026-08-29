import { Router, Request, Response } from 'express';
import { db } from '../../lib/db';
import { requireAdmin } from '../../middleware/admin';

const router = Router();

// GET /api/banners - List all active banners for customer app and web
router.get('/', (req: Request, res: Response) => {
  const activeBanners = db.getBanners(true);
  res.json({ success: true, count: activeBanners.length, data: activeBanners });
});

// GET /api/banners/all - List all banners (including inactive) for admin panel
router.get('/all', requireAdmin, (req: Request, res: Response) => {
  const allBanners = db.getBanners(false);
  res.json({ success: true, count: allBanners.length, data: allBanners });
});

// GET /api/banners/:id - Get single banner
router.get('/:id', (req: Request, res: Response) => {
  const banner = db.getBannerById(req.params.id);
  if (!banner) {
    return res.status(404).json({ success: false, message: 'Banner not found' });
  }
  res.json({ success: true, data: banner });
});

// POST /api/banners - Create new banner
router.post('/', requireAdmin, (req: Request, res: Response) => {
  const {
    title,
    subtitle,
    badgeText,
    imageUrl,
    couponCode,
    discountPercent,
    actionType,
    actionTarget,
    displayOrder,
    isActive,
    startDate,
    endDate,
  } = req.body;

  if (!title || !imageUrl) {
    return res.status(400).json({ success: false, message: 'Title and image URL are required' });
  }

  const created = db.createBanner({
    title: String(title).trim(),
    subtitle: String(subtitle || '').trim(),
    badgeText: String(badgeText || 'SPECIAL OFFER').trim(),
    imageUrl: String(imageUrl).trim(),
    couponCode: couponCode ? String(couponCode).toUpperCase().trim() : '',
    discountPercent: typeof discountPercent === 'number' ? discountPercent : parseFloat(discountPercent) || 0,
    actionType: actionType || 'BOOK',
    actionTarget: actionTarget || '',
    displayOrder: typeof displayOrder === 'number' ? displayOrder : parseInt(displayOrder, 10) || 1,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    startDate,
    endDate,
  });

  res.status(201).json({
    success: true,
    message: 'Banner created successfully',
    data: created,
  });
});

// PUT /api/banners/:id - Update banner
router.put('/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateBanner(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Banner not found' });
  }
  res.json({
    success: true,
    message: 'Banner updated successfully',
    data: updated,
  });
});

// PATCH /api/banners/:id/toggle - Toggle active status
router.patch('/:id/toggle', requireAdmin, (req: Request, res: Response) => {
  const banner = db.getBannerById(req.params.id);
  if (!banner) {
    return res.status(404).json({ success: false, message: 'Banner not found' });
  }
  const updated = db.updateBanner(req.params.id, { isActive: !banner.isActive });
  res.json({
    success: true,
    message: `Banner ${updated?.isActive ? 'activated' : 'deactivated'}`,
    data: updated,
  });
});

// DELETE /api/banners/:id - Delete banner
router.delete('/:id', requireAdmin, (req: Request, res: Response) => {
  const deleted = db.deleteBanner(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Banner not found' });
  }
  res.json({
    success: true,
    message: 'Banner removed successfully',
  });
});

export default router;
