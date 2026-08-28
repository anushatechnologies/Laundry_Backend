import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../../middleware/admin';
import { verifyAccessToken } from '../../lib/customer-tokens';

export interface TimeSlot {
  id: string;
  hubId: string;
  date: string;
  startTime: string;
  endTime: string;
  maxOrders: number;
  bookedOrders: number;
  maxKg: number;
  bookedKg: number;
  isAvailable: boolean;
  isActive: boolean;
  isPast?: boolean;
}

const getTodayStr = () => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
};

function parseTimeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function isSlotExpired(dateStr: string, startTimeStr: string, bufferMinutes = 30): boolean {
  const todayStr = getTodayStr();

  if (dateStr < todayStr) return true;
  if (dateStr > todayStr) return false;

  const now = new Date();
  const istTimeStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).format(now);
  const [istH, istM] = istTimeStr.split(':').map(Number);
  const currentMinutes = (istH || 0) * 60 + (istM || 0);
  const slotStartMinutes = parseTimeStringToMinutes(startTimeStr);

  return currentMinutes >= slotStartMinutes - bufferMinutes;
}

const STANDARD_TEMPLATES = [
  { id: 'morning-1', startTime: '08:00 AM', endTime: '10:00 AM', maxOrders: 20, maxKg: 100 },
  { id: 'morning-2', startTime: '10:00 AM', endTime: '12:00 PM', maxOrders: 20, maxKg: 100 },
  { id: 'afternoon', startTime: '01:00 PM', endTime: '03:00 PM', maxOrders: 15, maxKg: 80 },
  { id: 'evening-1', startTime: '04:00 PM', endTime: '06:00 PM', maxOrders: 25, maxKg: 120 },
  { id: 'evening-2', startTime: '06:00 PM', endTime: '08:00 PM', maxOrders: 20, maxKg: 100 },
  { id: 'night', startTime: '08:00 PM', endTime: '10:00 PM', maxOrders: 15, maxKg: 80 },
];

export let timeSlots: TimeSlot[] = [];

function ensureSlotsForDate(dateStr: string) {
  const existingForDate = timeSlots.filter((s) => s.date === dateStr);
  if (existingForDate.length === 0) {
    STANDARD_TEMPLATES.forEach((t) => {
      timeSlots.push({
        id: `SLOT-${dateStr.replace(/-/g, '')}-${t.id}`,
        hubId: 'HUB-HYD-01',
        date: dateStr,
        startTime: t.startTime,
        endTime: t.endTime,
        maxOrders: t.maxOrders,
        bookedOrders: 0,
        maxKg: t.maxKg,
        bookedKg: 0,
        isAvailable: true,
        isActive: true,
      });
    });
  }
}

function ensureUpcomingDaysSlots(daysCount = 14) {
  const now = new Date();
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    ensureSlotsForDate(`${year}-${month}-${day}`);
  }
}

// Initial populate
ensureUpcomingDaysSlots(14);

const router = Router();
const dateSchema = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must use YYYY-MM-DD format');
const slotSchema = z.object({
  date: dateSchema.default(getTodayStr),
  hubId: z.string().trim().min(1).max(80).default('HUB-HYD-01'),
  startTime: z.string().trim().min(3).max(30),
  endTime: z.string().trim().min(3).max(30),
  maxOrders: z.coerce.number().int().min(1).max(500),
  maxKg: z.coerce.number().finite().positive().max(5000),
  isAvailable: z.boolean().default(true),
  isActive: z.boolean().default(true),
});
const updateSlotSchema = slotSchema.partial();

// GET /api/slots?date=YYYY-MM-DD — public availability feed for checkout.
// Returns real-time capacity and expired status from backend
router.get('/', (req: Request, res: Response) => {
  ensureUpcomingDaysSlots(14);

  const requestedDate = typeof req.query.date === 'string' ? req.query.date.trim() : '';
  if (requestedDate && !dateSchema.safeParse(requestedDate).success) {
    return res.status(400).json({ success: false, message: 'date must use YYYY-MM-DD format' });
  }

  if (requestedDate) {
    ensureSlotsForDate(requestedDate);
  }

  const rawData = requestedDate ? timeSlots.filter((slot) => slot.date === requestedDate) : timeSlots;
  
  const data = rawData.map((slot) => {
    const isPast = isSlotExpired(slot.date, slot.startTime, 30);
    return {
      ...slot,
      isPast,
      isAvailable: Boolean(slot.isActive && !isPast && slot.bookedOrders < slot.maxOrders && slot.bookedKg < slot.maxKg),
    };
  });

  return res.json({ success: true, count: data.length, data });
});

