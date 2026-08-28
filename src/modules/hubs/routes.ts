import { Router, type Request, type Response } from 'express';
import { pool, isDbConnected } from '../../lib/mysql';

export const hubsRouter = Router();

export interface InHouseVehicle {
  id: string;
  vehicleType: 'ELECTRIC_VAN' | 'DELIVERY_BIKE' | 'THREE_WHEELER_EV';
  registrationNo: string;
  driverName: string;
  driverPhone: string;
  capacityKg: number;
  status: 'IDLE' | 'OUT_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'MAINTENANCE';
  currentHubId: string;
}

export interface HubBranch {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  address: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  contactEmail: string;
  capacityKgPerDay: number;
  operatingHours: string;
  maxServiceRadiusKm: number;
  baseDistanceKm: number;
  baseDeliveryFare: number;
  perKmFare: number;
  freeDeliveryAbove: number;
  pincodes: string[];
  isActive: boolean;
  inHouseVehicles: InHouseVehicle[];
  createdAt?: string;
  updatedAt?: string;
}

// Initial in-memory seed of Regional Hubs
let hubsStore: HubBranch[] = [
  {
    id: 'hub-rjy-central',
    name: 'Rajahmundry Central Processing Hub',
    code: 'HUB-RJY-01',
    city: 'Rajahmundry',
    state: 'Andhra Pradesh',
    address: 'Plot 18, Industrial Estate, Danavaipeta Main Road, Rajahmundry',
    latitude: 17.0005,
    longitude: 81.804,
    contactPhone: '+91 883 245 0000',
    contactEmail: 'hub.rjy@anushatechnologies.com',
    capacityKgPerDay: 800,
    operatingHours: '06:00 AM - 10:00 PM',
    maxServiceRadiusKm: 35,
    baseDistanceKm: 3,
    baseDeliveryFare: 30,
    perKmFare: 10,
    freeDeliveryAbove: 399,
    pincodes: ['533101', '533102', '533103', '533104', '533105', '533106'],
    isActive: true,
    inHouseVehicles: [
      {
        id: 'VAN-EV-01',
        vehicleType: 'ELECTRIC_VAN',
        registrationNo: 'AP-05-EV-1024',
        driverName: 'Srinivas Rao',
        driverPhone: '+91 98480 12345',
        capacityKg: 150,
        status: 'IDLE',
        currentHubId: 'hub-rjy-central',
      },
      {
        id: 'BIKE-EV-01',
        vehicleType: 'DELIVERY_BIKE',
        registrationNo: 'AP-05-BK-5521',
        driverName: 'Ramu K',
        driverPhone: '+91 98480 67890',
        capacityKg: 40,
        status: 'IDLE',
        currentHubId: 'hub-rjy-central',
      },
    ],
  },
  {
    id: 'hub-hyd-madhapur',
    name: 'Hyderabad Cyber Hub & Processing Plant',
    code: 'HUB-HYD-01',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Survey 64, Hitech City Main Road, Madhapur, Hyderabad',
    latitude: 17.4483,
    longitude: 78.3915,
    contactPhone: '+91 40 4567 8900',
    contactEmail: 'hub.hyd@anushatechnologies.com',
    capacityKgPerDay: 1200,
    operatingHours: '06:00 AM - 11:00 PM',
    maxServiceRadiusKm: 40,
    baseDistanceKm: 3,
    baseDeliveryFare: 40,
    perKmFare: 12,
    freeDeliveryAbove: 499,
    pincodes: ['500081', '500072', '500032', '500033', '500084', '500090'],
    isActive: true,
    inHouseVehicles: [
      {
        id: 'VAN-HYD-01',
        vehicleType: 'ELECTRIC_VAN',
        registrationNo: 'TS-09-EV-8822',
        driverName: 'Kishore Kumar',
        driverPhone: '+91 99887 76655',
        capacityKg: 200,
        status: 'IDLE',
        currentHubId: 'hub-hyd-madhapur',
      },
    ],
  },
];

/**
 * Haversine formula to compute great-circle distance between two GPS coordinates in Kilometers
 */
