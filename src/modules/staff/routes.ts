import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db';
import { requireAdmin } from '../../middleware/admin';

const router = Router();

const roleSchema = z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'LAUNDRY_STAFF', 'PICKUP_AGENT', 'DELIVERY_AGENT']);
const staffSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(254),
  phone: z.string().trim().min(6).max(30),
  role: roleSchema,
  assignedFacility: z.string().trim().max(120).optional(),
  assignedZone: z.string().trim().max(120).optional(),
  isActive: z.boolean().optional().default(true),
});

// GET /api/staff - List all staff members
router.get('/', requireAdmin, (_req: Request, res: Response) => {
  const staff = db.getStaff();
  return res.json({ success: true, count: staff.length, data: staff });
});

// POST /api/staff - Create new staff member
router.post('/', requireAdmin, (req: Request, res: Response) => {
  const parsed = staffSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid staff details.' });
  }

  const created = db.createStaff(parsed.data);
  return res.status(201).json({ success: true, message: `Staff ${created.name} provisioned.`, data: created });
});

// PUT /api/staff/:id - Update staff member
router.put('/:id', requireAdmin, (req: Request, res: Response) => {
  const parsed = staffSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid staff details.' });
  }

  const updated = db.updateStaff(req.params.id, parsed.data);
  if (!updated) return res.status(404).json({ success: false, message: 'Staff member not found.' });
  return res.json({ success: true, message: `Staff ${updated.name} updated.`, data: updated });
});

// DELETE /api/staff/:id - Remove staff member
router.delete('/:id', requireAdmin, (req: Request, res: Response) => {
  const deleted = db.deleteStaff(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Staff member not found.' });
  return res.status(204).end();
});

export default router;
