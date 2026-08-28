import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db';
import { requireAdmin } from '../../middleware/admin';

const router = Router();

const pincodeSchema = z.object({
  pincode: z.string().trim().regex(/^\d{6}$/, 'Use a valid six-digit pincode.'),
  areaName: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(120).default('Bengaluru'),
  isServiceable: z.boolean().optional().default(true),
  standardFee: z.coerce.number().finite().min(0).max(5000).optional().default(40),
  minFreeOrderValue: z.coerce.number().finite().min(0).max(100000).optional().default(399),
  expressAvailable: z.boolean().optional().default(true),
  averageTurnaroundHours: z.coerce.number().int().min(1).max(240).optional().default(24),
});

function validationError(res: Response, message: string) {
  return res.status(400).json({ success: false, message });
}

router.get('/', (_req: Request, res: Response) => {
  const pincodes = db.getPincodes();
  return res.json({ success: true, count: pincodes.length, data: pincodes });
});

router.get('/check', (req: Request, res: Response) => {
  const pin = String(req.query.pin || req.query.pincode || '').trim();
  if (!/^\d{6}$/.test(pin)) return validationError(res, 'A valid six-digit pincode is required.');

  const zone = db.checkPincode(pin);
  if (zone?.isServiceable) {
    return res.json({
      success: true,
      data: { isServiceable: true, zone, message: `Service available in ${zone.areaName}, ${zone.city}` },
    });
  }

  return res.json({ success: true, data: { isServiceable: false, message: 'Currently out of service coverage.' } });
});

router.post('/check', (req: Request, res: Response) => {
  const pin = String(req.body?.pincode || req.body?.pin || '').trim();
  if (!/^\d{6}$/.test(pin)) return validationError(res, 'A valid six-digit pincode is required.');

  const zone = db.checkPincode(pin);
  if (zone?.isServiceable) {
    return res.json({
      success: true,
      data: { isServiceable: true, zone, message: `Service available in ${zone.areaName}, ${zone.city}` },
    });
  }

  return res.json({ success: true, data: { isServiceable: false, message: 'Currently out of service coverage.' } });
});

// Reverse geocoding is intentionally unavailable until an explicit server-side Maps key is configured.
router.get('/reverse-geocode', async (req: Request, res: Response) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return validationError(res, 'Valid latitude and longitude are required.');
  }

  const mapsApiKey = process.env.GOOGLE_MAPS_SERVER_KEY?.trim();
  if (!mapsApiKey) {
    return res.status(501).json({
      success: false,
      message: 'Location lookup is not configured yet. Please try again later.',
    });
  }

  try {
    const query = new URLSearchParams({ latlng: `${lat},${lng}`, key: mapsApiKey });
    const geoResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${query}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!geoResponse.ok) throw new Error(`Google Maps returned ${geoResponse.status}`);
    const geoData = (await geoResponse.json()) as { results?: Array<{ formatted_address?: string; address_components?: Array<{ long_name: string; types: string[] }> }> };
    const result = geoData.results?.[0];
    if (!result) return res.status(404).json({ success: false, message: 'No address was found for this location.' });

    const components = result.address_components || [];
    const lookup = (types: string[]) => components.find((component) => types.some((type) => component.types.includes(type)))?.long_name;
    const pincode = lookup(['postal_code']);
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return res.status(422).json({ success: false, message: 'We could not determine a serviceable pincode for this location.' });
    }

    const zone = db.checkPincode(pincode);
    return res.json({
      success: true,
      data: {
        pincode,
        formattedAddress: result.formatted_address || '',
        areaName: lookup(['sublocality', 'locality', 'neighborhood']) || '',
        city: lookup(['administrative_area_level_2', 'locality']) || '',
        isServiceable: Boolean(zone?.isServiceable),
        zone,
        message: zone?.isServiceable ? `Service available in ${zone.areaName}, ${zone.city}` : 'Currently out of service coverage.',
      },
    });
  } catch (error) {
    console.error('Reverse geocoding request failed:', error);
    return res.status(502).json({ success: false, message: 'We could not look up this location right now. Please try again.' });
  }
});

router.post('/', requireAdmin, (req: Request, res: Response) => {
  const parsed = pincodeSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error.issues[0]?.message || 'Invalid pincode details.');

  const saved = db.addPincode(parsed.data);
  return res.status(201).json({ success: true, data: saved });
});

router.put('/:pincode', requireAdmin, (req: Request, res: Response) => {
  const pincode = String(req.params.pincode).trim();
  if (!/^\d{6}$/.test(pincode)) return validationError(res, 'A valid six-digit pincode is required.');

  const parsed = pincodeSchema.partial().safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error.issues[0]?.message || 'Invalid pincode details.');
  if (parsed.data.pincode && parsed.data.pincode !== pincode) {
    return validationError(res, 'Pincode cannot be changed. Create a new coverage area instead.');
  }

  const updated = db.updatePincode(pincode, parsed.data);
  if (!updated) return res.status(404).json({ success: false, message: 'Pincode not found.' });
  return res.json({ success: true, data: updated });
});

router.delete('/:pincode', requireAdmin, (req: Request, res: Response) => {
  const deleted = db.deletePincode(req.params.pincode);
  if (!deleted) return res.status(404).json({ success: false, message: 'Pincode not found.' });
  return res.status(204).end();
});

export default router;
