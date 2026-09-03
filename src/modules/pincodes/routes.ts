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
      serviceable: true,
      isServiceable: true,
      data: { isServiceable: true, serviceable: true, zone, pincode: pin, areaName: zone.areaName, city: zone.city, message: `Service available in ${zone.areaName}, ${zone.city}` },
    });
  }

  return res.json({
    success: true,
    serviceable: false,
    isServiceable: false,
    data: {
      isServiceable: false,
      serviceable: false,
      pincode: pin,
      message: `Service is currently not available in PIN ${pin}. We operate across 50+ areas in Hyderabad & Secunderabad and are expanding to your area soon!`,
    },
  });
});

router.post('/check', (req: Request, res: Response) => {
  const pin = String(req.body?.pincode || req.body?.pin || '').trim();
  if (!/^\d{6}$/.test(pin)) return validationError(res, 'A valid six-digit pincode is required.');

  const zone = db.checkPincode(pin);
  if (zone?.isServiceable) {
    return res.json({
      success: true,
      serviceable: true,
      isServiceable: true,
      data: { isServiceable: true, serviceable: true, zone, pincode: pin, areaName: zone.areaName, city: zone.city, message: `Service available in ${zone.areaName}, ${zone.city}` },
    });
  }

  return res.json({
    success: true,
    serviceable: false,
    isServiceable: false,
    data: {
      isServiceable: false,
      serviceable: false,
      pincode: pin,
      message: `Service is currently not available in PIN ${pin}. We operate across 50+ areas in Hyderabad & Secunderabad and are expanding to your area soon!`,
    },
  });
});

type GeocodeComponent = { long_name: string; types: string[] };

function getComponent(components: GeocodeComponent[], types: string[]): string {
  return components.find((component) => types.some((type) => component.types.includes(type)))?.long_name || '';
}

function serviceabilityMessage(isServiceable: boolean): string {
  return isServiceable
    ? 'Pickup is available for this PIN code.'
    : 'Pickup is not available for this PIN code yet.';
}

function buildSearchResult(input: {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  address?: string;
  areaName?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}) {
  const pincode = String(input.pincode || '').replace(/\D/g, '').slice(0, 6);
  if (pincode.length !== 6) return null;

  const zone = db.checkPincode(pincode);
  const isServiceable = Boolean(zone?.isServiceable);
  return {
    ...input,
    pincode,
    isServiceable,
    message: serviceabilityMessage(isServiceable),
  };
}

// Explicit, button-triggered address lookup for the no-GPS/manual picker path.
// It is intentionally not an unrestricted autocomplete endpoint.
router.get('/search', async (req: Request, res: Response) => {
  const query = String(req.query.q || '').trim();
  if (query.length < 3 || query.length > 180) {
    return validationError(res, 'Enter at least 3 characters to search for an address.');
  }

  const mapsApiKey = process.env.GOOGLE_MAPS_SERVER_KEY?.trim();
  if (mapsApiKey) {
    try {
      const searchParams = new URLSearchParams({
        address: query,
        components: 'country:IN',
        region: 'in',
        key: mapsApiKey,
      });
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${searchParams}`, {
        signal: AbortSignal.timeout(6000),
      });
      if (response.ok) {
        const payload = (await response.json()) as {
          results?: Array<{
            formatted_address?: string;
            types?: string[];
            address_components?: GeocodeComponent[];
            geometry?: { location?: { lat?: number; lng?: number } };
          }>;
        };
        const results = (payload.results || [])
          .filter((result) => Number.isFinite(result.geometry?.location?.lat) && Number.isFinite(result.geometry?.location?.lng))
          .sort((left, right) => {
            const leftIsAddress = left.types?.some((type) => ['street_address', 'premise', 'route', 'subpremise'].includes(type)) ? 1 : 0;
            const rightIsAddress = right.types?.some((type) => ['street_address', 'premise', 'route', 'subpremise'].includes(type)) ? 1 : 0;
            return rightIsAddress - leftIsAddress;
          })
          .map((result) => {
            const components = result.address_components || [];
            const street = [
              getComponent(components, ['premise', 'subpremise']),
              getComponent(components, ['street_number']),
              getComponent(components, ['route']),
            ].filter(Boolean).join(' ');
            return buildSearchResult({
              latitude: Number(result.geometry?.location?.lat),
              longitude: Number(result.geometry?.location?.lng),
              formattedAddress: result.formatted_address || '',
              address: street || (result.formatted_address || '').split(',')[0] || '',
              areaName: getComponent(components, ['sublocality_level_1', 'sublocality', 'neighborhood', 'locality']),
              city: getComponent(components, ['locality', 'administrative_area_level_2']),
              state: getComponent(components, ['administrative_area_level_1']),
              country: getComponent(components, ['country']),
              pincode: getComponent(components, ['postal_code']),
            });
          })
          .filter(Boolean)
          .slice(0, 5);

        if (results.length > 0) return res.json({ success: true, data: results });
      }
    } catch (error) {
      console.warn('Google Maps address search failed, falling back to OSM Nominatim:', error);
    }
  }

  try {
    const searchParams = new URLSearchParams({
      format: 'jsonv2',
      q: query,
      limit: '5',
      countrycodes: 'in',
      addressdetails: '1',
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${searchParams}`, {
      headers: { 'User-Agent': 'LaundryFresh-App/1.0 (support@anushatechnologies.com)' },
      signal: AbortSignal.timeout(6000),
    });
    if (response.ok) {
      const payload = (await response.json()) as Array<{
        lat?: string;
        lon?: string;
        display_name?: string;
        address?: Record<string, string | undefined>;
      }>;
      const results = payload
        .map((item) => {
          const address = item.address || {};
          return buildSearchResult({
            latitude: Number(item.lat),
            longitude: Number(item.lon),
            formattedAddress: item.display_name || '',
            address: [address.house_number, address.road].filter(Boolean).join(' ') || (item.display_name || '').split(',')[0] || '',
            areaName: address.suburb || address.neighbourhood || address.residential || address.city_district,
            city: address.city || address.town || address.village || address.state_district,
            state: address.state,
            country: address.country,
            pincode: address.postcode,
          });
        })
        .filter(Boolean)
        .slice(0, 5);
      return res.json({ success: true, data: results });
    }
  } catch (error) {
    console.warn('OSM address search failed:', error);
  }

  return res.status(503).json({
    success: false,
    message: 'We could not find an address right now. Try a landmark, road, or PIN code.',
  });
});

