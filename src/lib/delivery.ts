import { PricingSettings } from '../types';

export const PINCODE_COORDINATES: Record<string, { lat: number; lng: number; area: string }> = {
  // Hyderabad & Cyberabad Region
  '500072': { lat: 17.4938, lng: 78.3995, area: 'Kukatpally / KPHB' },
  '500085': { lat: 17.4912, lng: 78.4011, area: 'KPHB Colony / JNTU' },
  '500081': { lat: 17.4483, lng: 78.3915, area: 'Madhapur / Hitech City' },
  '500084': { lat: 17.4699, lng: 78.3578, area: 'Kondapur / Botanical Garden' },
  '500032': { lat: 17.4401, lng: 78.3489, area: 'Gachibowli / Financial District' },
  '500104': { lat: 17.4200, lng: 78.3680, area: 'Siri Sampada Arcade 1 / Khajaguda / Gachibowli' },
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

export interface LaundryHubSummary {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  baseDistanceKm: number;
  baseDeliveryFare: number;
  perKmFare: number;
  freeDeliveryAbove: number;
  maxServiceRadiusKm: number;
  pincodes: string[];
}

export const LAUNDRY_HUBS: LaundryHubSummary[] = [
  {
    id: 'HUB-HYD-01',
    name: 'Hyderabad Cyber Hub & Processing Plant',
    code: 'HUB-HYD-01',
    city: 'Hyderabad',
    address: 'Survey 64, Hitech City Main Road, Madhapur, Hyderabad - 500081 (Serving Khajaguda / Gachibowli)',
    latitude: 17.4483,
    longitude: 78.3915,
    baseDistanceKm: 3,
    baseDeliveryFare: 30,
    perKmFare: 10,
    freeDeliveryAbove: 499,
    maxServiceRadiusKm: 35,
    pincodes: [
      '500081','500032','500104','500084','500072','500085','500033','500034','500089','500075',
      '500049','500050','500090','500018','500082','500016','500003','500026','500009',
      '500015','500011','500062','500047','500040','500056','500014','500055','500037',
      '500008','500028','500004','500001','500029','500020','500044','500007','500017',
      '500039','500076','500068','500074','500070','500035','500036','500059','500053',
      '500077','500030','500052','500088','500043'
    ],
  },
  {
    id: 'HUB-HYD-02',
    name: 'Anusha Laundry / Kukatpally Hub',
    code: 'HUB-HYD-02',
    city: 'Hyderabad',
    address: 'Anusha Bazaar, Kukatpally, Hyderabad - 500072',
    latitude: 17.4929894,
    longitude: 78.4144426,
    baseDistanceKm: 3,
    baseDeliveryFare: 30,
    perKmFare: 10,
    freeDeliveryAbove: 499,
    maxServiceRadiusKm: 25,
    pincodes: ['500072', '500085', '500090', '500049', '500018', '500037', '500055', '500014', '500011', '500040', '500076', '500062', '500047'],
  },
  {
    id: 'HUB-RJY-01',
    name: 'Rajahmundry Central Processing Hub',
    code: 'HUB-RJY-01',
    city: 'Rajahmundry',
    address: 'Plot 18, Industrial Estate, Danavaipeta Main Road, Rajahmundry, AP - 533103',
    latitude: 17.0005,
    longitude: 81.8040,
    baseDistanceKm: 3,
    baseDeliveryFare: 30,
    perKmFare: 10,
    freeDeliveryAbove: 499,
    maxServiceRadiusKm: 35,
    pincodes: ['533101', '533102', '533103', '533104', '533105', '533106', '533001', '533002', '533003', '533004'],
  },
  {
    id: 'HUB-KAK-01',
    name: 'Kakinada Port Hub',
    code: 'HUB-KAK-01',
    city: 'Kakinada',
    address: 'Near Bhanugudi Junction, Cinema Road, Kakinada, AP - 533003',
    latitude: 16.9890,
    longitude: 82.2474,
    baseDistanceKm: 3,
    baseDeliveryFare: 30,
    perKmFare: 10,
    freeDeliveryAbove: 499,
    maxServiceRadiusKm: 30,
    pincodes: ['533005', '533006', '533007'],
  },
  {
    id: 'HUB-BGL-01',
    name: 'Bangalore HSR Hub',
    code: 'HUB-BGL-01',
    city: 'Bengaluru',
    address: 'Sector 2, 27th Main Rd, HSR Layout, Bengaluru, KA - 560102',
    latitude: 12.9121,
    longitude: 77.6446,
    baseDistanceKm: 3,
    baseDeliveryFare: 30,
    perKmFare: 10,
    freeDeliveryAbove: 499,
    maxServiceRadiusKm: 30,
    pincodes: ['560034', '560102', '560095', '560068', '560076'],
  },
];

export function findNearestLaundryHub(
  lat?: number,
  lng?: number,
  pincode?: string,
  hubs: LaundryHubSummary[] = LAUNDRY_HUBS
): LaundryHubSummary {
  const cleanPin = pincode ? String(pincode).trim() : '';

  if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
    if (cleanPin) {
      const territoryHubs = hubs.filter((h) => h.pincodes.includes(cleanPin));
      if (territoryHubs.length > 0) {
        let bestHub = territoryHubs[0];
        let minD = haversineKm(bestHub.latitude, bestHub.longitude, lat, lng);
        for (let i = 1; i < territoryHubs.length; i++) {
          const d = haversineKm(territoryHubs[i].latitude, territoryHubs[i].longitude, lat, lng);
          if (d < minD) {
            minD = d;
            bestHub = territoryHubs[i];
          }
        }
        return bestHub;
      }
    }

    let closestHub = hubs[0];
    let minDistance = haversineKm(closestHub.latitude, closestHub.longitude, lat, lng);
    for (let i = 1; i < hubs.length; i++) {
      const d = haversineKm(hubs[i].latitude, hubs[i].longitude, lat, lng);
      if (d < minDistance) {
        minDistance = d;
        closestHub = hubs[i];
      }
    }
    return closestHub;
  }

  if (cleanPin) {
    const matched = hubs.find((h) => h.pincodes.includes(cleanPin));
    if (matched) return matched;
  }

  return hubs[0];
}

