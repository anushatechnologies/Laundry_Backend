import { Router } from 'express';
import { db } from '../../lib/db';
import { requireAdmin } from '../../middleware/admin';

const router = Router();

// GET /api/bulk-pricing - Public endpoint for customer web app
router.get('/', (req, res) => {
  const bulkItems = db.getBulkPricing();
  const serviceMasters = db.getServiceMasters();

  // Group bulk pricing by service for clean customer consumption
  const groupedServices = serviceMasters.map((service) => {
    const pricingSlabs = bulkItems
      .filter((b) => b.serviceId === service.id && b.isActive)
      .sort((a, b) => a.weightKg - b.weightKg)
      .map((item) => ({
        id: item.id,
        weightKg: item.weightKg,
        regularPrice: item.regularPrice,
        expressPrice: item.expressPrice,
        regularTatHours: item.regularTatHours,
        expressTatHours: item.expressTatHours,
      }));

    return {
      serviceId: service.id,
      serviceName: service.name,
      icon: service.icon,
      pricing: pricingSlabs,
    };
  });

  res.json({
    laundryType: 'MIXED_LAUNDRY',
    services: groupedServices,
    allSlabs: bulkItems,
  });
});

// GET /api/admin/bulk-pricing - Admin list endpoint
router.get('/admin', requireAdmin, (req, res) => {
  const bulkItems = db.getBulkPricing();
  res.json({ success: true, count: bulkItems.length, data: bulkItems });
});

// GET /api/admin/bulk-pricing/:id - Get single slab item
router.get('/admin/:id', requireAdmin, (req, res) => {
  const bulkItems = db.getBulkPricing();
  const item = bulkItems.find((b) => b.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Bulk pricing item not found' });
  }
  res.json({ success: true, data: item });
});

// POST /api/admin/bulk-pricing - Add new bulk price item
router.post('/admin', requireAdmin, (req, res) => {
  const { laundryType, serviceId, serviceName, weightKg, regularPrice, expressPrice, regularTatHours, expressTatHours, isActive } = req.body;

  if (!serviceId || !weightKg || regularPrice === undefined) {
    return res.status(400).json({ success: false, message: 'serviceId, weightKg, and regularPrice are required' });
  }

  const newItem = {
    id: `bp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    laundryType: laundryType || 'MIXED_LAUNDRY',
    serviceId,
    serviceName: serviceName || 'Wash & Fold',
    weightKg: parseFloat(weightKg),
    regularPrice: parseFloat(regularPrice),
    expressPrice: expressPrice !== undefined ? parseFloat(expressPrice) : Math.round(parseFloat(regularPrice) * 1.5),
    regularTatHours: parseInt(regularTatHours) || 48,
    expressTatHours: parseInt(expressTatHours) || 12,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  };

  db.addBulkPrice(newItem);
  res.status(201).json({ success: true, message: 'Bulk price item created successfully', data: newItem });
});

// PUT /api/admin/bulk-pricing/slab - Bulk update entire slab array for a service
router.put('/admin/slab', requireAdmin, (req, res) => {
  const { serviceId, laundryType, pricing } = req.body;

  if (!serviceId || !Array.isArray(pricing)) {
    return res.status(400).json({ success: false, message: 'serviceId and pricing array are required' });
  }

  const updatedSlabs = db.updateBulkSlab(serviceId, laundryType || 'MIXED_LAUNDRY', pricing);
  res.json({ success: true, message: 'Bulk pricing slab updated successfully', data: updatedSlabs });
});

// PUT /api/admin/bulk-pricing/:id - Update single bulk price item
router.put('/admin/:id', requireAdmin, (req, res) => {
  const updated = db.updateBulkPrice(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Bulk pricing item not found' });
  }
  res.json({ success: true, message: 'Bulk price item updated', data: updated });
});

// DELETE /api/admin/bulk-pricing/:id - Delete a bulk price item
router.delete('/admin/:id', requireAdmin, (req, res) => {
  const deleted = db.deleteBulkPrice(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Bulk pricing item not found' });
  }
  res.json({ success: true, message: `Bulk price item ${req.params.id} deleted` });
});

export default router;