// Reverse geocoding with Google Maps API and OpenStreetMap Nominatim fallback
router.get('/reverse-geocode', async (req: Request, res: Response) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return validationError(res, 'Valid latitude and longitude are required.');
  }

  const mapsApiKey = process.env.GOOGLE_MAPS_SERVER_KEY?.trim();
  if (mapsApiKey) {
    try {
      const query = new URLSearchParams({ latlng: `${lat},${lng}`, key: mapsApiKey });
      const geoResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${query}`, {
        signal: AbortSignal.timeout(6000),
      });
      if (geoResponse.ok) {
        const geoData = (await geoResponse.json()) as {
          results?: Array<{ formatted_address?: string; address_components?: GeocodeComponent[]; types?: string[] }>;
        };
        const result = geoData.results?.find((candidate) =>
          candidate.types?.some((type) => ['street_address', 'premise', 'route', 'subpremise'].includes(type)),
        ) || geoData.results?.[0];
        if (result) {
          const components = result.address_components || [];
          const lookup = (types: string[]) => getComponent(components, types);
          const pincode = lookup(['postal_code']);
          if (pincode && /^\d{6}$/.test(pincode)) {
            const zone = db.checkPincode(pincode);
            const isServiceable = Boolean(zone?.isServiceable);
            return res.json({
              success: true,
              data: {
                pincode,
                formattedAddress: result.formatted_address || '',
                areaName: lookup(['sublocality_level_1', 'sublocality', 'neighborhood', 'locality']) || 'Local Area',
                city: lookup(['administrative_area_level_2', 'locality']) || '',
                isServiceable,
                zone: zone || null,
                message: isServiceable
                  ? `LaundryFresh is available in ${pincode}.`
                  : `LaundryFresh is not available in PIN ${pincode} yet.`,
              },
            });
          }
        }
      }
    } catch (err) {
      console.warn('Google Maps reverse geocode failed, falling back to OSM Nominatim:', err);
    }
  }

  // OpenStreetMap Nominatim Fallback (Free & Public)
  try {
    const osmRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'LaundryFresh-App/1.0 (support@anushatechnologies.com)',
        },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (osmRes.ok) {
      const osmData = (await osmRes.json()) as any;
      const addr = osmData.address || {};
      const rawPostcode = String(addr.postcode || '').replace(/\D/g, '').slice(0, 6);
      if (rawPostcode.length !== 6) {
        return res.status(422).json({
          success: false,
          message: 'We found the map point but could not determine a valid six-digit pincode.',
        });
      }
      const pincode = rawPostcode;
      const areaName = addr.suburb || addr.neighbourhood || addr.residential || addr.city_district || 'Local Area';
      const city = addr.city || addr.state_district || addr.state || '';

      const zone = db.checkPincode(pincode);
      const isServiceable = Boolean(zone?.isServiceable);
      return res.json({
        success: true,
        data: {
          pincode,
          formattedAddress: osmData.display_name || [areaName, city, pincode].filter(Boolean).join(', '),
          areaName,
          city,
          isServiceable,
          zone: zone || null,
          message: isServiceable
            ? `LaundryFresh is available in ${[areaName, city].filter(Boolean).join(', ') || pincode}.`
            : `LaundryFresh is not available in ${[areaName, city].filter(Boolean).join(', ') || pincode} yet.`,
        },
      });
    }
  } catch (osmErr) {
    console.warn('OSM reverse geocode notice:', osmErr);
  }

  // Never invent a customer address or serviceable pincode when providers are unavailable.
  return res.status(503).json({
    success: false,
    message: 'We could not identify this location right now. Please try again or move the map pin.',
  });
});

// GET /api/pincodes/:pincode
router.get('/:pincode', (req: Request, res: Response) => {
  const pin = String(req.params.pincode || '').trim();
  if (!/^\d{6}$/.test(pin)) return validationError(res, 'A valid six-digit pincode is required.');

  const zone = db.checkPincode(pin);
  if (zone && zone.isServiceable) {
    return res.json({
      success: true,
      serviceable: true,
      isServiceable: true,
      data: {
        pincode: pin,
        isServiceable: true,
        serviceable: true,
        areaName: zone.areaName,
        city: zone.city,
        zone,
        message: `Service available in ${zone.areaName}, ${zone.city}`,
      },
    });
  }

  return res.json({
    success: true,
    serviceable: false,
    isServiceable: false,
    data: {
      pincode: pin,
      isServiceable: false,
      serviceable: false,
      message: `Service is currently not available in PIN ${pin}. We operate across 50+ areas in Hyderabad & Secunderabad and are expanding to your area soon!`,
    },
  });
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
