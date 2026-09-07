import { PricingSettings } from '../types';

export const PINCODE_COORDINATES: Record<string, { lat: number; lng: number; area: string }> = {
  // Hyderabad & Cyberabad Region
  '500072': { lat: 17.4938, lng: 78.3995, area: 'Kukatpally / KPHB' },
  '500085': { lat: 17.4912, lng: 78.4011, area: 'KPHB Colony / JNTU' },
  '500081': { lat: 17.4483, lng: 78.3915, area: 'Madhapur / Hitech City' },
  '500084': { lat: 17.4699, lng: 78.3578, area: 'Kondapur / Botanical Garden' },
  '500032': { lat: 17.4401, lng: 78.3489, area: 'Gachibowli / Financial District' },
  '500033': { lat: 17.4319, lng: 78.4073, area: 'Jubilee Hills' },
  '500034': { lat: 17.4156, lng: 78.4357, area: 'Banjara Hills' },
  '500018': { lat: 17.4578, lng: 78.4428, area: 'Erragadda / Sanath Nagar' },
  '500016': { lat: 17.4447, lng: 78.4664, area: 'Begumpet' },
  '500003': { lat: 17.4399, lng: 78.4983, area: 'Secunderabad' },
  '500082': { lat: 17.4265, lng: 78.4533, area: 'Somajiguda / Punjagutta' },
  '500090': { lat: 17.5186, lng: 78.3845, area: 'Nizampet / Pragathi Nagar' },
  '500049': { lat: 17.4968, lng: 78.3614, area: 'Miyapur' },
  '500055': { lat: 17.5180, lng: 78.4350, area: 'Quthbullapur / Chintal' },
  '500038': { lat: 17.4428, lng: 78.4485, area: 'Ameerpet / SR Nagar' },
  '500079': { lat: 17.3457, lng: 78.5322, area: 'Karmanghat / LB Nagar' },
  '500008': { lat: 17.3970, lng: 78.4398, area: 'Mehdipatnam' },
  '500028': { lat: 17.3850, lng: 78.4470, area: 'Masab Tank' },
  '500019': { lat: 17.4520, lng: 78.3880, area: 'HITEC City Phase 2' },
  '500050': { lat: 17.4870, lng: 78.3180, area: 'Chandanagar / Lingampally' },
  '500089': { lat: 17.3870, lng: 78.3640, area: 'Manikonda / Puppalaguda' },
  '500075': { lat: 17.3750, lng: 78.3290, area: 'Narsingi / Gandipet' },

  // Andhra Pradesh - Rajahmundry Hub Network
  '533101': { lat: 16.9891, lng: 81.7840, area: 'Rajahmundry Central / Main Road' },
  '533102': { lat: 17.0005, lng: 81.7800, area: 'Aryapuram / Danavaipeta' },
  '533103': { lat: 17.0200, lng: 81.8000, area: 'Danavaipeta / Lalitha Nagar' },
  '533104': { lat: 17.0150, lng: 81.8100, area: 'Morampudi / Prakash Nagar' },
  '533105': { lat: 16.9750, lng: 81.7900, area: 'Innespeta / Kambala Cheruvu' },
  '533106': { lat: 16.9600, lng: 81.8200, area: 'Dowleswaram / Cotton Barrage' },
};

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface DeliveryCalculationParams {
  customerLat?: number;
  customerLng?: number;
  customerPincode?: string;
  subtotal?: number;
  isExpress?: boolean;
  expressTier?: 'REGULAR' | 'EXPRESS_24H' | 'SAME_DAY';
  settings: PricingSettings;
}

export interface DeliveryCalculationResult {
  deliveryFee: number;
  distanceKm: number;
  hasGps: boolean;
  resolvedArea?: string;
  isFreeDelivery: boolean;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  baseDistanceKm: number;
  baseDeliveryFee: number;
  perKmRateAfterBase: number;
  expressFee: number;
  expressDeliveryFee: number;
  sameDayDeliveryFee: number;
  taxPercentage: number;
  isGstEnabled: boolean;
  taxAmount: number;
  subtotal: number;
  finalTotal: number;
  breakdown: string;
  storeName: string;
  storeAddress: string;
  storeLatitude: number;
  storeLongitude: number;
  maxServiceRadiusKm: number;
}