function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// ─────────────────────────────────────────────────────────────────────────────
// REST API ROUTES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/hubs
 * Returns all active or configured regional fulfillment hubs
 */
hubsRouter.get('/', async (req: Request, res: Response) => {
  try {
    if (isDbConnected && pool) {
      const [rows] = await pool.query('SELECT * FROM hubs ORDER BY created_at DESC');
      if (Array.isArray(rows) && rows.length > 0) {
        const parsed = rows.map((r: any) => ({
          ...r,
          pincodes: typeof r.pincodes === 'string' ? JSON.parse(r.pincodes) : r.pincodes || [],
          inHouseVehicles: typeof r.in_house_vehicles === 'string' ? JSON.parse(r.in_house_vehicles) : r.in_house_vehicles || [],
          capacityKgPerDay: Number(r.capacity_kg_per_day || r.capacityKgPerDay || 500),
          baseDistanceKm: Number(r.base_distance_km || r.baseDistanceKm || 3),
          baseDeliveryFare: Number(r.base_delivery_fare || r.baseDeliveryFare || 30),
          perKmFare: Number(r.per_km_fare || r.perKmFare || 10),
          freeDeliveryAbove: Number(r.free_delivery_above || r.freeDeliveryAbove || 399),
          maxServiceRadiusKm: Number(r.max_service_radius_km || r.maxServiceRadiusKm || 30),
          isActive: Boolean(r.is_active ?? 1),
        }));
        return res.json({ success: true, count: parsed.length, data: parsed });
      }
    }
    return res.json({ success: true, count: hubsStore.length, data: hubsStore });
  } catch (err: any) {
    console.error('Error querying hubs:', err);
    return res.json({ success: true, count: hubsStore.length, data: hubsStore });
  }
});

/**
 * GET /api/hubs/:id
 * Get single hub details
 */
hubsRouter.get('/:id', (req: Request, res: Response) => {
  const hub = hubsStore.find((h) => h.id === req.params.id);
  if (!hub) {
    return res.status(404).json({ success: false, message: 'Hub branch not found' });
  }
  return res.json({ success: true, data: hub });
});

/**
 * POST /api/hubs
 * Create a new regional branch hub with custom delivery rules
 */