// POST /api/slots — create a dated pickup window (Admin).
router.post('/', requireAdmin, (req: Request, res: Response) => {
  const parsed = slotSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid slot details.' });
  const input = parsed.data;

  const duplicate = timeSlots.some(
    (slot) => slot.date === input.date && slot.hubId === input.hubId && slot.startTime === input.startTime && slot.endTime === input.endTime
  );
  if (duplicate) return res.status(409).json({ success: false, message: 'This pickup window already exists for that date and hub.' });

  const isPast = isSlotExpired(input.date, input.startTime, 30);
  const newSlot: TimeSlot = {
    id: `SLOT-${Date.now().toString(36).toUpperCase()}`,
    ...input,
    bookedOrders: 0,
    bookedKg: 0,
    isPast,
    isAvailable: Boolean(input.isActive && !isPast),
  };
  timeSlots.push(newSlot);
  return res.status(201).json({ success: true, data: newSlot });
});

// PUT /api/slots/:id — edit date, window, hub, capacity or availability (Admin).
router.put('/:id', requireAdmin, (req: Request, res: Response) => {
  const index = timeSlots.findIndex((slot) => slot.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Time slot not found.' });

  const parsed = updateSlotSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid slot details.' });
  const current = timeSlots[index];
  const next = { ...current, ...parsed.data };
  const duplicate = timeSlots.some(
    (slot, slotIndex) => slotIndex !== index && slot.date === next.date && slot.hubId === next.hubId && slot.startTime === next.startTime && slot.endTime === next.endTime
  );
  if (duplicate) return res.status(409).json({ success: false, message: 'This pickup window already exists for that date and hub.' });

  const isPast = isSlotExpired(next.date, next.startTime, 30);
  next.isPast = isPast;
  next.isAvailable = Boolean(next.isActive && !isPast && next.isAvailable && next.bookedOrders < next.maxOrders && next.bookedKg < next.maxKg);
  timeSlots[index] = next;
  return res.json({ success: true, data: next });
});

// DELETE /api/slots/:id — remove an unused pickup window (Admin).
router.delete('/:id', requireAdmin, (req: Request, res: Response) => {
  const index = timeSlots.findIndex((slot) => slot.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Time slot not found.' });
  if (timeSlots[index].bookedOrders > 0 || timeSlots[index].bookedKg > 0) {
    return res.status(409).json({ success: false, message: 'Booked slots cannot be deleted. Disable this window instead.' });
  }
  timeSlots.splice(index, 1);
  return res.status(204).end();
});

const reserveSlotSchema = z.object({
  slotId: z.string().trim().min(1).max(80),
  orderKg: z.coerce.number().finite().positive().max(200).default(1),
});

function requireCustomerSession(req: Request, res: Response, next: () => void) {
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : '';
  if (!token) return res.status(401).json({ success: false, message: 'Customer sign-in is required.' });
  try {
    const customer = verifyAccessToken(token);
    if (!customer.customerId) return res.status(401).json({ success: false, message: 'Customer session is incomplete.' });
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Customer session expired. Please sign in again.' });
  }
}

// POST /api/slots/reserve — atomically consume one available capacity unit for checkout.
router.post('/reserve', requireCustomerSession, (req: Request, res: Response) => {
  const parsed = reserveSlotSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'A valid slot and order weight are required.' });

  const slot = timeSlots.find((item) => item.id === parsed.data.slotId);
  if (!slot) return res.status(404).json({ success: false, message: 'Pickup slot not found.' });
  
  const isPast = isSlotExpired(slot.date, slot.startTime, 30);
  if (isPast || !slot.isActive || !slot.isAvailable || slot.bookedOrders >= slot.maxOrders || slot.bookedKg + parsed.data.orderKg > slot.maxKg) {
    return res.status(409).json({ success: false, message: 'This pickup slot is no longer available.' });
  }

  slot.bookedOrders += 1;
  slot.bookedKg += parsed.data.orderKg;
  slot.isAvailable = slot.bookedOrders < slot.maxOrders && slot.bookedKg < slot.maxKg;
  return res.status(201).json({ success: true, data: slot });
});

export default router;