export interface DeliveryCalculationParams {
  customerLat?: number;
  customerLng?: number;
  customerPincode?: string;
  subtotal?: number;
  isExpress?: boolean;
  expressTier?: 'REGULAR' | 'EXPRESS_24H' | 'SAME_DAY';
  settings: PricingSettings;
  hubId?: string;
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
  hubId?: string;
  hubName?: string;
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
    hubId,
  } = params;

  // Resolve customer coordinates from GPS or central pincode database
  let targetLat: number | undefined =
    typeof customerLat === 'number' && !isNaN(customerLat) && customerLat !== 0 ? customerLat : undefined;
  let targetLng: number | undefined =
    typeof customerLng === 'number' && !isNaN(customerLng) && customerLng !== 0 ? customerLng : undefined;
  let resolvedArea: string | undefined;
  let hasGps = Boolean(targetLat && targetLng);

  if ((!targetLat || !targetLng) && customerPincode) {
    const cleanPin = String(customerPincode).trim();
    const pinData = PINCODE_COORDINATES[cleanPin];
    if (pinData) {
      targetLat = pinData.lat;
      targetLng = pinData.lng;
      resolvedArea = pinData.area;
      hasGps = true;
    }
  }

  // Find nearest laundry hub based on location and pincode
  const servicingHub = hubId
    ? LAUNDRY_HUBS.find((h) => h.id === hubId || h.code === hubId) || findNearestLaundryHub(targetLat, targetLng, customerPincode)
    : findNearestLaundryHub(targetLat, targetLng, customerPincode);

  const hubLat = servicingHub.latitude;
  const hubLng = servicingHub.longitude;
  const baseKm = servicingHub.baseDistanceKm ?? settings.baseDistanceKm ?? 3;
  const stdFee = servicingHub.baseDeliveryFare ?? settings.standardDeliveryFee ?? 30;
  const baseFee = servicingHub.baseDeliveryFare ?? settings.baseDeliveryFee ?? stdFee;
  const perKm = servicingHub.perKmFare ?? settings.perKmRateAfterBase ?? 10;
  const freeThreshold = servicingHub.freeDeliveryAbove ?? settings.freeDeliveryThreshold ?? 499;
  const maxRadius = servicingHub.maxServiceRadiusKm ?? settings.maxServiceRadiusKm ?? 35;

  let distanceKm = 0;
  if (targetLat && targetLng) {
    distanceKm = parseFloat(haversineKm(hubLat, hubLng, targetLat, targetLng).toFixed(1));
  } else {
    distanceKm = baseKm;
  }

  const isFreeDelivery = subtotal >= freeThreshold;
  let deliveryFee = 0;
  let breakdown = '';
  const mode = settings.deliveryCalculationMode ?? 'DISTANCE_BASED';

  if (isFreeDelivery) {
    deliveryFee = 0;
    breakdown = `🎉 Free delivery unlocked (Order ₹${subtotal} ≥ ₹${freeThreshold}) • Distance: ${distanceKm} km from ${servicingHub.name}`;
  } else if (mode === 'ZONE_BASED' && settings.distanceTiers && settings.distanceTiers.length > 0) {
    const tiers = [...settings.distanceTiers].sort((a, b) => a.maxKm - b.maxKm);
    const matched = tiers.find((t) => distanceKm <= t.maxKm);
    if (matched) {
      deliveryFee = matched.fee;
      breakdown = `Distance ${distanceKm} km from ${servicingHub.name} → Tier ≤${matched.maxKm} km: ₹${deliveryFee}`;
    } else {
      const lastTier = tiers[tiers.length - 1];
      const extraKm = parseFloat((distanceKm - lastTier.maxKm).toFixed(1));
      deliveryFee = Math.round(lastTier.fee + extraKm * perKm);
      breakdown = `Distance ${distanceKm} km from ${servicingHub.name} → Last tier (≤${lastTier.maxKm} km): ₹${lastTier.fee} + ${extraKm} km × ₹${perKm}/km = ₹${deliveryFee}`;
    }
  } else {
    // DISTANCE_BASED: base distance fee + per-km beyond base distance from hub
    if (distanceKm <= baseKm) {
      deliveryFee = baseFee;
      breakdown = `📍 Distance: ${distanceKm} km from ${servicingHub.name} • Base ${baseKm} km slab (₹${baseFee})`;
    } else {
      const extraKm = parseFloat((distanceKm - baseKm).toFixed(1));
      deliveryFee = Math.round(baseFee + extraKm * perKm);
      breakdown = `📍 Distance: ${distanceKm} km from ${servicingHub.name} • Base ${baseKm} km (₹${baseFee}) + ${extraKm} km × ₹${perKm}/km = ₹${deliveryFee}`;
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
    storeName: servicingHub.name || settings.storeName || 'LaundryFresh Central Hub',
    storeAddress: servicingHub.address || settings.storeAddress || 'Madhapur, Hyderabad',
    storeLatitude: hubLat,
    storeLongitude: hubLng,
    maxServiceRadiusKm: maxRadius,
    hubId: servicingHub.id,
    hubName: servicingHub.name,
  };
}
