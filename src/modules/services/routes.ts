import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db';
import { uploadBase64ToS3 } from '../../lib/s3';
import { requireAdmin } from '../../middleware/admin';

const router = Router();

const legacyServiceSchema = z.object({
  categoryId: z.string().trim().min(1).max(100),
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180),
  description: z.string().trim().min(2).max(2000),
  pricingModel: z.enum(['PER_KG', 'PER_ITEM']),
  basePrice: z.coerce.number().finite().min(0).max(100000),
  unit: z.string().trim().min(1).max(40),
  minOrderQuantity: z.coerce.number().finite().positive().max(1000).optional(),
  turnaroundHours: z.coerce.number().int().min(1).max(720),
  popular: z.boolean().optional(),
  expressAvailable: z.boolean().optional(),
  image: z.string().trim().max(1000).optional(),
  imageUrl: z.string().trim().max(1000).optional(),
});

// Full dynamic catalog for customer website & admin
router.get('/catalog', (req: Request, res: Response) => {
  const catalog = db.getFullCatalog();
  res.json({ success: true, data: catalog });
});

// Categories & legacy service list
router.get('/', (req: Request, res: Response) => {
  const categoryId = req.query.categoryId as string;
  const services = db.getServices(categoryId);
  const categories = db.getCategories();
  res.json({ success: true, data: { services, categories } });
});

router.post('/', requireAdmin, (req: Request, res: Response) => {
  const parsed = legacyServiceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid service details.' });

  const { imageUrl, ...serviceData } = parsed.data;
  const created = db.addService({ ...serviceData, image: serviceData.image || imageUrl });
  return res.status(201).json({ success: true, data: created });
});

router.put('/:id', requireAdmin, (req: Request, res: Response) => {
  const parsed = legacyServiceSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid service details.' });

  const { imageUrl, ...serviceData } = parsed.data;
  const updated = db.updateService(req.params.id, { ...serviceData, ...(imageUrl ? { image: imageUrl } : {}) });
  if (!updated) return res.status(404).json({ success: false, message: 'Service not found.' });
  return res.json({ success: true, data: updated });
});

router.delete('/:id', requireAdmin, (req: Request, res: Response) => {
  const deleted = db.deleteService(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Service not found.' });
  return res.status(204).end();
});

// POST /api/services/upload-s3 — upload a service image to configured storage.
router.post('/upload-s3', requireAdmin, async (req: Request, res: Response) => {
  const { imageBase64, fileName } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ success: false, message: 'imageBase64 field is required' });
  }

  try {
    const s3Url = await uploadBase64ToS3(imageBase64, fileName);
    return res.json({
      success: true,
      message: 'Image uploaded successfully.',
      data: { s3Url },
    });
  } catch (err: any) {
    console.error('S3 Upload Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload the image.',
    });
  }
});

// Cloth Types
router.get('/cloth-types', (req: Request, res: Response) => {
  const categoryTag = req.query.categoryTag as string;
  const clothTypes = db.getClothTypes(categoryTag);
  res.json({ success: true, data: clothTypes });
});

router.post('/cloth-types', requireAdmin, (req: Request, res: Response) => {
  const newCloth = db.createClothType(req.body);
  res.status(201).json({ success: true, data: newCloth });
});

router.put('/cloth-types/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateClothType(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Cloth type not found' });
  }
  res.json({ success: true, data: updated });
});

router.delete('/cloth-types/:id', requireAdmin, (req: Request, res: Response) => {
  const deleted = db.deleteClothType(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Cloth type not found' });
  }
  res.json({ success: true, message: 'Cloth type deleted successfully' });
});

// Service Masters
router.get('/masters', (req: Request, res: Response) => {
  const masters = db.getServiceMasters();
  res.json({ success: true, data: masters });
});

router.post('/masters', requireAdmin, (req: Request, res: Response) => {
  const newService = db.createServiceMaster(req.body);
  res.status(201).json({ success: true, data: newService });
});

// Price Matrix
router.get('/pricing-matrix', (req: Request, res: Response) => {
  const clothId = req.query.clothId as string;
  const serviceId = req.query.serviceId as string;
  const matrix = db.getPriceMatrix(clothId, serviceId);
  res.json({ success: true, data: matrix });
});

router.put('/pricing-matrix/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updatePriceItem(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Price item not found' });
  }
  res.json({ success: true, data: updated });
});

router.post('/pricing-matrix/upsert', requireAdmin, (req: Request, res: Response) => {
  const result = db.upsertPriceItem(req.body);
  res.json({ success: true, data: result });
});

// Pricing Settings & Financial Rules
router.get('/settings', (req: Request, res: Response) => {
  const settings = db.getPricingSettings();
  res.json({ success: true, data: settings });
});

router.put('/settings', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updatePricingSettings(req.body);
  res.json({ success: true, data: updated });
});

export default router;
