import { Router, Request, Response } from 'express';
import { db } from '../../lib/db';
import { requireAdmin } from '../../middleware/admin';

const router = Router();

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

export default router;