export function computeDeliveryFee(params: DeliveryCalculationParams): DeliveryCalculationResult {
  const {
    customerLat,
    customerLng,
    customerPincode,
    subtotal = 0,
    isExpress = false,
    expressTier = 'REGULAR',
    settings,
  } = params;

  const storeLat = settings.storeLatitude ?? 17.4929894;
  const storeLng = settings.storeLongitude ?? 78.4144426;
  const baseKm = settings.baseDistanceKm ?? 3;
  const stdFee = settings.standardDeliveryFee ?? 30;
  const baseFee = settings.baseDeliveryFee ?? stdFee;
  const perKm = settings.perKmRateAfterBase ?? 10;
  const freeThreshold = settings.freeDeliveryThreshold ?? 499;
  const maxRadius = settings.maxServiceRadiusKm ?? 35;

  let distanceKm = 0;
  let hasGps = false;
  let resolvedArea: string | undefined;

  // 1. Direct device GPS coordinates
  if (
    typeof customerLat === 'number' &&
    typeof customerLng === 'number' &&
    !isNaN(customerLat) &&
    !isNaN(customerLng) &&
    customerLat !== 0 &&
    customerLng !== 0
  ) {
    hasGps = true;
    distanceKm = parseFloat(haversineKm(storeLat, storeLng, customerLat, customerLng).toFixed(2));
  } else if (customerPincode) {
    // 2. Resolve coordinates from central pincode database
    const cleanPin = String(customerPincode).trim();
    const pinData = PINCODE_COORDINATES[cleanPin];
    if (pinData) {
      resolvedArea = pinData.area;
      distanceKm = parseFloat(haversineKm(storeLat, storeLng, pinData.lat, pinData.lng).toFixed(2));
    } else {
      // Unmapped serviceable pincode: default estimated local hub distance
      distanceKm = baseKm;
    }
  } else {
    distanceKm = baseKm;
  }

  // Cap distance for realistic delivery calculation if within service radius
  const isFreeDelivery = subtotal >= freeThreshold;
  let deliveryFee = 0;
  let breakdown = '';
  const mode = settings.deliveryCalculationMode ?? 'DISTANCE_BASED';

  if (isFreeDelivery) {
    deliveryFee = 0;
    breakdown = `Free delivery unlocked (Order ₹${subtotal} ≥ ₹${freeThreshold}) • Distance: ${distanceKm} km from Hub`;
  } else if (mode === 'ZONE_BASED' && settings.distanceTiers && settings.distanceTiers.length > 0) {
    const tiers = [...settings.distanceTiers].sort((a, b) => a.maxKm - b.maxKm);
    const matched = tiers.find((t) => distanceKm <= t.maxKm);
    if (matched) {
      deliveryFee = matched.fee;
      breakdown = `Distance ${distanceKm} km from Hub → Tier ≤${matched.maxKm} km: ₹${deliveryFee}`;
    } else {
      const lastTier = tiers[tiers.length - 1];
      const extraKm = parseFloat((distanceKm - lastTier.maxKm).toFixed(2));
      deliveryFee = Math.round(lastTier.fee + extraKm * perKm);
      breakdown = `Distance ${distanceKm} km from Hub → Last tier (≤${lastTier.maxKm} km): ₹${lastTier.fee} + ${extraKm} km × ₹${perKm}/km = ₹${deliveryFee}`;
    }
  } else {
    // DISTANCE_BASED: base distance fee + per-km beyond base distance
    if (distanceKm <= baseKm) {
      deliveryFee = baseFee;
      breakdown = `Delivery fee: ₹${deliveryFee} for ${distanceKm} km from Hub (Base ${baseKm} km slab)`;
    } else {
      const extraKm = parseFloat((distanceKm - baseKm).toFixed(2));
      deliveryFee = Math.round(baseFee + extraKm * perKm);
      breakdown = `Distance: ${distanceKm} km from Hub • Base ${baseKm} km (₹${baseFee}) + ${extraKm} km × ₹${perKm}/km = ₹${deliveryFee}`;
    }
  }

  // Express tier surcharge
  const sameDayFee = settings.sameDayDeliveryFee ?? ((settings.expressDeliveryFee ?? 80) * 2);
  const expressFee = expressTier === 'SAME_DAY'
    ? sameDayFee
    : (expressTier === 'EXPRESS_24H' || isExpress)
    ? (settings.expressDeliveryFee ?? 80)
    : 0;

  // Taxes
  const isGstEnabled = settings.isGstEnabled !== false;
  const taxPercentage = isGstEnabled ? (settings.taxPercentage ?? 5) : 0;
  const taxableAmount = Math.max(0, subtotal + deliveryFee + expressFee);
  const taxAmount = Number((taxableAmount * (taxPercentage / 100)).toFixed(2));
  const finalTotal = Number((taxableAmount + taxAmount).toFixed(2));

  return {
    deliveryFee,
    distanceKm,
    hasGps,
    resolvedArea,
    isFreeDelivery,
    freeDeliveryThreshold: freeThreshold,
    standardDeliveryFee: stdFee,
    baseDistanceKm: baseKm,
    baseDeliveryFee: baseFee,
    perKmRateAfterBase: perKm,
    expressFee,
    expressDeliveryFee: settings.expressDeliveryFee ?? 80,
    sameDayDeliveryFee: sameDayFee,
    taxPercentage,
    isGstEnabled,
    taxAmount,
    subtotal,
    finalTotal,
    breakdown,
    storeName: settings.storeName || 'LaundryFresh Central Hub',
    storeAddress: settings.storeAddress || 'Kukatpally, Hyderabad - 500072',
    storeLatitude: storeLat,
    storeLongitude: storeLng,
    maxServiceRadiusKm: maxRadius,
  };
}