hubsRouter.post('/', async (req: Request, res: Response) => {
  const {
    name,
    code,
    city = 'Rajahmundry',
    state = 'Andhra Pradesh',
    address = '',
    latitude = 17.0005,
    longitude = 81.804,
    contactPhone = '+91 883 245 0000',
    contactEmail = 'support@anushatechnologies.com',
    capacityKgPerDay = 500,
    operatingHours = '07:00 AM - 09:00 PM',
    maxServiceRadiusKm = 30,
    baseDistanceKm = 3,
    baseDeliveryFare = 30,
    perKmFare = 10,
    freeDeliveryAbove = 399,
    pincodes = [],
    inHouseVehicles = [],
    isActive = true,
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Hub name is required' });
  }

  const newHub: HubBranch = {
    id: `hub_${Date.now()}`,
    name: name.trim(),
    code: code ? code.trim() : `HUB-${city.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
    city: city.trim(),
    state: state.trim(),
    address: address.trim(),
    latitude: Number(latitude) || 17.0005,
    longitude: Number(longitude) || 81.804,
    contactPhone: contactPhone.trim(),
    contactEmail: contactEmail.trim(),
    capacityKgPerDay: Number(capacityKgPerDay) || 500,
    operatingHours: operatingHours.trim(),
    maxServiceRadiusKm: Number(maxServiceRadiusKm) || 30,
    baseDistanceKm: Number(baseDistanceKm) || 3,
    baseDeliveryFare: Number(baseDeliveryFare) || 30,
    perKmFare: Number(perKmFare) || 10,
    freeDeliveryAbove: Number(freeDeliveryAbove) || 399,
    pincodes: Array.isArray(pincodes) ? pincodes : String(pincodes).split(',').map((p) => p.trim()).filter(Boolean),
    isActive: Boolean(isActive),
    inHouseVehicles: Array.isArray(inHouseVehicles) ? inHouseVehicles : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  hubsStore.unshift(newHub);

  if (isDbConnected && pool) {
    try {
      await pool.query(
        `INSERT INTO hubs (id, name, code, city, state, address, latitude, longitude, contact_phone, contact_email, capacity_kg_per_day, operating_hours, max_service_radius_km, base_distance_km, base_delivery_fare, per_km_fare, free_delivery_above, pincodes, in_house_vehicles, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), address=VALUES(address), updated_at=VALUES(updated_at)`,
        [
          newHub.id,
          newHub.name,
          newHub.code,
          newHub.city,
          newHub.state,
          newHub.address,
          newHub.latitude,
          newHub.longitude,
          newHub.contactPhone,
          newHub.contactEmail,
          newHub.capacityKgPerDay,
          newHub.operatingHours,
          newHub.maxServiceRadiusKm,
          newHub.baseDistanceKm,
          newHub.baseDeliveryFare,
          newHub.perKmFare,
          newHub.freeDeliveryAbove,
          JSON.stringify(newHub.pincodes),
          JSON.stringify(newHub.inHouseVehicles),
          newHub.isActive ? 1 : 0,
          newHub.createdAt,
          newHub.updatedAt,
        ]
      );
    } catch (dbErr) {
      console.warn('Could not insert hub into MySQL:', dbErr);
    }
  }

  return res.status(201).json({ success: true, message: 'Regional Hub added successfully', data: newHub });
});

/**
 * PUT /api/hubs/:id
 * Update an existing regional branch hub
 */
hubsRouter.put('/:id', async (req: Request, res: Response) => {
  const index = hubsStore.findIndex((h) => h.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Hub not found' });
  }

  const existing = hubsStore[index];
  const updated: HubBranch = {
    ...existing,
    ...req.body,
    pincodes: Array.isArray(req.body.pincodes)
      ? req.body.pincodes
      : typeof req.body.pincodes === 'string'
      ? req.body.pincodes.split(',').map((p: string) => p.trim()).filter(Boolean)
      : existing.pincodes,
    updatedAt: new Date().toISOString(),
  };

  hubsStore[index] = updated;

  if (isDbConnected && pool) {
    try {
      await pool.query(
        `UPDATE hubs SET name=?, code=?, city=?, state=?, address=?, latitude=?, longitude=?, contact_phone=?, contact_email=?, capacity_kg_per_day=?, operating_hours=?, max_service_radius_km=?, base_distance_km=?, base_delivery_fare=?, per_km_fare=?, free_delivery_above=?, pincodes=?, in_house_vehicles=?, is_active=?, updated_at=?
         WHERE id=?`,
        [
          updated.name,
          updated.code,
          updated.city,
          updated.state,
          updated.address,
          updated.latitude,
          updated.longitude,
          updated.contactPhone,
          updated.contactEmail,
          updated.capacityKgPerDay,
          updated.operatingHours,
          updated.maxServiceRadiusKm,
          updated.baseDistanceKm,
          updated.baseDeliveryFare,
          updated.perKmFare,
          updated.freeDeliveryAbove,
          JSON.stringify(updated.pincodes),
          JSON.stringify(updated.inHouseVehicles),
          updated.isActive ? 1 : 0,
          updated.updatedAt,
          updated.id,
        ]
      );
    } catch (dbErr) {
      console.warn('Could not update hub in MySQL:', dbErr);
    }
  }

  return res.json({ success: true, message: 'Regional Hub updated successfully', data: updated });
});

/**
 * DELETE /api/hubs/:id
 * Remove a regional hub
 */
hubsRouter.delete('/:id', async (req: Request, res: Response) => {
  const initialLen = hubsStore.length;
  hubsStore = hubsStore.filter((h) => h.id !== req.params.id);

  if (hubsStore.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Hub not found' });
  }

  if (isDbConnected && pool) {
    try {
      await pool.query('DELETE FROM hubs WHERE id=?', [req.params.id]);
    } catch (dbErr) {
      console.warn('Could not delete hub from MySQL:', dbErr);
    }
  }

  return res.json({ success: true, message: 'Regional Hub deleted successfully' });
});

/**
 * POST /api/hubs/calculate-fare
 * Intelligent distance, closest hub routing, and fare calculation engine
 * Body: { customerPincode, customerLat, customerLng, orderTotal, isExpress }
 */
hubsRouter.post('/calculate-fare', (req: Request, res: Response) => {
  const { customerPincode, customerLat, customerLng, orderTotal = 0, isExpress = false } = req.body;

  let matchedHub: HubBranch | null = null;
  let distanceKm = 4.5; // default fallback if GPS unavailable

  // 1. Match by Pincode territory first
  if (customerPincode) {
    const pin = String(customerPincode).trim();
    matchedHub = hubsStore.find((h) => h.isActive && h.pincodes.includes(pin)) || null;
  }

  // 2. If coordinates provided, find closest active Hub using Haversine
  if (customerLat && customerLng) {
    const cLat = Number(customerLat);
    const cLng = Number(customerLng);
    if (!isNaN(cLat) && !isNaN(cLng)) {
      let minDistance = Infinity;
      let closestHub: HubBranch | null = null;

      for (const hub of hubsStore.filter((h) => h.isActive)) {
        const d = calculateHaversineDistanceKm(cLat, cLng, hub.latitude, hub.longitude);
        if (d < minDistance) {
          minDistance = d;
          closestHub = hub;
        }
      }

      if (closestHub) {
        matchedHub = closestHub;
        distanceKm = minDistance;
      }
    }
  }

  // Fallback to first active Hub
  if (!matchedHub) {
    matchedHub = hubsStore.find((h) => h.isActive) || hubsStore[0];
  }

  // 3. Fare Calculation Logic
  const subtotal = Number(orderTotal) || 0;
  const isFreeEligible = subtotal >= matchedHub.freeDeliveryAbove && distanceKm <= 7;

  let deliveryFee = 0;
  let calculationNote = '';

  if (isFreeEligible) {
    deliveryFee = 0;
    calculationNote = `Free Doorstep Delivery (Order ₹${subtotal} >= ₹${matchedHub.freeDeliveryAbove} within 7 KM)`;
  } else if (distanceKm <= matchedHub.baseDistanceKm) {
    deliveryFee = matchedHub.baseDeliveryFare;
    calculationNote = `Base Rate (0–${matchedHub.baseDistanceKm} KM)`;
  } else if (distanceKm <= 7) {
    deliveryFee = matchedHub.baseDeliveryFare + (distanceKm - matchedHub.baseDistanceKm) * matchedHub.perKmFare;
    calculationNote = `Standard Distance Tier (${matchedHub.baseDistanceKm}–7 KM)`;
  } else if (distanceKm <= matchedHub.maxServiceRadiusKm) {
    deliveryFee = matchedHub.baseDeliveryFare + 40 + (distanceKm - 7) * (matchedHub.perKmFare + 2);
    calculationNote = `Extended City Radius (7–${matchedHub.maxServiceRadiusKm} KM)`;
  } else {
    deliveryFee = 180 + (distanceKm - matchedHub.maxServiceRadiusKm) * 15;
    calculationNote = `Outstation Zone (> ${matchedHub.maxServiceRadiusKm} KM)`;
  }

  deliveryFee = Math.round(deliveryFee);
  const expressFee = isExpress ? 199 : 0;
  const totalPickupDeliveryFee = deliveryFee + expressFee;
  const estimatedTurnaroundHours = distanceKm > 15 ? 48 : 24;

  return res.json({
    success: true,
    data: {
      assignedHub: {
        id: matchedHub.id,
        name: matchedHub.name,
        code: matchedHub.code,
        city: matchedHub.city,
        phone: matchedHub.contactPhone,
        address: matchedHub.address,
      },
      distanceKm,
      deliveryFee,
      isFreeDelivery: isFreeEligible,
      freeDeliveryThreshold: matchedHub.freeDeliveryAbove,
      expressFee,
      totalPickupDeliveryFee,
      estimatedTurnaroundHours,
      calculationNote,
    },
  });
});
