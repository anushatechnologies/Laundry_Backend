import { randomUUID } from 'crypto';
import { referralRewardDiscount } from '../modules/referrals/service';
import {
  ServiceCategory,
  Service,
  Order,
  Coupon,
  SubscriptionPlan,
  PincodeZone,
  StaffMember,
  LaundryBatch,
  OrderStatus,
  ClothType,
  ServiceMaster,
  ServicePriceItem,
  PricingSettings,
  ClothCategoryTag,
  BulkPricingItem,
  BulkLaundryType,
  Banner,
  Subcategory,
  CustomerPreferences,
  DEFAULT_CUSTOMER_PREFERENCES,
} from '../types';
import { pool, isDbConnected } from './mysql';

export const INITIAL_CATEGORIES: ServiceCategory[] = [];
export const INITIAL_SUBCATEGORIES: Subcategory[] = [];
export const INITIAL_CLOTH_TYPES: ClothType[] = [];
export const INITIAL_SERVICE_MASTERS: ServiceMaster[] = [];
export const INITIAL_SERVICE_PRICE_MATRIX: ServicePriceItem[] = [];

export const INITIAL_PRICING_SETTINGS: PricingSettings = {
  taxPercentage: 5,
  minOrderValue: 299,
  freeDeliveryThreshold: 499,
  standardDeliveryFee: 30,
  expressDeliveryFee: 80,
  sameDayDeliveryFee: 160,
  extraKgPrice: 40,
  isGstEnabled: true,
  deliveryCalculationMode: 'DISTANCE_BASED',
  baseDistanceKm: 3,
  baseDeliveryFee: 30,
  perKmRateAfterBase: 10,
  maxServiceRadiusKm: 35,
  storeName: 'Anusha Laundry Central Hub',
  storeAddress: 'Anusha Bazaar, Kukatpally, Hyderabad - 500072',
  storeLatitude: 17.4929894,
  storeLongitude: 78.4144426,
  storePhone: '+91 40 4567 8901',
  distanceTiers: [
    { minKm: 0, maxKm: 3, fee: 30 },
    { minKm: 3, maxKm: 7, fee: 50 },
    { minKm: 7, maxKm: 15, fee: 90 },
    { minKm: 15, maxKm: 25, fee: 150 },
    { minKm: 25, maxKm: 35, fee: 220 },
  ],
};

export const INITIAL_SERVICES: Service[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_COUPONS: Coupon[] = [
  { id: 'cp-first50', code: 'FIRST50', title: '50% OFF (First Order)', description: '50% discount up to ₹250 on your first laundry order', discountType: 'PERCENTAGE', discountValue: 50, minOrderValue: 199, maxDiscountCap: 250, firstOrderOnly: true, expiryDate: '2027-12-31', usageCount: 2310, isActive: true },
  { id: 'cp-silkspa', code: 'SILKSPA', title: '₹150 OFF Silk & Luxury Care', description: 'Flat ₹150 off on orders above ₹499', discountType: 'FLAT', discountValue: 150, minOrderValue: 499, firstOrderOnly: false, expiryDate: '2027-12-31', usageCount: 890, isActive: true },
  { id: 'cp-bulksave', code: 'BULKSAVE', title: '₹100 OFF Bulk Laundry', description: 'Flat ₹100 off on 5KG+ laundry orders above ₹399', discountType: 'FLAT', discountValue: 100, minOrderValue: 399, firstOrderOnly: false, expiryDate: '2027-12-31', usageCount: 1140, isActive: true },
  { id: 'cp-1', code: 'WELCOME100', title: 'Flat ₹100 Off First Order', description: 'Flat ₹100 discount above ₹299', discountType: 'FLAT', discountValue: 100, minOrderValue: 299, firstOrderOnly: true, expiryDate: '2027-12-31', usageCount: 1420, isActive: true },
  { id: 'cp-2', code: 'WEEKEND20', title: '20% Weekend Savings', description: 'Save 20% up to ₹150', discountType: 'PERCENTAGE', discountValue: 20, minOrderValue: 350, maxDiscountCap: 150, firstOrderOnly: false, expiryDate: '2027-12-31', usageCount: 654, isActive: true }
];

export const INITIAL_PINCODES: PincodeZone[] = [
  // --- HYDERABAD & SECUNDERABAD (50 Key Localities & Tech Hubs) ---
  { pincode: '500081', areaName: 'Hitec City / Madhapur / Cyber Towers', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500032', areaName: 'Gachibowli / Financial District / Nanakramguda', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500104', areaName: 'Siri Sampada Arcade 1 / Khajaguda / Gachibowli', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500084', areaName: 'Kondapur / Kothaguda / Botanical Garden', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500072', areaName: 'Kukatpally / KPHB Colony (Phase 1-6)', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500085', areaName: 'KPHB Phase 7-9 / JNTU Road', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500033', areaName: 'Jubilee Hills / Film Nagar / Road No 36', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500034', areaName: 'Banjara Hills (Road 1-14) / Panjagutta', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500089', areaName: 'Manikonda / Puppalguda / Alkapur Township', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500075', areaName: 'Gandipet / Kokapet / Narsingi', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500049', areaName: 'Miyapur / Chandanagar / Gangaram', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500050', areaName: 'BHEL / Lingampally / Tara Nagar', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500090', areaName: 'Nizampet / Pragathi Nagar', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500018', areaName: 'Ameerpet / SR Nagar / Sanathnagar', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500082', areaName: 'Somajiguda / Raj Bhavan Road / Erramanzil', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500016', areaName: 'Begumpet / Prakash Nagar / Mayur Marg', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500003', areaName: 'Secunderabad / MG Road / Paradise', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500026', areaName: 'Marredpally (East & West) / Shenoy Nagar', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500009', areaName: 'Bowenpally / Hasmathpet / Manovikas Nagar', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500015', areaName: 'Karkhana / Trimulgherry / Gunrock', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500011', areaName: 'Alwal / Lothkunta / Old Alwal', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500062', areaName: 'ECIL / AS Rao Nagar / Dr AS Rao Nagar', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500047', areaName: 'Sainikpuri / Vayupuri / Yapral', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500040', areaName: 'Malkajgiri / Safilguda / Anandbagh', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500056', areaName: 'Dammaiguda / Nagaram / Keesara', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500014', areaName: 'Kompally / Jeedimetla Village / Petbasheerabad', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500055', areaName: 'Chintal / Quthbullapur / Suchitra', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500037', areaName: 'Balanagar / Moosapet / Fathenagar', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500008', areaName: 'Mehdipatnam / Tolichowki / Shaikpet', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500028', areaName: 'Masab Tank / AC Guards / Khairatabad', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500004', areaName: 'Nampally / Red Hills / Bazar Ghat', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500001', areaName: 'Abids / Koti / Gunfoundry / Sultan Bazaar', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500029', areaName: 'Himayatnagar / Liberty / Narayanguda', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500020', areaName: 'Domalguda / Ashok Nagar / Chikkadpally', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500044', areaName: 'Vidyanagar / Nallakunta / DD Colony', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500007', areaName: 'Tarnaka / Habsiguda / Osmania University', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500017', areaName: 'Moula Ali / Lalaguda / Industrial Area', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500039', areaName: 'Uppal / Ramanthapur / Survey of India', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500076', areaName: 'Boduppal / Peerzadiguda / Medipally', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500068', areaName: 'Nagole / Alkapuri / Snehapuri Colony', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500074', areaName: 'LB Nagar / Mansoorabad / Rock Town', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500070', areaName: 'Vanasthalipuram / Hayathnagar / Auto Nagar', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500035', areaName: 'Kothapet / Saroornagar / Gaddiannaram', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500036', areaName: 'Dilsukhnagar / Chaitanyapuri / P&T Colony', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500059', areaName: 'Saidabad / Champapet / Santoshnagar', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500053', areaName: 'Chandrayangutta / Bandlaguda / Falaknuma', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500077', areaName: 'Attapur / Hyderguda / Upparpally', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500030', areaName: 'Rajendranagar / Budvel / Shivrampally', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500052', areaName: 'Shamshabad / RGIA Airport Zone', city: 'Hyderabad', isServiceable: true, standardFee: 50, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500088', areaName: 'Pocharam / Ghatkesar / Infosys SEZ', city: 'Hyderabad', isServiceable: true, standardFee: 50, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500043', areaName: 'Bandlaguda Jagir / Sun City / Peerancheru', city: 'Hyderabad', isServiceable: true, standardFee: 30, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
];

export const INITIAL_STAFF: StaffMember[] = [
  { id: 'stf-1', name: 'Rajesh Kumar', email: 'rajesh.admin@laundryfresh.com', phone: '+91 98765 43210', role: 'SUPER_ADMIN', assignedFacility: 'Central Hub - Koramangala', isActive: true },
  { id: 'stf-4', name: 'Vikram Singh (Pickup Agent)', email: 'vikram.rider@laundryfresh.com', phone: '+91 98450 11223', role: 'PICKUP_AGENT', assignedZone: 'HSR & Koramangala Zone', isActive: true, rating: 4.9, ordersProcessed: 320 },
  { id: 'stf-5', name: 'Suresh Patil (Delivery Agent)', email: 'suresh.rider@laundryfresh.com', phone: '+91 98450 44556', role: 'DELIVERY_AGENT', assignedZone: 'Indiranagar & CBD Zone', isActive: true, rating: 4.85, ordersProcessed: 275 }
];

export const INITIAL_BULK_PRICING: BulkPricingItem[] = [
  // Wash & Fold (srv-m-wash-fold)
  { id: 'bp-wf-1', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', weightKg: 1, regularPrice: 80, expressPrice: 160, regularTatHours: 48, expressTatHours: 12, isActive: true },
  { id: 'bp-wf-2', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', weightKg: 2, regularPrice: 150, expressPrice: 300, regularTatHours: 48, expressTatHours: 12, isActive: true },
  { id: 'bp-wf-3', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', weightKg: 3, regularPrice: 210, expressPrice: 420, regularTatHours: 48, expressTatHours: 12, isActive: true },
  { id: 'bp-wf-4', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', weightKg: 4, regularPrice: 260, expressPrice: 520, regularTatHours: 48, expressTatHours: 12, isActive: true },
  { id: 'bp-wf-5', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', weightKg: 5, regularPrice: 300, expressPrice: 600, regularTatHours: 48, expressTatHours: 12, isActive: true },
  { id: 'bp-wf-10', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', weightKg: 10, regularPrice: 550, expressPrice: 1100, regularTatHours: 48, expressTatHours: 12, isActive: true },

  // Wash & Steam Iron (srv-m-wash-iron)
  { id: 'bp-wi-1', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', weightKg: 1, regularPrice: 120, expressPrice: 220, regularTatHours: 36, expressTatHours: 12, isActive: true },
  { id: 'bp-wi-2', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', weightKg: 2, regularPrice: 220, expressPrice: 400, regularTatHours: 36, expressTatHours: 12, isActive: true },
  { id: 'bp-wi-3', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', weightKg: 3, regularPrice: 315, expressPrice: 580, regularTatHours: 36, expressTatHours: 12, isActive: true },
  { id: 'bp-wi-4', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', weightKg: 4, regularPrice: 400, expressPrice: 720, regularTatHours: 36, expressTatHours: 12, isActive: true },
  { id: 'bp-wi-5', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', weightKg: 5, regularPrice: 475, expressPrice: 850, regularTatHours: 36, expressTatHours: 12, isActive: true },
  { id: 'bp-wi-10', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', weightKg: 10, regularPrice: 880, expressPrice: 1550, regularTatHours: 36, expressTatHours: 12, isActive: true },

  // Express Laundry (srv-m-express)
  { id: 'bp-ex-1', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-express', serviceName: 'Express Laundry', weightKg: 1, regularPrice: 160, expressPrice: 240, regularTatHours: 12, expressTatHours: 6, isActive: true },
  { id: 'bp-ex-2', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-express', serviceName: 'Express Laundry', weightKg: 2, regularPrice: 300, expressPrice: 450, regularTatHours: 12, expressTatHours: 6, isActive: true },
  { id: 'bp-ex-3', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-express', serviceName: 'Express Laundry', weightKg: 3, regularPrice: 420, expressPrice: 630, regularTatHours: 12, expressTatHours: 6, isActive: true },
  { id: 'bp-ex-4', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-express', serviceName: 'Express Laundry', weightKg: 4, regularPrice: 520, expressPrice: 780, regularTatHours: 12, expressTatHours: 6, isActive: true },
  { id: 'bp-ex-5', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-express', serviceName: 'Express Laundry', weightKg: 5, regularPrice: 600, expressPrice: 900, regularTatHours: 12, expressTatHours: 6, isActive: true },
  { id: 'bp-ex-10', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-express', serviceName: 'Express Laundry', weightKg: 10, regularPrice: 1100, expressPrice: 1650, regularTatHours: 12, expressTatHours: 6, isActive: true },

  // Premium Care (srv-m-premium)
  { id: 'bp-pr-1', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-premium', serviceName: 'Premium Care', weightKg: 1, regularPrice: 180, expressPrice: 280, regularTatHours: 72, expressTatHours: 24, isActive: true },
  { id: 'bp-pr-2', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-premium', serviceName: 'Premium Care', weightKg: 2, regularPrice: 340, expressPrice: 520, regularTatHours: 72, expressTatHours: 24, isActive: true },
  { id: 'bp-pr-3', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-premium', serviceName: 'Premium Care', weightKg: 3, regularPrice: 480, expressPrice: 740, regularTatHours: 72, expressTatHours: 24, isActive: true },
  { id: 'bp-pr-4', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-premium', serviceName: 'Premium Care', weightKg: 4, regularPrice: 600, expressPrice: 900, regularTatHours: 72, expressTatHours: 24, isActive: true },
  { id: 'bp-pr-5', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-premium', serviceName: 'Premium Care', weightKg: 5, regularPrice: 700, expressPrice: 1050, regularTatHours: 72, expressTatHours: 24, isActive: true },
  { id: 'bp-pr-10', laundryType: 'MIXED_LAUNDRY', serviceId: 'srv-m-premium', serviceName: 'Premium Care', weightKg: 10, regularPrice: 1300, expressPrice: 1950, regularTatHours: 72, expressTatHours: 24, isActive: true },
];

export const INITIAL_SUBSCRIPTION_PLANS: any[] = [
  {
    id: 'sub-basic-1m',
    name: 'Basic Plan (1 Month)',
    slug: 'basic-1m',
    durationMonths: 1,
    price: 999,
    originalPrice: 1299,
    validityDays: 30,
    includedKg: 20,
    freePickupDelivery: true,
    priorityService: false,
    maxFamilyMembers: 1,
    features: [
      '20 KG Wash & Fold / Wash & Iron per month',
      'Free Doorstep Pickup & Delivery',
      'Turnaround in 36 Hours',
      'Rollover unused KG (up to 5 KG)',
      'Standard eco-detergents & softeners',
    ],
    popular: false,
    isActive: true,
  },
  {
    id: 'sub-premium-1m',
    name: 'Premium Plan (1 Month)',
    slug: 'premium-1m',
    durationMonths: 1,
    price: 1999,
    originalPrice: 2499,
    validityDays: 30,
    includedKg: 50,
    freePickupDelivery: true,
    priorityService: true,
    maxFamilyMembers: 2,
    features: [
      '50 KG Wash & Fold / Steam Iron per month',
      'Free Priority Pickup & Delivery',
      'Fast 24-Hour Express Turnaround',
      'Rollover unused KG (up to 15 KG)',
      '1 Free Blazer/Saree Dry Clean / month',
      'Antibacterial sanitization wash',
    ],
    popular: true,
    isActive: true,
  },
  {
    id: 'sub-family-3m',
    name: 'Quarterly Family Saver (3 Months)',
    slug: 'family-3m',
    durationMonths: 3,
    price: 4999,
    originalPrice: 6999,
    validityDays: 90,
    includedKg: 150,
    freePickupDelivery: true,
    priorityService: true,
    maxFamilyMembers: 4,
    features: [
      '150 KG Total Allowance (50 KG / Month)',
      'Save ₹2,000 on quarterly commitment',
      'VIP Priority Slots & 12h Emergency Express',
      'Free pickup & delivery up to 24 visits',
      '3 Free Dry Clean vouchers included',
      'Dedicated Customer Support Concierge',
    ],
    popular: true,
    isActive: true,
  },
  {
    id: 'sub-annual-12m',
    name: 'Annual Ultimate Care (12 Months)',
    slug: 'annual-12m',
    durationMonths: 12,
    price: 14999,
    originalPrice: 23999,
    validityDays: 365,
    includedKg: 600,
    freePickupDelivery: true,
    priorityService: true,
    maxFamilyMembers: 5,
    features: [
      '600 KG Total Allowance (50 KG / Month)',
      'Save ₹9,000 with Annual Plan',
      'Unlimited KG rollover across full year',
      'Free Shoe & Handbag Spa included',
      '10 Free Heavy Blanket Dry Clean vouchers',
      'Dedicated Household Manager',
    ],
    popular: false,
    isActive: true,
  },
];

export const INITIAL_CONSUMABLES: any[] = [
  {
    id: 'inv-1',
    itemName: 'Eco-Bio Enzyme Liquid Detergent',
    category: 'DETERGENT',
    currentStock: 180,
    unit: 'LITERS',
    minThreshold: 50,
    unitCost: 140,
    status: 'IN_STOCK',
    location: 'Hub A - Shelf D1',
    lastRestockedAt: '2026-08-20',
  },
  {
    id: 'inv-2',
    itemName: 'Continuous Ozone Sanitizing Fluid',
    category: 'CHEMICAL',
    currentStock: 35,
    unit: 'LITERS',
    minThreshold: 40,
    unitCost: 320,
    status: 'LOW_STOCK',
    location: 'Hub A - Chemical Vault',
    lastRestockedAt: '2026-08-15',
  },
  {
    id: 'inv-3',
    itemName: 'Fabric Softener (Lavender Fresh)',
    category: 'SOFTENER',
    currentStock: 240,
    unit: 'LITERS',
    minThreshold: 60,
    unitCost: 95,
    status: 'IN_STOCK',
    location: 'Hub A - Shelf D2',
    lastRestockedAt: '2026-08-22',
  },
  {
    id: 'inv-4',
    itemName: 'Stain Remover & Spotting Solution',
    category: 'CHEMICAL',
    currentStock: 12,
    unit: 'LITERS',
    minThreshold: 20,
    unitCost: 450,
    status: 'LOW_STOCK',
    location: 'Hub B - Spotting Bench',
    lastRestockedAt: '2026-08-10',
  },
];

export const INITIAL_PACKAGING: any[] = [
  {
    id: 'pkg-1',
    itemName: 'Suit & Dress Garment Covers (Clear 100u)',
    type: 'GARMENT_BAG',
    currentQuantity: 850,
    minQuantity: 200,
    packSize: 100,
    costPerPack: 450,
    status: 'IN_STOCK',
    supplierName: 'PolyPack Industries',
  },
  {
    id: 'pkg-2',
    itemName: 'Heavy Duty Waterproof Laundry Bags (50 KG)',
    type: 'LAUNDRY_BAG',
    currentQuantity: 120,
    minQuantity: 150,
    packSize: 50,
    costPerPack: 1200,
    status: 'LOW_STOCK',
    supplierName: 'EcoBags South',
  },
  {
    id: 'pkg-3',
    itemName: 'Thermal Barcode Hanger Tags (Roll of 1000)',
    type: 'TAG',
    currentQuantity: 14,
    minQuantity: 5,
    packSize: 1000,
    costPerPack: 650,
    status: 'IN_STOCK',
    supplierName: 'BarcodeTech India',
  },
];

export const INITIAL_FACILITY_MACHINES: any[] = [
  {
    id: 'mach-1',
    machineCode: 'WM-001',
    name: 'Industrial Ozone Washer #1 (25 KG)',
    type: 'WASHER',
    capacityKg: 25,
    status: 'RUNNING',
    nextServiceDate: '2026-09-01',
    totalCyclesRun: 1420,
    lastServicedAt: '2026-06-01',
  },
  {
    id: 'mach-2',
    machineCode: 'WM-002',
    name: 'Industrial Ozone Washer #2 (25 KG)',
    type: 'WASHER',
    capacityKg: 25,
    status: 'AVAILABLE',
    nextServiceDate: '2026-09-10',
    totalCyclesRun: 1180,
    lastServicedAt: '2026-06-10',
  },
  {
    id: 'mach-3',
    machineCode: 'DR-001',
    name: 'Heavy Duty Gas Tumble Dryer (30 KG)',
    type: 'DRYER',
    capacityKg: 30,
    status: 'RUNNING',
    nextServiceDate: '2026-09-05',
    totalCyclesRun: 1890,
    lastServicedAt: '2026-06-05',
  },
  {
    id: 'mach-4',
    machineCode: 'SI-001',
    name: 'Vacuum Steam Press Table #1',
    type: 'STEAM_PRESS',
    capacityKg: 15,
    status: 'RUNNING',
    nextServiceDate: '2026-09-12',
    totalCyclesRun: 2400,
    lastServicedAt: '2026-06-12',
  },
];

export const INITIAL_MAINTENANCE_LOGS: any[] = [
  {
    id: 'maint-1',
    machineId: 'mach-1',
    machineCode: 'WM-001',
    serviceType: 'PREVENTATIVE',
    description: 'Replaced water inlet valves, recalibrated ozone generator injection pressure',
    technicianName: 'Suresh Kumar (Apex Machinery)',
    cost: 4500,
    performedAt: '2026-06-01',
    nextDueDate: '2026-09-01',
  },
  {
    id: 'maint-2',
    machineId: 'mach-3',
    machineCode: 'DR-001',
    serviceType: 'FILTER_CLEAN',
    description: 'Cleaned lint exhaust duct, tested burner spark ignition system',
    technicianName: 'Internal Maintenance Team',
    cost: 800,
    performedAt: '2026-06-05',
    nextDueDate: '2026-09-05',
  },
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'banner-video-1',
    title: 'Premium Cinematic Garment Care',
    subtitle: 'Pure Ozone Sanitization & German Fabric Spa Technology',
    badgeText: 'CINEMATIC CARE',
    couponCode: 'CINEMA30',
    discountPercent: 30,
    imageUrl: 'https://anjanilaundry.s3.ap-south-2.amazonaws.com/banners/banner-first50.jpg',
    mediaType: 'VIDEO',
    videoUrl: 'https://anjanilaundry.s3.ap-south-2.amazonaws.com/banners/videos/banner-video-premium-cinematic-1.mp4',
    actionType: 'BOOK',
    actionTarget: '',
    displayOrder: 1,
    isActive: true,
    createdAt: '2026-01-01 10:00',
    updatedAt: '2026-09-12 12:00',
  },
  {
    id: 'banner-video-2',
    title: 'Delicate Silk, Wool & Suit Dry Cleaning',
    subtitle: 'Zero Color Bleed, Charak Polish & Doorstep Express Delivery',
    badgeText: 'ROYAL SPA',
    couponCode: 'ROYAL25',
    discountPercent: 25,
    imageUrl: 'https://anjanilaundry.s3.ap-south-2.amazonaws.com/banners/banner-silkspa.jpg',
    mediaType: 'VIDEO',
    videoUrl: 'https://anjanilaundry.s3.ap-south-2.amazonaws.com/banners/videos/banner-video-premium-cinematic-2.mp4',
    actionType: 'CATEGORY',
    actionTarget: 'bridal-wear',
    displayOrder: 2,
    isActive: true,
    createdAt: '2026-01-01 10:00',
    updatedAt: '2026-09-12 12:00',
  },
  {
    id: 'banner-1',
    title: '50% Flat Discount on First Order',
    subtitle: 'Pure Ozone Sanitization & Doorstep Pickup across Hyderabad',
    badgeText: 'FIRST ORDER SPECIAL',
    couponCode: 'FIRST50',
    discountPercent: 50,
    imageUrl: 'https://anjanilaundry.s3.ap-south-2.amazonaws.com/banners/banner-bulk.jpg',
    actionType: 'BOOK',
    actionTarget: '',
    displayOrder: 3,
    isActive: true,
    createdAt: '2026-01-01 10:00',
    updatedAt: '2026-01-01 10:00',
  },
  {
    id: 'banner-2',
    title: 'Royal Bridal & Silk Saree Spa',
    subtitle: 'Zero-bleed Charak Polish & Hand Steam Pressing',
    badgeText: 'PREMIUM DRY CLEAN',
    couponCode: 'SILKSPA',
    discountPercent: 25,
    imageUrl: 'https://anjanilaundry.s3.ap-south-2.amazonaws.com/categories/cat-wedding-silk.jpg',
    actionType: 'CATEGORY',
    actionTarget: 'bridal-wear',
    displayOrder: 4,
    isActive: true,
    createdAt: '2026-01-01 10:00',
    updatedAt: '2026-01-01 10:00',
  },
  {
    id: 'banner-3',
    title: 'Bulk Everyday Laundry @ ₹49/KG',
    subtitle: 'Wash, Tumble Dry & Crisp Fold with Eco-friendly Softeners',
    badgeText: 'FAMILY SAVER',
    couponCode: 'BULKSAVE',
    discountPercent: 20,
    imageUrl: 'https://anjanilaundry.s3.ap-south-2.amazonaws.com/banners/banner-bulk.jpg',
    actionType: 'CATEGORY',
    actionTarget: 'bulk-laundry',
    displayOrder: 5,
    isActive: true,
    createdAt: '2026-01-01 10:00',
    updatedAt: '2026-01-01 10:00',
  },
  {
    id: 'banner-4',
    title: 'Express 24-Hour Doorstep Delivery',
    subtitle: 'Urgent suits, shirts & dresses delivered within 24 hours',
    badgeText: 'SUPER EXPRESS',
    couponCode: 'EXPRESS24',
    discountPercent: 15,
    imageUrl: 'https://anjanilaundry.s3.ap-south-2.amazonaws.com/services/delivery_van_driver.jpg',
    actionType: 'BOOK',
    actionTarget: '',
    displayOrder: 6,
    isActive: true,
    createdAt: '2026-01-01 10:00',
    updatedAt: '2026-01-01 10:00',
  },
];

class BackendDatabase {
  private orders: Order[] = [...INITIAL_ORDERS];
  private services: Service[] = [...INITIAL_SERVICES];
  private categories: ServiceCategory[] = [...INITIAL_CATEGORIES];
  private subcategories: Subcategory[] = [...INITIAL_SUBCATEGORIES];
  private coupons: Coupon[] = [...INITIAL_COUPONS];
  private pincodes: PincodeZone[] = [...INITIAL_PINCODES];
  private staff: StaffMember[] = [...INITIAL_STAFF];
  private clothTypes: ClothType[] = [...INITIAL_CLOTH_TYPES];
  private serviceMasters: ServiceMaster[] = [...INITIAL_SERVICE_MASTERS];
  private priceMatrix: ServicePriceItem[] = [...INITIAL_SERVICE_PRICE_MATRIX];
  private bulkPricing: BulkPricingItem[] = [...INITIAL_BULK_PRICING];
  private pricingSettings: PricingSettings = { ...INITIAL_PRICING_SETTINGS };
  private subscriptionPlans: any[] = [...INITIAL_SUBSCRIPTION_PLANS];
  private consumables: any[] = [...INITIAL_CONSUMABLES];
  private packaging: any[] = [...INITIAL_PACKAGING];
  private machines: any[] = [...INITIAL_FACILITY_MACHINES];
  private maintenanceLogs: any[] = [...INITIAL_MAINTENANCE_LOGS];
  private customers: any[] = [];

  async syncFromMysql() {
    if (!isDbConnected || !pool) return;
    try {
      // Sync Orders
      const [ordRows]: any = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
      if (ordRows.length > 0) {
        this.orders = ordRows.map((r: any) => ({
          id: r.id,
          customerId: r.customer_id,
          customerName: r.customer_name,
          customerPhone: r.customer_phone,
          address: typeof r.address === 'string' ? JSON.parse(r.address) : r.address,
          items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
          pricingModelSummary: r.pricing_model_summary,
          expressTier: r.express_tier,
          pickupSlot: typeof r.pickup_slot === 'string' ? JSON.parse(r.pickup_slot) : r.pickup_slot,
          deliverySlot: typeof r.delivery_slot === 'string' ? JSON.parse(r.delivery_slot) : r.delivery_slot,
          pickupOtp: r.pickup_otp,
          deliveryOtp: r.delivery_otp,
          bagTagCode: r.bag_tag_code,
          currentStatus: r.current_status,
          statusHistory: typeof r.status_history === 'string' ? JSON.parse(r.status_history) : r.status_history,
          isWeighed: Boolean(r.is_weighed),
          actualWeightKg: r.actual_weight_kg ? Number(r.actual_weight_kg) : undefined,
          itemTotal: Number(r.item_total),
          discountAmount: Number(r.discount_amount),
          couponCode: r.coupon_code,
          pickupDeliveryFee: Number(r.pickup_delivery_fee),
          expressFee: Number(r.express_fee),
          taxAmount: Number(r.tax_amount),
          totalAmount: Number(r.total_amount),
          paymentMethod: r.payment_method,
          paymentStatus: r.payment_status,
          paymentTransactionId: r.payment_transaction_id || undefined,
          paymentGatewayOrderId: r.payment_gateway_order_id || undefined,
          paymentGateway: r.payment_gateway_order_id ? 'RAZORPAY' : undefined,
          assignedPickupAgent: r.assigned_pickup_agent ? (typeof r.assigned_pickup_agent === 'string' ? JSON.parse(r.assigned_pickup_agent) : r.assigned_pickup_agent) : undefined,
          assignedDeliveryAgent: r.assigned_delivery_agent ? (typeof r.assigned_delivery_agent === 'string' ? JSON.parse(r.assigned_delivery_agent) : r.assigned_delivery_agent) : undefined,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
      }

      // Sync Cloth Types
      const [ctRows]: any = await pool.query('SELECT * FROM cloth_types ORDER BY sort_order ASC').catch(() => [[]]);
      if (ctRows && Array.isArray(ctRows) && ctRows.length > 0) {
        this.clothTypes = ctRows.map((r: any) => ({
          id: r.id, name: r.name, icon: r.icon, categoryTag: r.category_tag, categoryLabel: r.category_label,
          subCategory: r.sub_category || undefined, description: r.description,
          isActive: Boolean(r.is_active), sortOrder: r.sort_order, imageUrl: r.image_url || undefined,
        }));
      } else {
        this.clothTypes = [...INITIAL_CLOTH_TYPES];
      }

      // Sync Service Masters
      const [smRows]: any = await pool.query('SELECT * FROM service_masters').catch(() => [[]]);
      if (smRows && Array.isArray(smRows) && smRows.length > 0) {
        this.serviceMasters = smRows.map((r: any) => ({
          id: r.id, name: r.name, slug: r.slug, serviceCode: r.service_code, icon: r.icon,
          pricingType: r.pricing_type, baseKgPrice: r.base_kg_price ? Number(r.base_kg_price) : undefined,
          minOrderKg: r.min_order_kg ? Number(r.min_order_kg) : undefined, turnaroundHours: r.turnaround_hours,
          description: r.description, isActive: Boolean(r.is_active), imageUrl: r.image_url || undefined,
        }));
      } else {
        this.serviceMasters = [...INITIAL_SERVICE_MASTERS];
      }

      // Sync Price Matrix
      const [pmRows]: any = await pool.query('SELECT * FROM service_price_matrix').catch(() => [[]]);
      if (pmRows && Array.isArray(pmRows) && pmRows.length > 0) {
        const rawPm = pmRows.map((r: any) => ({
          id: r.id, clothTypeId: r.cloth_type_id, clothName: r.cloth_name, clothIcon: r.cloth_icon,
          categoryTag: r.category_tag, serviceId: r.service_id, serviceName: r.service_name,
          price: Number(r.price), expressPrice: r.express_price ? Number(r.express_price) : undefined,
          turnaroundHours: r.turnaround_hours, isActive: Boolean(r.is_active),
        }));
        const pmMap = new Map<string, any>();
        for (const item of rawPm) {
          const key = `${item.clothTypeId}::${item.serviceId}`;
          const existing = pmMap.get(key);
          if (!existing) {
            pmMap.set(key, item);
          } else {
            const existingScore = (existing.clothName ? 2 : 0) + (existing.id?.includes('srv-m') ? 1 : 0);
            const newScore = (item.clothName ? 2 : 0) + (item.id?.includes('srv-m') ? 1 : 0);
            if (newScore > existingScore) {
              pmMap.set(key, item);
            }
          }
        }
        this.priceMatrix = Array.from(pmMap.values());
        // Clean up orphaned duplicates in background
        pool.query('DELETE FROM service_price_matrix WHERE cloth_name IS NULL AND (id LIKE "pr-%-dc" OR id LIKE "pr-%-si" OR id LIKE "pr-%-wf" OR id LIKE "pr-%-wi")').catch(() => {});
        // Ensure any missing price matrix items exist in MySQL
        const existingPmIds = new Set(this.priceMatrix.map((p) => p.id));
        for (const p of INITIAL_SERVICE_PRICE_MATRIX) {
          if (!existingPmIds.has(p.id)) {
            await pool.query(
              'INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE price=VALUES(price)',
              [p.id, p.clothTypeId, p.clothName, p.clothIcon, p.categoryTag, p.serviceId, p.serviceName, p.price, p.expressPrice || null, p.turnaroundHours, p.isActive ? 1 : 0]
            ).catch(() => {});
            this.priceMatrix.push(p);
          }
        }
      } else {
        this.priceMatrix = [...INITIAL_SERVICE_PRICE_MATRIX];
        for (const p of this.priceMatrix) {
          await pool.query(
            'INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE price=VALUES(price)',
            [p.id, p.clothTypeId, p.clothName, p.clothIcon, p.categoryTag, p.serviceId, p.serviceName, p.price, p.expressPrice || null, p.turnaroundHours, p.isActive ? 1 : 0]
          ).catch(() => {});
        }
      }

      // Sync Pricing Settings with distance-based delivery columns
      await pool.query('ALTER TABLE pricing_settings ADD COLUMN IF NOT EXISTS is_gst_enabled TINYINT(1) DEFAULT 1').catch(() => {});
      await pool.query('ALTER TABLE pricing_settings ADD COLUMN IF NOT EXISTS delivery_calculation_mode VARCHAR(32) DEFAULT "DISTANCE_BASED"').catch(() => {});
      await pool.query('ALTER TABLE pricing_settings ADD COLUMN IF NOT EXISTS base_distance_km DECIMAL(6,2) DEFAULT 3.00').catch(() => {});
      await pool.query('ALTER TABLE pricing_settings ADD COLUMN IF NOT EXISTS base_delivery_fee DECIMAL(8,2) DEFAULT 30.00').catch(() => {});
      await pool.query('ALTER TABLE pricing_settings ADD COLUMN IF NOT EXISTS per_km_rate_after_base DECIMAL(8,2) DEFAULT 10.00').catch(() => {});
      await pool.query('ALTER TABLE pricing_settings ADD COLUMN IF NOT EXISTS max_service_radius_km DECIMAL(6,2) DEFAULT 35.00').catch(() => {});
      await pool.query('ALTER TABLE pricing_settings ADD COLUMN IF NOT EXISTS store_name VARCHAR(120) DEFAULT "Anusha Laundry Central Hub"').catch(() => {});
      await pool.query('ALTER TABLE pricing_settings ADD COLUMN IF NOT EXISTS store_address VARCHAR(255) DEFAULT "Anusha Bazaar, Kukatpally, Hyderabad - 500072"').catch(() => {});
      await pool.query('ALTER TABLE pricing_settings ADD COLUMN IF NOT EXISTS store_latitude DECIMAL(10,7) DEFAULT 17.4929894').catch(() => {});
      await pool.query('ALTER TABLE pricing_settings ADD COLUMN IF NOT EXISTS store_longitude DECIMAL(10,7) DEFAULT 78.4144426').catch(() => {});
      await pool.query('ALTER TABLE pricing_settings ADD COLUMN IF NOT EXISTS store_phone VARCHAR(32) DEFAULT "+91 40 4567 8901"').catch(() => {});
      await pool.query('ALTER TABLE pricing_settings ADD COLUMN IF NOT EXISTS same_day_delivery_fee DECIMAL(8,2) DEFAULT 160.00').catch(() => {});
      await pool.query('ALTER TABLE pricing_settings ADD COLUMN IF NOT EXISTS distance_tiers TEXT').catch(() => {});

      const [psRows]: any = await pool.query('SELECT * FROM pricing_settings WHERE id = 1').catch(() => [[]]);
      if (psRows && psRows.length > 0) {
        const s = psRows[0];
        let tiers = INITIAL_PRICING_SETTINGS.distanceTiers;
        if (s.distance_tiers) { try { tiers = JSON.parse(s.distance_tiers); } catch {} }
        this.pricingSettings = {
          taxPercentage: Number(s.tax_percentage),
          minOrderValue: Number(s.min_order_value),
          freeDeliveryThreshold: Number(s.free_delivery_threshold),
          standardDeliveryFee: Number(s.standard_delivery_fee),
          expressDeliveryFee: Number(s.express_delivery_fee),
          sameDayDeliveryFee: s.same_day_delivery_fee ? Number(s.same_day_delivery_fee) : Number(s.express_delivery_fee || 80) * 2,
          extraKgPrice: Number(s.extra_kg_price),
          isGstEnabled: s.is_gst_enabled !== undefined && s.is_gst_enabled !== null ? Boolean(s.is_gst_enabled) : true,
          deliveryCalculationMode: s.delivery_calculation_mode || 'DISTANCE_BASED',
          baseDistanceKm: s.base_distance_km ? Number(s.base_distance_km) : 3,
          baseDeliveryFee: s.base_delivery_fee ? Number(s.base_delivery_fee) : 30,
          perKmRateAfterBase: s.per_km_rate_after_base ? Number(s.per_km_rate_after_base) : 10,
          maxServiceRadiusKm: s.max_service_radius_km ? Number(s.max_service_radius_km) : 35,
          storeName: s.store_name || 'Anusha Laundry Central Hub',
          storeAddress: s.store_address || 'Anusha Bazaar, Kukatpally, Hyderabad - 500072',
          storeLatitude: s.store_latitude ? Number(s.store_latitude) : 17.4929894,
          storeLongitude: s.store_longitude ? Number(s.store_longitude) : 78.4144426,
          storePhone: s.store_phone || '+91 40 4567 8901',
          distanceTiers: tiers,
        };
      }

      // Sync Services
      const [srvRows]: any = await pool.query('SELECT * FROM services').catch(() => [[]]);
      if (srvRows && srvRows.length > 0) {
        this.services = srvRows.map((r: any) => ({
          id: r.id, categoryId: r.category_id, name: r.name, slug: r.slug, description: r.description,
          pricingModel: r.pricing_model,
          basePrice: r.id === 'srv-1' && Number(r.base_price) < 10 ? 60 : Number(r.base_price),
          unit: r.unit, minOrderQuantity: r.min_order_quantity ? Number(r.min_order_quantity) : undefined,
          turnaroundHours: r.turnaround_hours, popular: Boolean(r.popular),
          expressAvailable: Boolean(r.express_available),
          image: r.image_url || undefined, imageUrl: r.image_url || undefined,
        }));
        pool.query("UPDATE services SET base_price = 60 WHERE id = 'srv-1' AND base_price < 10").catch(() => {});
      }

      // Sync Categories
      const [catRows]: any = await pool.query('SELECT * FROM categories').catch(() => [[]]);
      if (catRows && catRows.length > 0) {
        this.categories = catRows.map((r: any) => ({
          id: r.id, name: r.name, slug: r.slug, icon: r.icon, description: r.description,
          isPopular: Boolean(r.is_popular), color: r.color || undefined,
          image: r.image_url || undefined, imageUrl: r.image_url || undefined,
        }));
      }

      // Sync Subcategories
      const [subcatRows]: any = await pool.query('SELECT * FROM subcategories ORDER BY sort_order ASC').catch(() => [[]]);
      if (Array.isArray(subcatRows)) {
        this.subcategories = subcatRows.map((r: any) => ({
          id: r.id, categoryTag: r.category_tag, name: r.name,
          imageUrl: r.image_url || undefined, isActive: Boolean(r.is_active), sortOrder: r.sort_order || 0,
        }));
      }

      // Sync Coupons — ensure all master coupons exist
      for (const c of INITIAL_COUPONS) {
        await pool.query(
          `INSERT INTO coupons (id, code, title, description, discount_type, discount_value, min_order_value, max_discount_cap, first_order_only, expiry_date, usage_count, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             title = VALUES(title),
             description = VALUES(description),
             discount_type = VALUES(discount_type),
             discount_value = VALUES(discount_value),
             min_order_value = VALUES(min_order_value),
             max_discount_cap = VALUES(max_discount_cap),
             first_order_only = VALUES(first_order_only),
             expiry_date = VALUES(expiry_date),
             is_active = VALUES(is_active)`,
          [c.id, c.code, c.title, c.description, c.discountType, c.discountValue, c.minOrderValue, c.maxDiscountCap || null, c.firstOrderOnly ? 1 : 0, c.expiryDate, c.usageCount, c.isActive ? 1 : 0]
        ).catch(() => {});
      }
      const [cpnRows]: any = await pool.query('SELECT * FROM coupons');
      if (cpnRows && cpnRows.length > 0) {
        this.coupons = cpnRows.map((r: any) => ({
          id: r.id,
          code: r.code,
          title: r.title,
          description: r.description,
          discountType: r.discount_type,
          discountValue: Number(r.discount_value),
          minOrderValue: Number(r.min_order_value),
          maxDiscountCap: r.max_discount_cap ? Number(r.max_discount_cap) : undefined,
          firstOrderOnly: Boolean(r.first_order_only),
          expiryDate: r.expiry_date,
          usageCount: r.usage_count || 0,
          isActive: Boolean(r.is_active),
        }));
      }

      // Sync Pincodes — seed all 50 Hyderabad pincodes if MySQL table is sparse
      const [pinRows]: any = await pool.query('SELECT * FROM pincodes');
      if (pinRows.length >= 50) {
        this.pincodes = pinRows.map((r: any) => ({
          pincode: r.pincode,
          areaName: r.area_name,
          city: r.city,
          isServiceable: Boolean(r.is_serviceable),
          standardFee: Number(r.standard_fee),
          minFreeOrderValue: Number(r.min_free_order_value),
          expressAvailable: Boolean(r.express_available),
          averageTurnaroundHours: r.average_turnaround_hours,
        }));
      } else {
        // MySQL has fewer than 50 pincodes — re-seed all INITIAL_PINCODES
        this.pincodes = [...INITIAL_PINCODES];
        for (const p of INITIAL_PINCODES) {
          await pool.query(
            `INSERT INTO pincodes (pincode, area_name, city, is_serviceable, standard_fee, min_free_order_value, express_available, average_turnaround_hours)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               area_name = VALUES(area_name),
               city = VALUES(city),
               is_serviceable = VALUES(is_serviceable),
               standard_fee = VALUES(standard_fee),
               min_free_order_value = VALUES(min_free_order_value),
               express_available = VALUES(express_available),
               average_turnaround_hours = VALUES(average_turnaround_hours)`,
            [p.pincode, p.areaName, p.city, p.isServiceable ? 1 : 0, p.standardFee, p.minFreeOrderValue, p.expressAvailable ? 1 : 0, p.averageTurnaroundHours]
          ).catch(() => {});
        }
      }

      // Sync Staff
      const [stfRows]: any = await pool.query('SELECT * FROM staff');
      if (stfRows.length > 0) {
        this.staff = stfRows.map((r: any) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone,
          role: r.role,
          assignedFacility: r.assigned_facility,
          assignedZone: r.assigned_zone,
          isActive: Boolean(r.is_active),
          rating: r.rating ? Number(r.rating) : 5,
          ordersProcessed: r.orders_processed || 0,
          hubId: r.hub_id,
        }));
      }

      // Sync Subscriptions
      const [subRows]: any = await pool.query('SELECT * FROM subscriptions');
      if (subRows && subRows.length > 0) {
        this.subscriptionPlans = subRows.map((r: any) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          durationMonths: Number(r.duration_months || 1),
          price: Number(r.price),
          originalPrice: r.original_price ? Number(r.original_price) : undefined,
          validityDays: Number(r.validity_days || 30),
          includedKg: Number(r.included_kg || 20),
          freePickupDelivery: Boolean(r.free_pickup_delivery),
          priorityService: Boolean(r.priority_service),
          maxFamilyMembers: Number(r.max_family_members || 1),
          features: typeof r.features === 'string' ? JSON.parse(r.features) : (Array.isArray(r.features) ? r.features : []),
          popular: Boolean(r.popular),
          isActive: Boolean(r.is_active),
        }));
      }

      // Sync Customers
      const [custRows]: any = await pool.query('SELECT * FROM customers').catch(() => [[]]);
      if (custRows && custRows.length > 0) {
        this.customers = custRows.map((r: any) => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
          email: r.email || '',
          role: r.role || 'CUSTOMER',
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
      }

      // Sync Banners
      const [bRows]: any = await pool.query('SELECT * FROM banners ORDER BY display_order ASC').catch(() => [[]]);
      if (bRows && bRows.length > 0) {
        this.banners = bRows.map((r: any) => ({
          id: r.id,
          title: r.title,
          subtitle: r.subtitle || undefined,
          badgeText: r.badge_text || undefined,
          couponCode: r.coupon_code || undefined,
          discountPercent: r.discount_percent ? Number(r.discount_percent) : 0,
          imageUrl: r.image_url,
          mediaType: (r.media_type as any) || 'IMAGE',
          videoUrl: r.video_url || undefined,
          actionType: r.action_type || 'BOOK',
          actionTarget: r.action_target || '',
          displayOrder: Number(r.display_order) || 1,
          isActive: Boolean(r.is_active),
          startDate: r.start_date || undefined,
          endDate: r.end_date || undefined,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
      } else if (this.banners && this.banners.length > 0) {
        for (const b of this.banners) {
          await pool.query(
            'INSERT INTO banners (id, title, subtitle, badge_text, coupon_code, discount_percent, image_url, media_type, video_url, action_type, action_target, display_order, is_active, start_date, end_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title), subtitle=VALUES(subtitle), badge_text=VALUES(badge_text), coupon_code=VALUES(coupon_code), discount_percent=VALUES(discount_percent), image_url=VALUES(image_url), media_type=VALUES(media_type), video_url=VALUES(video_url), action_type=VALUES(action_type), action_target=VALUES(action_target), display_order=VALUES(display_order), is_active=VALUES(is_active), updated_at=VALUES(updated_at)',
            [b.id, b.title, b.subtitle || null, b.badgeText || null, b.couponCode || null, b.discountPercent || 0, b.imageUrl, b.mediaType || 'IMAGE', b.videoUrl || null, b.actionType || 'BOOK', b.actionTarget || '', b.displayOrder || 1, b.isActive ? 1 : 0, b.startDate || null, b.endDate || null, b.createdAt || null, b.updatedAt || null]
          ).catch((err) => console.error('Error seeding banner to MySQL:', err));
        }
      }
    } catch (err) {
      console.error('Error syncing data from MySQL:', err);
    }
  }

  getOrders(): Order[] { return this.orders; }
  getOrderById(id: string): Order | undefined { return this.orders.find((o) => o.id.toUpperCase() === id.toUpperCase()); }

  async createOrder(data: any): Promise<Order> {
    const id = `LAU${randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`;
    const now = new Date().toISOString();
    const order: Order = {
      ...data,
      id,
      bagTagCode: `BAG-${id}`,
      pickupOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      currentStatus: 'ORDER_PLACED',
      isWeighed: false,
      statusHistory: [{ status: 'ORDER_PLACED', title: 'Order Placed', description: `Order #${id} scheduled.`, timestamp: now }],
      createdAt: now,
      updatedAt: now,
    };

    if (data.couponCode?.startsWith('RWD') && (!isDbConnected || !pool)) {
      throw new Error('Reward checkout requires an available database.');
    }
    if (isDbConnected && pool) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        await connection.query('SELECT id FROM customers WHERE id = ? FOR UPDATE', [order.customerId]);
        if (data.couponCode?.startsWith('RWD')) {
          const reward = await referralRewardDiscount(order.customerId, data.couponCode, order.itemTotal, connection, order.id);
          if (reward.discountAmount !== order.discountAmount) throw new Error('Reward amount changed. Please retry checkout.');
        }
        await connection.query(
        `INSERT INTO orders (
          id, customer_id, customer_name, customer_phone, address, items, pricing_model_summary,
          express_tier, pickup_slot, delivery_slot, pickup_otp, delivery_otp, bag_tag_code,
          current_status, status_history, is_weighed, actual_weight_kg, item_total, discount_amount,
          coupon_code, pickup_delivery_fee, express_fee, tax_amount, total_amount, payment_method,
          payment_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          order.id,
          order.customerId,
          order.customerName,
          order.customerPhone,
          JSON.stringify(order.address),
          JSON.stringify(order.items),
          order.pricingModelSummary,
          order.expressTier,
          JSON.stringify(order.pickupSlot),
          JSON.stringify(order.deliverySlot),
          order.pickupOtp,
          order.deliveryOtp,
          order.bagTagCode,
          order.currentStatus,
          JSON.stringify(order.statusHistory),
          order.isWeighed ? 1 : 0,
          order.actualWeightKg || null,
          order.itemTotal,
          order.discountAmount,
          order.couponCode || null,
          order.pickupDeliveryFee,
          order.expressFee,
          order.taxAmount,
          order.totalAmount,
          order.paymentMethod,
          order.paymentStatus,
          order.createdAt,
          order.updatedAt,
        ]
        );
        await connection.commit();
      } catch (error) { await connection.rollback(); throw error; }
      finally { connection.release(); }
    }

    this.orders.unshift(order);
    return order;
  }

  updateOrderStatus(id: string, status: OrderStatus, notes?: string, updatedBy?: string): Order | null {
    const order = this.getOrderById(id);
    if (!order) return null;
    order.currentStatus = status;
    const now = new Date().toISOString();
    order.statusHistory.push({
      status,
      title: status.replace(/_/g, ' '),
      description: notes || `Order advanced to ${status.replace(/_/g, ' ')}`,
      timestamp: now,
      updatedBy: updatedBy || 'Operations Admin',
    });
    order.updatedAt = now;

    if (isDbConnected && pool) {
      pool.query(
        'UPDATE orders SET current_status = ?, status_history = ?, updated_at = ? WHERE id = ?',
        [order.currentStatus, JSON.stringify(order.statusHistory), order.updatedAt, order.id]
      ).catch((err) => console.error('Error updating order status in MySQL:', err));
    }

    return order;
  }

  markOrderCancelledAndRefunded(
    id: string,
    notes?: string,
    updatedBy?: string,
    newPaymentStatus?: 'REFUNDED' | 'FAILED' | 'PENDING'
  ): Order | null {
    const order = this.getOrderById(id);
    if (!order) return null;
    order.currentStatus = 'CANCELLED';
    if (newPaymentStatus) {
      order.paymentStatus = newPaymentStatus as any;
    }
    const now = new Date().toISOString();
    order.statusHistory.push({
      status: 'CANCELLED',
      title: 'Order Cancelled',
      description: notes || 'Order has been cancelled.',
      timestamp: now,
      updatedBy: updatedBy || 'Customer',
    });
    order.updatedAt = now;

    if (isDbConnected && pool) {
      pool
        .query(
          'UPDATE orders SET current_status = ?, payment_status = ?, status_history = ?, updated_at = ? WHERE id = ?',
          [order.currentStatus, order.paymentStatus, JSON.stringify(order.statusHistory), order.updatedAt, order.id]
        )
        .catch((err) => console.error('Error updating cancelled order in MySQL:', err));
    }

    return order;
  }

  assignOrderDriver(id: string, agentType: 'PICKUP' | 'DELIVERY', agent: NonNullable<Order['assignedPickupAgent']>): Order | null {
    const order = this.getOrderById(id);
    if (!order) return null;
    if (agentType === 'DELIVERY') order.assignedDeliveryAgent = agent;
    else order.assignedPickupAgent = agent;
    order.updatedAt = new Date().toISOString();
    if (isDbConnected && pool) {
      const column = agentType === 'DELIVERY' ? 'assigned_delivery_agent' : 'assigned_pickup_agent';
      pool.query(`UPDATE orders SET ${column} = ?, updated_at = ? WHERE id = ?`, [JSON.stringify(agent), order.updatedAt, order.id])
        .catch((err) => console.error('Error saving assigned order driver:', err));
    }
    return order;
  }

  updateOrderWeight(id: string, weightKg: number): Order | null {
    const order = this.getOrderById(id);
    if (!order) return null;
    order.actualWeightKg = weightKg;
    order.isWeighed = true;
    let recalculated = 0;
    order.items.forEach((item) => {
      if (item.pricingModel === 'PER_KG') {
        item.actualWeightKg = weightKg;
        item.quantity = weightKg;
        item.subtotal = item.unitPrice * weightKg;
      }
      recalculated += item.subtotal;
    });
    order.itemTotal = recalculated;
    const taxable = Math.max(0, order.itemTotal - order.discountAmount + order.pickupDeliveryFee + order.expressFee);
    const effectiveTax = (this.pricingSettings.isGstEnabled !== false) ? this.pricingSettings.taxPercentage : 0;
    order.taxAmount = +(taxable * (effectiveTax / 100)).toFixed(2);
    order.totalAmount = +(taxable + order.taxAmount).toFixed(2);
    this.updateOrderStatus(id, 'WEIGHED_VERIFIED', `Facility verified exact load weight: ${weightKg} KG. Total: ₹${order.totalAmount}`);

    if (isDbConnected && pool) {
      pool.query(
        'UPDATE orders SET items = ?, is_weighed = 1, actual_weight_kg = ?, item_total = ?, tax_amount = ?, total_amount = ? WHERE id = ?',
        [JSON.stringify(order.items), weightKg, order.itemTotal, order.taxAmount, order.totalAmount, order.id]
      ).catch((err) => console.error('Error updating order weight in MySQL:', err));
    }

    return order;
  }

  setPaymentGatewayOrder(id: string, gatewayOrderId: string): Order | null {
    const order = this.getOrderById(id);
    if (!order) return null;

    order.paymentGateway = 'RAZORPAY';
    order.paymentGatewayOrderId = gatewayOrderId;
    order.paymentStatus = 'PENDING';
    order.updatedAt = new Date().toISOString();

    if (isDbConnected && pool) {
      pool
        .query(
          'UPDATE orders SET payment_status = ?, payment_gateway_order_id = ?, updated_at = ? WHERE id = ?',
          [order.paymentStatus, order.paymentGatewayOrderId, order.updatedAt, order.id]
        )
        .catch((err) => console.error('Error saving payment gateway order to MySQL:', err));
    }

    return order;
  }

  markOrderPaymentPaid(id: string, paymentId: string): Order | null {
    const order = this.getOrderById(id);
    if (!order) return null;

    order.paymentStatus = 'PAID';
    order.paymentTransactionId = paymentId;
    order.updatedAt = new Date().toISOString();

    if (isDbConnected && pool) {
      pool
        .query(
          'UPDATE orders SET payment_status = ?, payment_transaction_id = ?, updated_at = ? WHERE id = ?',
          [order.paymentStatus, order.paymentTransactionId, order.updatedAt, order.id]
        )
        .catch((err) => console.error('Error marking payment as paid in MySQL:', err));
    }

    return order;
  }

  markOrderPaymentFailed(id: string): Order | null {
    const order = this.getOrderById(id);
    if (!order || order.paymentStatus === 'PAID') return null;

    order.paymentStatus = 'FAILED';
    order.currentStatus = 'CANCELLED';
    order.updatedAt = new Date().toISOString();

    if (isDbConnected && pool) {
      pool
        .query('UPDATE orders SET payment_status = ?, current_status = ?, updated_at = ? WHERE id = ?', [order.paymentStatus, order.currentStatus, order.updatedAt, order.id])
        .catch((err) => console.error('Error marking payment as failed in MySQL:', err));
    }

    return order;
  }

  // Cloth Types
  getClothTypes(categoryTag?: string): ClothType[] {
    if (!categoryTag || categoryTag === 'ALL') return this.clothTypes;
    return this.clothTypes.filter((c) => c.categoryTag === categoryTag);
  }

  getClothTypeById(id: string): ClothType | undefined {
    return this.clothTypes.find((c) => c.id === id);
  }

  createClothType(data: Partial<ClothType>): ClothType {
    const id = data.id || `cloth-${Date.now()}`;
    const newCloth: ClothType = {
      id,
      name: data.name || 'New Garment',
      icon: data.icon || '👕',
      categoryTag: data.categoryTag || 'MENS',
      categoryLabel: data.categoryLabel || "Men's Clothing",
      subCategory: typeof data.subCategory === 'string' ? data.subCategory.trim() || undefined : undefined,
      description: data.description || '',
      imageUrl: data.imageUrl || undefined,
      isActive: data.isActive !== undefined ? data.isActive : true,
      sortOrder: this.clothTypes.length + 1,
    };
    this.clothTypes.push(newCloth);

    if (isDbConnected && pool) {
      pool.query(
        'INSERT INTO cloth_types (id, name, icon, category_tag, category_label, sub_category, description, is_active, sort_order, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newCloth.id, newCloth.name, newCloth.icon, newCloth.categoryTag, newCloth.categoryLabel, newCloth.subCategory || null, newCloth.description, newCloth.isActive ? 1 : 0, newCloth.sortOrder, newCloth.imageUrl || null]
      ).catch((err) => console.error('Error creating cloth type in MySQL:', err));
    }

    return newCloth;
  }

  updateClothType(id: string, data: Partial<ClothType>): ClothType | null {
    const item = this.clothTypes.find((c) => c.id === id);
    if (!item) return null;
    Object.assign(item, data);

    if (isDbConnected && pool) {
      pool.query(
        'UPDATE cloth_types SET name = ?, icon = ?, category_tag = ?, category_label = ?, sub_category = ?, description = ?, is_active = ?, image_url = ? WHERE id = ?',
        [item.name, item.icon, item.categoryTag, item.categoryLabel, item.subCategory || null, item.description, item.isActive ? 1 : 0, item.imageUrl || null, item.id]
      ).catch((err) => console.error('Error updating cloth type in MySQL:', err));
    }

    return item;
  }

  deleteClothType(id: string): boolean {
    const idx = this.clothTypes.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.clothTypes.splice(idx, 1);
    this.priceMatrix = this.priceMatrix.filter((p) => p.clothTypeId !== id);

    if (isDbConnected && pool) {
      pool.query('DELETE FROM cloth_types WHERE id = ?', [id]).catch((err) => console.error('Error deleting cloth type from MySQL:', err));
      pool.query('DELETE FROM service_price_matrix WHERE cloth_type_id = ?', [id]).catch((err) => console.error('Error deleting matrix from MySQL:', err));
    }

    return true;
  }

  // Service Masters
  getServiceMasters(): ServiceMaster[] {
    return this.serviceMasters;
  }

  createServiceMaster(data: Partial<ServiceMaster>): ServiceMaster {
    const id = data.id || `srv-m-${Date.now()}`;
    const cleanSlug = data.slug || (data.name || 'service').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const service: ServiceMaster = {
      id,
      name: data.name || 'New Service',
      slug: cleanSlug,
      icon: data.icon || '✨',
      pricingType: data.pricingType || 'PER_ITEM',
      baseKgPrice: data.baseKgPrice ? Number(data.baseKgPrice) : undefined,
      minOrderKg: data.minOrderKg ? Number(data.minOrderKg) : undefined,
      turnaroundHours: Number(data.turnaroundHours) || 24,
      description: data.description || '',
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      imageUrl: data.imageUrl,
    };
    this.serviceMasters.push(service);

    if (isDbConnected && pool) {
      pool.query(
        'INSERT INTO service_masters (id, name, slug, icon, pricing_type, base_kg_price, min_order_kg, turnaround_hours, description, is_active, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [service.id, service.name, service.slug, service.icon, service.pricingType, service.baseKgPrice || null, service.minOrderKg || null, service.turnaroundHours, service.description, service.isActive ? 1 : 0, service.imageUrl || null]
      ).catch((err) => console.error('Error creating service master in MySQL:', err));
    }

    return service;
  }

  updateServiceMaster(id: string, data: Partial<ServiceMaster>): ServiceMaster | null {
    const service = this.serviceMasters.find((s) => s.id === id);
    if (!service) return null;
    Object.assign(service, data);
    if (data.imageUrl !== undefined) {
      service.imageUrl = data.imageUrl;
    }
    if (data.isActive !== undefined) {
      service.isActive = Boolean(data.isActive);
    }
    if (data.turnaroundHours !== undefined) {
      service.turnaroundHours = Number(data.turnaroundHours) || 24;
    }
    if (data.baseKgPrice !== undefined) {
      service.baseKgPrice = data.baseKgPrice ? Number(data.baseKgPrice) : undefined;
    }
    if (data.minOrderKg !== undefined) {
      service.minOrderKg = data.minOrderKg ? Number(data.minOrderKg) : undefined;
    }

    if (isDbConnected && pool) {
      pool.query(
        'UPDATE service_masters SET name = ?, slug = ?, icon = ?, pricing_type = ?, base_kg_price = ?, min_order_kg = ?, turnaround_hours = ?, description = ?, is_active = ?, image_url = ? WHERE id = ?',
        [
          service.name,
          service.slug,
          service.icon || null,
          service.pricingType,
          service.baseKgPrice || null,
          service.minOrderKg || null,
          service.turnaroundHours,
          service.description,
          service.isActive ? 1 : 0,
          service.imageUrl || null,
          service.id,
        ]
      ).catch((err) => console.error('Error updating service master in MySQL:', err));
    }

    return service;
  }

  deleteServiceMaster(id: string): boolean {
    const idx = this.serviceMasters.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.serviceMasters.splice(idx, 1);

    if (isDbConnected && pool) {
      pool.query('DELETE FROM service_masters WHERE id = ?', [id]).catch((err) => console.error('Error deleting service master from MySQL:', err));
    }

    return true;
  }

  // Subcategories
  getSubcategories(categoryTag?: string): Subcategory[] {
    if (!categoryTag || categoryTag.toUpperCase() === 'ALL') {
      return this.subcategories;
    }
    const clean = categoryTag.toUpperCase().replace(/_/g, '-');
    return this.subcategories.filter((s) => {
      const sTag = (s.categoryTag || '').toUpperCase().replace(/_/g, '-');
      return sTag === clean;
    });
  }

  createSubcategory(data: Partial<Subcategory>): Subcategory {
    const id = data.id || `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const subcat: Subcategory = {
      id,
      categoryTag: (data.categoryTag || 'MENS').toUpperCase(),
      name: data.name || 'New Subcategory',
      imageUrl: data.imageUrl,
      isActive: data.isActive !== undefined ? data.isActive : true,
      sortOrder: data.sortOrder || this.subcategories.length + 1,
    };
    this.subcategories.push(subcat);

    if (isDbConnected && pool) {
      pool.query(
        'INSERT INTO subcategories (id, category_tag, name, image_url, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        [subcat.id, subcat.categoryTag, subcat.name, subcat.imageUrl || null, subcat.isActive ? 1 : 0, subcat.sortOrder]
      ).catch((err) => console.error('Error inserting subcategory in MySQL:', err));
    }

    return subcat;
  }

  updateSubcategory(id: string, data: Partial<Subcategory>): Subcategory | null {
    const item = this.subcategories.find((s) => s.id === id);
    if (!item) return null;
    Object.assign(item, data);
    if (data.imageUrl !== undefined) {
      item.imageUrl = data.imageUrl;
    }

    if (isDbConnected && pool) {
      pool.query(
        'UPDATE subcategories SET category_tag = ?, name = ?, image_url = ?, is_active = ?, sort_order = ? WHERE id = ?',
        [item.categoryTag, item.name, item.imageUrl || null, item.isActive ? 1 : 0, item.sortOrder, item.id]
      ).catch((err) => console.error('Error updating subcategory in MySQL:', err));
    }

    return item;
  }

  deleteSubcategory(id: string): boolean {
    let idx = this.subcategories.findIndex((s) => s.id === id);
    if (idx === -1) {
      idx = this.subcategories.findIndex(
        (s) => s.name.toLowerCase() === id.toLowerCase() ||
               s.id.toLowerCase() === id.toLowerCase() ||
               (id.startsWith('sub-seed-') && s.name.toLowerCase() === id.replace(/^sub-seed-\d+-?/, '').toLowerCase())
      );
    }
    if (idx === -1) {
      if (isDbConnected && pool) {
        pool.query('DELETE FROM subcategories WHERE id = ?', [id]).catch(() => {});
      }
      return false;
    }

    const item = this.subcategories[idx];
    const realId = item.id;
    this.subcategories.splice(idx, 1);

    if (isDbConnected && pool) {
      pool.query('DELETE FROM subcategories WHERE id = ? OR name = ?', [realId, item.name]).catch((err) => console.error('Error deleting subcategory from MySQL:', err));
      pool.query('UPDATE cloth_types SET sub_category = NULL WHERE LOWER(sub_category) = LOWER(?)', [item.name]).catch(() => {});
    }

    this.clothTypes.forEach((c) => {
      if (c.subCategory && c.subCategory.toLowerCase() === item.name.toLowerCase()) {
        c.subCategory = undefined;
      }
    });

    return true;
  }

  async seedDefaultSubcategories(): Promise<Subcategory[]> {
    this.subcategories = [...INITIAL_SUBCATEGORIES];
    if (isDbConnected && pool) {
      for (const item of INITIAL_SUBCATEGORIES) {
        await pool.query(
          'INSERT INTO subcategories (id, category_tag, name, image_url, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), category_tag = VALUES(category_tag), image_url = VALUES(image_url), is_active = VALUES(is_active), sort_order = VALUES(sort_order)',
          [item.id, item.categoryTag, item.name, item.imageUrl || null, item.isActive ? 1 : 0, item.sortOrder || 0]
        ).catch((err) => console.error('Error seeding default subcategory in MySQL:', err));
      }
    }
    return this.subcategories;
  }

  // Price Matrix
  getPriceMatrix(clothId?: string, serviceId?: string): ServicePriceItem[] {
    let result = this.priceMatrix;
    if (clothId) result = result.filter((p) => p.clothTypeId === clothId);
    if (serviceId) result = result.filter((p) => p.serviceId === serviceId);
    return result;
  }

  updatePriceItem(id: string, data: Partial<ServicePriceItem>): ServicePriceItem | null {
    const item = this.priceMatrix.find((p) => p.id === id);
    if (!item) return null;
    Object.assign(item, data);

    if (isDbConnected && pool) {
      pool.query(
        'UPDATE service_price_matrix SET price = ?, express_price = ?, turnaround_hours = ?, is_active = ? WHERE id = ?',
        [item.price, item.expressPrice || null, item.turnaroundHours, item.isActive ? 1 : 0, item.id]
      ).catch((err) => console.error('Error updating price item in MySQL:', err));
    }

    return item;
  }

  upsertPriceItem(data: ServicePriceItem): ServicePriceItem {
    const idx = this.priceMatrix.findIndex((p) => p.id === data.id || (p.clothTypeId === data.clothTypeId && p.serviceId === data.serviceId));
    if (idx >= 0) {
      this.priceMatrix[idx] = { ...this.priceMatrix[idx], ...data };
      const item = this.priceMatrix[idx];
      if (isDbConnected && pool) {
        pool.query(
          'UPDATE service_price_matrix SET price = ?, express_price = ?, turnaround_hours = ?, is_active = ? WHERE id = ?',
          [item.price, item.expressPrice || null, item.turnaroundHours, item.isActive ? 1 : 0, item.id]
        ).catch((err) => console.error('Error upserting price item in MySQL:', err));
      }
      return item;
    } else {
      this.priceMatrix.push(data);
      if (isDbConnected && pool) {
        pool.query(
          'INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [data.id, data.clothTypeId, data.clothName, data.clothIcon, data.categoryTag, data.serviceId, data.serviceName, data.price, data.expressPrice || null, data.turnaroundHours, data.isActive ? 1 : 0]
        ).catch((err) => console.error('Error inserting price item in MySQL:', err));
      }
      return data;
    }
  }

  deletePriceItem(id: string): boolean {
    const idx = this.priceMatrix.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.priceMatrix.splice(idx, 1);
    if (isDbConnected && pool) {
      pool.query('DELETE FROM service_price_matrix WHERE id = ?', [id]).catch((err) => console.error('Error deleting price item from MySQL:', err));
    }
    return true;
  }

  // Settings
  getPricingSettings(): PricingSettings {
    return this.pricingSettings;
  }

  updatePricingSettings(settings: Partial<PricingSettings>): PricingSettings {
    Object.assign(this.pricingSettings, settings);

    if (isDbConnected && pool) {
      const s = this.pricingSettings;
      pool
        .query(
          `UPDATE pricing_settings SET
            tax_percentage = ?, min_order_value = ?, free_delivery_threshold = ?,
            standard_delivery_fee = ?, express_delivery_fee = ?, same_day_delivery_fee = ?, extra_kg_price = ?,
            is_gst_enabled = ?, store_timings = ?,
            whatsapp_notifications_enabled = ?, sms_notifications_enabled = ?, email_notifications_enabled = ?,
            delivery_calculation_mode = ?, base_distance_km = ?, base_delivery_fee = ?,
            per_km_rate_after_base = ?, max_service_radius_km = ?,
            store_name = ?, store_address = ?, store_latitude = ?, store_longitude = ?, store_phone = ?,
            distance_tiers = ?
          WHERE id = 1`,
          [
            s.taxPercentage,
            s.minOrderValue,
            s.freeDeliveryThreshold,
            s.standardDeliveryFee,
            s.expressDeliveryFee,
            s.sameDayDeliveryFee ?? (s.expressDeliveryFee * 2),
            s.extraKgPrice,
            s.isGstEnabled !== false ? 1 : 0,
            s.storeTimings || '7:00 AM – 10:00 PM',
            s.whatsappNotificationsEnabled !== false ? 1 : 0,
            s.smsNotificationsEnabled !== false ? 1 : 0,
            s.emailNotificationsEnabled !== false ? 1 : 0,
            s.deliveryCalculationMode || 'DISTANCE_BASED',
            s.baseDistanceKm ?? 3,
            s.baseDeliveryFee ?? 30,
            s.perKmRateAfterBase ?? 10,
            s.maxServiceRadiusKm ?? 35,
            s.storeName || 'Anusha Laundry Central Hub',
            s.storeAddress || 'Anusha Bazaar, Kukatpally, Hyderabad - 500072',
            s.storeLatitude ?? 17.4929894,
            s.storeLongitude ?? 78.4144426,
            s.storePhone || '+91 40 4567 8901',
            s.distanceTiers ? JSON.stringify(s.distanceTiers) : null,
          ]
        )
        .catch((err) => console.error('Error updating pricing settings in MySQL:', err));
    }

    return this.pricingSettings;
  }

  // Bulk Pricing Methods
  getBulkPricing(): BulkPricingItem[] {
    return this.bulkPricing;
  }

  addBulkPrice(item: BulkPricingItem): BulkPricingItem {
    this.bulkPricing.push(item);
    return item;
  }

  updateBulkPrice(id: string, updates: Partial<BulkPricingItem>): BulkPricingItem | null {
    const idx = this.bulkPricing.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.bulkPricing[idx] = { ...this.bulkPricing[idx], ...updates };
    return this.bulkPricing[idx];
  }

  deleteBulkPrice(id: string): boolean {
    const beforeLen = this.bulkPricing.length;
    this.bulkPricing = this.bulkPricing.filter((b) => b.id !== id);
    return this.bulkPricing.length < beforeLen;
  }

  updateBulkSlab(serviceId: string, laundryType: BulkLaundryType, slabs: { weightKg: number; regularPrice: number; expressPrice: number }[]): BulkPricingItem[] {
    const service = this.serviceMasters.find((s) => s.id === serviceId);
    const serviceName = service ? service.name : serviceId;

    slabs.forEach((slab) => {
      const existingIdx = this.bulkPricing.findIndex(
        (b) => b.serviceId === serviceId && b.laundryType === laundryType && b.weightKg === slab.weightKg
      );

      if (existingIdx !== -1) {
        this.bulkPricing[existingIdx].regularPrice = slab.regularPrice;
        this.bulkPricing[existingIdx].expressPrice = slab.expressPrice;
      } else {
        this.bulkPricing.push({
          id: `bp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          laundryType,
          serviceId,
          serviceName,
          weightKg: slab.weightKg,
          regularPrice: slab.regularPrice,
          expressPrice: slab.expressPrice,
          regularTatHours: 48,
          expressTatHours: 12,
          isActive: true,
        });
      }
    });

    return this.bulkPricing.filter((b) => b.serviceId === serviceId && b.laundryType === laundryType);
  }

  getFullCatalog() {
    const dedupedPriceMap = new Map<string, any>();
    for (const p of this.priceMatrix) {
      if (!p.clothTypeId || !p.serviceId) continue;
      const key = `${p.clothTypeId}::${p.serviceId}`;
      const existing = dedupedPriceMap.get(key);
      if (!existing) {
        dedupedPriceMap.set(key, p);
      } else {
        const existingScore = (existing.clothName ? 2 : 0) + (existing.id?.includes('srv-m') ? 1 : 0);
        const newScore = (p.clothName ? 2 : 0) + (p.id?.includes('srv-m') ? 1 : 0);
        if (newScore > existingScore) {
          dedupedPriceMap.set(key, p);
        }
      }
    }
    return {
      categories: this.categories,
      subcategories: this.subcategories,
      clothTypes: this.clothTypes,
      serviceMasters: this.serviceMasters,
      priceMatrix: Array.from(dedupedPriceMap.values()),
      bulkPricing: this.bulkPricing,
      settings: this.pricingSettings,
      perKgServices: this.serviceMasters.filter((s) => s.pricingType === 'PER_KG' && s.isActive),
    };
  }

  getServices(catId?: string): Service[] {
    if (!catId || catId === 'all') return this.services;
    return this.services.filter((s) => s.categoryId === catId);
  }

  addService(data: Omit<Service, 'id'>): Service {
    const service: Service = { ...data, id: `service-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
    this.services.unshift(service);

    if (isDbConnected && pool) {
      pool
        .query(
          'INSERT INTO services (id, category_id, name, slug, description, pricing_model, base_price, unit, min_order_quantity, turnaround_hours, popular, express_available, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [service.id, service.categoryId, service.name, service.slug, service.description, service.pricingModel, service.basePrice, service.unit, service.minOrderQuantity || null, service.turnaroundHours, service.popular ? 1 : 0, service.expressAvailable ? 1 : 0, service.image || (service as any).imageUrl || null]
        )
        .catch((err) => console.error('Error creating service in MySQL:', err));
    }

    return service;
  }

  updateService(id: string, updates: Partial<Service>): Service | null {
    const service = this.services.find((item) => item.id === id);
    if (!service) return null;
    Object.assign(service, updates);

    if (isDbConnected && pool) {
      pool
        .query(
          'UPDATE services SET category_id = ?, name = ?, slug = ?, description = ?, pricing_model = ?, base_price = ?, unit = ?, min_order_quantity = ?, turnaround_hours = ?, popular = ?, express_available = ?, image_url = ? WHERE id = ?',
          [service.categoryId, service.name, service.slug, service.description, service.pricingModel, service.basePrice, service.unit, service.minOrderQuantity || null, service.turnaroundHours, service.popular ? 1 : 0, service.expressAvailable ? 1 : 0, service.image || (service as any).imageUrl || null, service.id]
        )
        .catch((err) => console.error('Error updating service in MySQL:', err));
    }

    return service;
  }

  deleteService(id: string): boolean {
    const index = this.services.findIndex((item) => item.id === id);
    if (index < 0) return false;
    this.services.splice(index, 1);

    if (isDbConnected && pool) {
      pool.query('DELETE FROM services WHERE id = ?', [id]).catch((err) => console.error('Error deleting service from MySQL:', err));
    }

    return true;
  }

  getCategories(): ServiceCategory[] {
    const seen = new Set<string>();
    return this.categories.filter((c) => {
      const key = String(c.id || '').trim().toUpperCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async reloadCategories(): Promise<void> {
    if (isDbConnected && pool) {
      const [catRows]: any = await pool.query('SELECT * FROM categories').catch(() => [[]]);
      if (Array.isArray(catRows)) {
        this.categories = catRows.map((r: any) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          icon: r.icon,
          description: r.description,
          isPopular: Boolean(r.is_popular),
          color: r.color || undefined,
          image: r.image_url || undefined,
          imageUrl: r.image_url || undefined,
        }));
      }
    }
  }

  addCategory(category: ServiceCategory): ServiceCategory {
    const existingIndex = this.categories.findIndex(
      (c) => c.id === category.id || (c.slug && category.slug && c.slug === category.slug)
    );
    if (existingIndex !== -1) {
      this.categories[existingIndex] = { ...this.categories[existingIndex], ...category };
    } else {
      this.categories.push(category);
    }
    if (isDbConnected && pool) {
      pool.query(
        'INSERT INTO categories (id, name, slug, icon, description, is_popular, color, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug), icon = VALUES(icon), description = VALUES(description), is_popular = VALUES(is_popular), color = VALUES(color), image_url = VALUES(image_url)',
        [category.id, category.name, category.slug, category.icon, category.description, category.isPopular ? 1 : 0, category.color || null, category.imageUrl || category.image || null]
      ).catch((err) => console.error('Error adding category to MySQL:', err));
    }
    return category;
  }

  updateCategory(id: string, updates: Partial<ServiceCategory>): ServiceCategory | null {
    const target = String(id || '').trim();
    const cat = this.categories.find((c) => 
      c.id === target || 
      c.slug === target || 
      c.slug?.toLowerCase() === target.toLowerCase() ||
      c.slug === target.toLowerCase().replace(/_/g, '-') ||
      (target === 'MENS' && (c.slug === 'mens-wear' || c.id === 'cat-1')) ||
      (target === 'WOMENS' && (c.slug === 'womens-wear' || c.id === 'cat-2')) ||
      (target === 'KIDS' && (c.slug === 'kids-wear' || c.id === 'cat-3')) ||
      (target === 'HOME_TEXTILES' && (c.slug === 'home-textiles' || c.id === 'cat-4')) ||
      (target === 'FOOTWEAR' && (c.slug === 'footwear' || c.slug === 'shoes' || c.id === 'cat-5')) ||
      (target === 'ACCESSORIES' && (c.slug === 'bags-accessories' || c.slug === 'accessories' || c.id === 'cat-6')) ||
      (target === 'BRIDAL' && (c.slug === 'bridal-wear' || c.slug === 'wedding-wear' || c.id === 'cat-7')) ||
      (target === 'SPECIAL' && (c.slug === 'special-cleaning' || c.slug === 'bulk-laundry' || c.id === 'cat-8'))
    );
    if (!cat) return null;
    Object.assign(cat, updates);
    if (updates.imageUrl) cat.imageUrl = updates.imageUrl;
    if (isDbConnected && pool) {
      pool.query(
        'UPDATE categories SET name = ?, slug = ?, icon = ?, description = ?, is_popular = ?, color = ?, image_url = ? WHERE id = ? OR slug = ?',
        [cat.name, cat.slug, cat.icon, cat.description, cat.isPopular ? 1 : 0, cat.color || null, cat.imageUrl || cat.image || null, cat.id, cat.slug]
      ).catch((err) => console.error('Error updating category in MySQL:', err));
    }
    return cat;
  }

  deleteCategory(id: string): boolean {
    const target = String(id || '').trim();
    const idx = this.categories.findIndex((c) =>
      c.id === target ||
      c.slug === target ||
      c.slug?.toLowerCase() === target.toLowerCase() ||
      c.slug === target.toLowerCase().replace(/_/g, '-') ||
      (target === 'MENS' && (c.slug === 'mens-wear' || c.id === 'cat-1')) ||
      (target === 'WOMENS' && (c.slug === 'womens-wear' || c.id === 'cat-2')) ||
      (target === 'KIDS' && (c.slug === 'kids-wear' || c.id === 'cat-3')) ||
      (target === 'HOME_TEXTILES' && (c.slug === 'home-textiles' || c.id === 'cat-4')) ||
      (target === 'FOOTWEAR' && (c.slug === 'footwear' || c.slug === 'shoes' || c.id === 'cat-5')) ||
      (target === 'ACCESSORIES' && (c.slug === 'bags-accessories' || c.slug === 'accessories' || c.id === 'cat-6')) ||
      (target === 'BRIDAL' && (c.slug === 'bridal-wear' || c.slug === 'wedding-wear' || c.id === 'cat-7')) ||
      (target === 'SPECIAL' && (c.slug === 'special-cleaning' || c.slug === 'bulk-laundry' || c.id === 'cat-8'))
    );

    if (idx < 0) {
      // Also try deleting directly from MySQL in case in-memory was out of sync
      if (isDbConnected && pool) {
        pool.query('DELETE FROM categories WHERE id = ? OR slug = ?', [target, target.toLowerCase().replace(/_/g, '-')]).catch(() => {});
      }
      return false;
    }

    const cat = this.categories[idx];
    this.categories.splice(idx, 1);
    if (isDbConnected && pool) {
      pool.query(
        'DELETE FROM categories WHERE id = ? OR id = ? OR slug = ?',
        [cat.id, target, cat.slug]
      ).catch((err) => console.error('Error deleting category from MySQL:', err));
    }
    return true;
  }

  getPincodes(): PincodeZone[] { return this.pincodes; }
  checkPincode(pin: string) {
    const clean = String(pin || '').trim();
    let found = this.pincodes.find((p) => p.pincode === clean);
    if (!found) {
      const initial = INITIAL_PINCODES.find((p) => p.pincode === clean);
      if (initial) {
        found = { ...initial };
        this.pincodes.push(found);
      }
    }
    return found;
  }

  addPincode(pin: PincodeZone): PincodeZone {
    const existingIdx = this.pincodes.findIndex((p) => p.pincode.trim() === pin.pincode.trim());
    if (existingIdx !== -1) {
      this.pincodes[existingIdx] = { ...this.pincodes[existingIdx], ...pin };
    } else {
      this.pincodes.unshift(pin);
    }

    if (isDbConnected && pool) {
      pool.query(
        'INSERT INTO pincodes (pincode, area_name, city, is_serviceable, standard_fee, min_free_order_value, express_available, average_turnaround_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE area_name = VALUES(area_name), city = VALUES(city), is_serviceable = VALUES(is_serviceable), standard_fee = VALUES(standard_fee), min_free_order_value = VALUES(min_free_order_value), express_available = VALUES(express_available), average_turnaround_hours = VALUES(average_turnaround_hours)',
        [pin.pincode, pin.areaName, pin.city, pin.isServiceable ? 1 : 0, pin.standardFee, pin.minFreeOrderValue, pin.expressAvailable ? 1 : 0, pin.averageTurnaroundHours]
      ).catch((err) => console.error('Error inserting pincode into MySQL:', err));
    }

    return pin;
  }

  updatePincode(pincode: string, updates: Partial<PincodeZone>): PincodeZone | null {
    const idx = this.pincodes.findIndex((p) => p.pincode.trim() === pincode.trim());
    if (idx === -1) return null;
    this.pincodes[idx] = { ...this.pincodes[idx], ...updates };
    const p = this.pincodes[idx];

    if (isDbConnected && pool) {
      pool.query(
        'UPDATE pincodes SET area_name = ?, city = ?, is_serviceable = ?, standard_fee = ?, min_free_order_value = ?, express_available = ?, average_turnaround_hours = ? WHERE pincode = ?',
        [p.areaName, p.city, p.isServiceable ? 1 : 0, p.standardFee, p.minFreeOrderValue, p.expressAvailable ? 1 : 0, p.averageTurnaroundHours, p.pincode]
      ).catch((err) => console.error('Error updating pincode in MySQL:', err));
    }

    return p;
  }

  deletePincode(pincode: string): boolean {
    const beforeLen = this.pincodes.length;
    this.pincodes = this.pincodes.filter((p) => p.pincode.trim() !== pincode.trim());

    if (isDbConnected && pool) {
      pool.query('DELETE FROM pincodes WHERE pincode = ?', [pincode.trim()]).catch((err) => console.error('Error deleting pincode from MySQL:', err));
    }

    return this.pincodes.length < beforeLen;
  }

  getCoupons(): Coupon[] { return this.coupons; }

  addCoupon(coupon: Coupon): Coupon {
    const idx = this.coupons.findIndex((c) => c.id === coupon.id || c.code.toUpperCase() === coupon.code.toUpperCase());
    if (idx !== -1) {
      this.coupons[idx] = { ...this.coupons[idx], ...coupon };
    } else {
      this.coupons.unshift(coupon);
    }

    if (isDbConnected && pool) {
      pool.query(
        'INSERT INTO coupons (id, code, title, description, discount_type, discount_value, min_order_value, max_discount_cap, first_order_only, expiry_date, usage_count, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), discount_type = VALUES(discount_type), discount_value = VALUES(discount_value), min_order_value = VALUES(min_order_value), max_discount_cap = VALUES(max_discount_cap), first_order_only = VALUES(first_order_only), expiry_date = VALUES(expiry_date), is_active = VALUES(is_active)',
        [coupon.id, coupon.code, coupon.title, coupon.description, coupon.discountType, coupon.discountValue, coupon.minOrderValue, coupon.maxDiscountCap || null, coupon.firstOrderOnly ? 1 : 0, coupon.expiryDate, coupon.usageCount || 0, coupon.isActive ? 1 : 0]
      ).catch((err) => console.error('Error inserting coupon to MySQL:', err));
    }

    return coupon;
  }

  updateCoupon(id: string, updates: Partial<Coupon>): Coupon | null {
    const idx = this.coupons.findIndex((c) => c.id === id || c.code.toUpperCase() === id.toUpperCase());
    if (idx === -1) return null;
    this.coupons[idx] = { ...this.coupons[idx], ...updates };
    const c = this.coupons[idx];

    if (isDbConnected && pool) {
      pool.query(
        'UPDATE coupons SET code = ?, title = ?, description = ?, discount_type = ?, discount_value = ?, min_order_value = ?, max_discount_cap = ?, first_order_only = ?, expiry_date = ?, is_active = ? WHERE id = ?',
        [c.code, c.title, c.description, c.discountType, c.discountValue, c.minOrderValue, c.maxDiscountCap || null, c.firstOrderOnly ? 1 : 0, c.expiryDate, c.isActive ? 1 : 0, c.id]
      ).catch((err) => console.error('Error updating coupon in MySQL:', err));
    }

    return c;
  }

  deleteCoupon(id: string): boolean {
    const beforeLen = this.coupons.length;
    this.coupons = this.coupons.filter((c) => c.id !== id && c.code.toUpperCase() !== id.toUpperCase());

    if (isDbConnected && pool) {
      pool.query('DELETE FROM coupons WHERE id = ?', [id]).catch((err) => console.error('Error deleting coupon from MySQL:', err));
    }

    return this.coupons.length < beforeLen;
  }

  getStaff(): StaffMember[] { return this.staff; }

  createStaff(data: Partial<StaffMember>): StaffMember {
    const id = data.id || `stf-${Date.now()}`;
    const newStaff: StaffMember = {
      id,
      name: data.name || 'Staff Member',
      email: data.email || 'staff@laundryfresh.com',
      phone: data.phone || '9876543210',
      role: data.role || 'LAUNDRY_STAFF',
      assignedFacility: data.assignedFacility || 'Rajahmundry Central Hub',
      assignedZone: data.assignedZone || 'ZONE-1',
      isActive: data.isActive !== undefined ? data.isActive : true,
      rating: 5.0,
      ordersProcessed: 0,
    };
    this.staff.unshift(newStaff);

    if (isDbConnected && pool) {
      pool.query(
        'INSERT INTO staff (id, name, email, phone, role, assigned_facility, assigned_zone, is_active, rating, orders_processed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newStaff.id, newStaff.name, newStaff.email, newStaff.phone, newStaff.role, newStaff.assignedFacility || null, newStaff.assignedZone || null, newStaff.isActive ? 1 : 0, newStaff.rating, newStaff.ordersProcessed]
      ).catch((err) => console.error('Error creating staff in MySQL:', err));
    }

    return newStaff;
  }

  updateStaff(id: string, updates: Partial<StaffMember>): StaffMember | null {
    const member = this.staff.find((s) => s.id === id);
    if (!member) return null;
    Object.assign(member, updates);

    if (isDbConnected && pool) {
      pool.query(
        'UPDATE staff SET name = ?, email = ?, phone = ?, role = ?, assigned_facility = ?, assigned_zone = ?, is_active = ? WHERE id = ?',
        [member.name, member.email, member.phone, member.role, member.assignedFacility || null, member.assignedZone || null, member.isActive ? 1 : 0, member.id]
      ).catch((err) => console.error('Error updating staff in MySQL:', err));
    }

    return member;
  }

  deleteStaff(id: string): boolean {
    const idx = this.staff.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.staff.splice(idx, 1);

    if (isDbConnected && pool) {
      pool.query('DELETE FROM staff WHERE id = ?', [id]).catch((err) => console.error('Error deleting staff from MySQL:', err));
    }

    return true;
  }

  getSubscriptionPlans(): any[] { return this.subscriptionPlans; }

  addSubscriptionPlan(plan: any): any {
    const idx = this.subscriptionPlans.findIndex((p: any) => p.id === plan.id || p.slug === plan.slug);
    if (idx !== -1) {
      this.subscriptionPlans[idx] = { ...this.subscriptionPlans[idx], ...plan };
    } else {
      this.subscriptionPlans.unshift(plan);
    }

    if (isDbConnected && pool) {
      pool.query(
        'REPLACE INTO subscriptions (id, name, slug, duration_months, price, original_price, validity_days, included_kg, free_pickup_delivery, priority_service, max_family_members, features, popular, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [plan.id, plan.name, plan.slug, plan.durationMonths || 1, plan.price, plan.originalPrice || null, plan.validityDays || 30, plan.includedKg || 20, plan.freePickupDelivery ? 1 : 0, plan.priorityService ? 1 : 0, plan.maxFamilyMembers || 1, JSON.stringify(plan.features || []), plan.popular ? 1 : 0, plan.isActive ? 1 : 0]
      ).catch((err) => console.error('Error inserting subscription to MySQL:', err));
    }

    return plan;
  }

  updateSubscriptionPlan(id: string, updates: any): any | null {
    const idx = this.subscriptionPlans.findIndex((p: any) => p.id === id);
    if (idx === -1) return null;
    this.subscriptionPlans[idx] = { ...this.subscriptionPlans[idx], ...updates };
    const plan = this.subscriptionPlans[idx];

    if (isDbConnected && pool) {
      pool.query(
        'REPLACE INTO subscriptions (id, name, slug, duration_months, price, original_price, validity_days, included_kg, free_pickup_delivery, priority_service, max_family_members, features, popular, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [plan.id, plan.name, plan.slug, plan.durationMonths || 1, plan.price, plan.originalPrice || null, plan.validityDays || 30, plan.includedKg || 20, plan.freePickupDelivery ? 1 : 0, plan.priorityService ? 1 : 0, plan.maxFamilyMembers || 1, JSON.stringify(plan.features || []), plan.popular ? 1 : 0, plan.isActive ? 1 : 0]
      ).catch((err) => console.error('Error updating subscription in MySQL:', err));
    }

    return plan;
  }

  deleteSubscriptionPlan(id: string): boolean {
    const beforeLen = this.subscriptionPlans.length;
    this.subscriptionPlans = this.subscriptionPlans.filter((p: any) => p.id !== id);

    if (isDbConnected && pool) {
      pool.query('DELETE FROM subscriptions WHERE id = ?', [id]).catch((err) => console.error('Error deleting subscription from MySQL:', err));
    }

    return this.subscriptionPlans.length < beforeLen;
  }

  // Inventory & Facility Machine Methods
  getConsumableInventory(): any[] { return this.consumables; }
  addConsumableInventory(item: any): any {
    const idx = this.consumables.findIndex((i: any) => i.id === item.id);
    if (idx !== -1) {
      this.consumables[idx] = { ...this.consumables[idx], ...item };
    } else {
      this.consumables.unshift({
        ...item,
        id: item.id || `inv-${Date.now()}`,
        status: item.currentStock <= item.minThreshold ? (item.currentStock <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK') : 'IN_STOCK',
      });
    }
    return item;
  }
  updateInventoryStock(id: string, newStockValue: number, reason?: string): any | null {
    const idx = this.consumables.findIndex((i: any) => i.id === id);
    if (idx === -1) return null;
    const item = this.consumables[idx];
    item.currentStock = newStockValue;
    item.status = newStockValue <= item.minThreshold ? (newStockValue <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK') : 'IN_STOCK';
    item.lastRestockedAt = new Date().toISOString().split('T')[0];
    return item;
  }

  getPackagingInventory(): any[] { return this.packaging; }

  getFacilityMachines(): any[] { return this.machines; }
  updateMachineStatus(id: string, status: string): any | null {
    const idx = this.machines.findIndex((m: any) => m.id === id || m.machineCode === id);
    if (idx === -1) return null;
    this.machines[idx].status = status;
    return this.machines[idx];
  }

  getMaintenanceLogs(): any[] { return this.maintenanceLogs; }

  // Customer Persistent Storage
  getCustomers(): any[] { return this.customers; }

  findCustomerByPhone(phone: string): any | undefined {
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone) return undefined;
    return this.customers.find(
      (c) => c.phone?.replace(/\D/g, '').slice(-10) === cleanPhone
    );
  }

  addCustomer(data: { id?: string; name?: string; phone: string; email?: string; role?: string }): any {
    const cleanPhone = String(data.phone || '').replace(/\D/g, '').slice(-10);
    const existingIdx = this.customers.findIndex(
      (c) => c.phone?.replace(/\D/g, '').slice(-10) === cleanPhone
    );
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let record: any;

    if (existingIdx !== -1) {
      this.customers[existingIdx] = {
        ...this.customers[existingIdx],
        name: data.name || this.customers[existingIdx].name || 'Valued Customer',
        email: data.email !== undefined ? data.email : this.customers[existingIdx].email,
        role: data.role || this.customers[existingIdx].role || 'CUSTOMER',
        updatedAt: now,
      };
      record = this.customers[existingIdx];
    } else {
      record = {
        id: data.id || `cust_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: data.name || 'Valued Customer',
        phone: cleanPhone,
        email: data.email || '',
        role: data.role || 'CUSTOMER',
        createdAt: now,
        updatedAt: now,
      };
      this.customers.unshift(record);
    }

    if (isDbConnected && pool) {
      pool
        .query(
          'REPLACE INTO customers (id, name, phone, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [record.id, record.name, record.phone, record.email || null, record.role || 'CUSTOMER', record.createdAt, record.updatedAt]
        )
        .catch((err) => console.error('Error saving customer to MySQL:', err));
    }

    return record;
  }

  findCustomerById(id: string): any | undefined {
    if (!id) return undefined;
    return this.customers.find((c) => c.id === id);
  }

  getCustomerPreferences(customerId: string): CustomerPreferences {
    const customer = this.findCustomerById(customerId);
    if (customer && customer.preferences) {
      if (typeof customer.preferences === 'string') {
        try {
          return { ...DEFAULT_CUSTOMER_PREFERENCES, ...JSON.parse(customer.preferences) };
        } catch {}
      } else {
        return { ...DEFAULT_CUSTOMER_PREFERENCES, ...customer.preferences };
      }
    }
    return { ...DEFAULT_CUSTOMER_PREFERENCES };
  }

  updateCustomerPreferences(customerId: string, prefs: Partial<CustomerPreferences>): CustomerPreferences {
    const customer = this.findCustomerById(customerId);
    const existing = this.getCustomerPreferences(customerId);
    const updated: CustomerPreferences = {
      ...existing,
      ...prefs,
    };
    if (customer) {
      customer.preferences = updated;
      customer.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    }
    if (isDbConnected && pool) {
      pool
        .query('UPDATE customers SET preferences = ?, updated_at = ? WHERE id = ?', [
          JSON.stringify(updated),
          new Date().toISOString().replace('T', ' ').substring(0, 16),
          customerId,
        ])
        .catch((err) => console.error('Error updating customer preferences in MySQL:', err));
    }
    return updated;
  }

  deleteCustomer(customerId: string): boolean {
    const idx = this.customers.findIndex((c) => c.id === customerId);
    if (idx !== -1) {
      this.customers.splice(idx, 1);
    }
    if (isDbConnected && pool) {
      Promise.all([
        pool.query('DELETE FROM customers WHERE id = ?', [customerId]),
        pool.query("UPDATE orders SET customer_name = 'Deleted Customer', customer_phone = '', address = NULL, updated_at = ? WHERE customer_id = ?", [new Date().toISOString().replace('T', ' ').substring(0, 16), customerId]),
        pool.query('DELETE FROM mobile_devices WHERE customer_id = ?', [customerId]),
        pool.query('DELETE FROM customer_notifications WHERE customer_id = ?', [customerId]),
      ]).catch((err) => console.error('Error deleting customer account data from MySQL:', err));
    }
    this.orders.forEach((order) => {
      if (order.customerId === customerId) {
        order.customerName = 'Deleted Customer';
        order.customerPhone = '';
        order.address = { id: '', type: 'Home', street: '', city: '', pincode: '' };
      }
    });
    return true;
  }

  // --- BANNERS SYSTEM ---
  banners: Banner[] = [...INITIAL_BANNERS];

  getBanners(onlyActive = false): Banner[] {
    const list = onlyActive ? this.banners.filter((b) => b.isActive) : this.banners;
    return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getBannerById(id: string): Banner | undefined {
    return this.banners.find((b) => b.id === id);
  }

  createBanner(data: Partial<Banner>): Banner {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newBanner: Banner = {
      id: data.id || `banner_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: data.title || 'Special Promotion',
      subtitle: data.subtitle || 'Doorstep Laundry Service',
      badgeText: data.badgeText || 'SPECIAL OFFER',
      imageUrl: data.imageUrl || 'https://anjanilaundry.s3.ap-south-2.amazonaws.com/banners/banner-bulk.jpg',
      mediaType: data.mediaType || 'IMAGE',
      videoUrl: data.videoUrl || undefined,
      couponCode: data.couponCode || '',
      discountPercent: data.discountPercent || 0,
      actionType: data.actionType || 'BOOK',
      actionTarget: data.actionTarget || '',
      displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : this.banners.length + 1,
      isActive: data.isActive !== undefined ? data.isActive : true,
      startDate: data.startDate,
      endDate: data.endDate,
      createdAt: now,
      updatedAt: now,
    };
    this.banners.push(newBanner);

    if (isDbConnected && pool) {
      pool.query(
        'INSERT INTO banners (id, title, subtitle, badge_text, coupon_code, discount_percent, image_url, media_type, video_url, action_type, action_target, display_order, is_active, start_date, end_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title), subtitle=VALUES(subtitle), badge_text=VALUES(badge_text), coupon_code=VALUES(coupon_code), discount_percent=VALUES(discount_percent), image_url=VALUES(image_url), media_type=VALUES(media_type), video_url=VALUES(video_url), action_type=VALUES(action_type), action_target=VALUES(action_target), display_order=VALUES(display_order), is_active=VALUES(is_active), updated_at=VALUES(updated_at)',
        [newBanner.id, newBanner.title, newBanner.subtitle || null, newBanner.badgeText || null, newBanner.couponCode || null, newBanner.discountPercent || 0, newBanner.imageUrl, newBanner.mediaType || 'IMAGE', newBanner.videoUrl || null, newBanner.actionType || 'BOOK', newBanner.actionTarget || '', newBanner.displayOrder || 1, newBanner.isActive ? 1 : 0, newBanner.startDate || null, newBanner.endDate || null, newBanner.createdAt, newBanner.updatedAt]
      ).catch((err) => console.error('Error inserting banner to MySQL:', err));
    }

    return newBanner;
  }

  updateBanner(id: string, data: Partial<Banner>): Banner | null {
    const idx = this.banners.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.banners[idx] = {
      ...this.banners[idx],
      ...data,
      updatedAt: now,
    };

    if (isDbConnected && pool) {
      const b = this.banners[idx];
      pool.query(
        'UPDATE banners SET title = ?, subtitle = ?, badge_text = ?, coupon_code = ?, discount_percent = ?, image_url = ?, media_type = ?, video_url = ?, action_type = ?, action_target = ?, display_order = ?, is_active = ?, start_date = ?, end_date = ?, updated_at = ? WHERE id = ?',
        [b.title, b.subtitle || null, b.badgeText || null, b.couponCode || null, b.discountPercent || 0, b.imageUrl, b.mediaType || 'IMAGE', b.videoUrl || null, b.actionType || 'BOOK', b.actionTarget || '', b.displayOrder || 1, b.isActive ? 1 : 0, b.startDate || null, b.endDate || null, b.updatedAt, id]
      ).catch((err) => console.error('Error updating banner in MySQL:', err));
    }

    return this.banners[idx];
  }

  deleteBanner(id: string): boolean {
    const idx = this.banners.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    this.banners.splice(idx, 1);

    if (isDbConnected && pool) {
      pool.query('DELETE FROM banners WHERE id = ?', [id]).catch((err) => console.error('Error deleting banner from MySQL:', err));
    }

    return true;
  }

  updateCustomerProfile(
    idOrPhone: string,
    data: { name?: string; email?: string; phone?: string; wishlist?: string[] }
  ): any | null {
    const cleanPhone = String(idOrPhone || '').replace(/\D/g, '').slice(-10);
    const idx = this.customers.findIndex(
      (c) => c.id === idOrPhone || (cleanPhone && c.phone?.replace(/\D/g, '').slice(-10) === cleanPhone)
    );
    if (idx === -1) return null;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.customers[idx] = {
      ...this.customers[idx],
      name: data.name !== undefined ? data.name : this.customers[idx].name,
      email: data.email !== undefined ? data.email : this.customers[idx].email,
      phone: data.phone ? data.phone.replace(/\D/g, '').slice(-10) : this.customers[idx].phone,
      wishlist: data.wishlist !== undefined ? data.wishlist : this.customers[idx].wishlist,
      updatedAt: now,
    };

    if (isDbConnected && pool) {
      pool
        .query(
          'UPDATE customers SET name = ?, email = ?, phone = ?, updated_at = NOW() WHERE id = ? OR phone LIKE ?',
          [this.customers[idx].name, this.customers[idx].email || null, this.customers[idx].phone, this.customers[idx].id, `%${cleanPhone}`]
        )
        .catch((err) => console.error('Error updating customer in MySQL:', err));
    }

    return this.customers[idx];
  }

  getCustomerWishlist(customerId: string): string[] {
    const cleanPhone = String(customerId || '').replace(/\D/g, '').slice(-10);
    const customer = this.customers.find(
      (c) => c.id === customerId || (cleanPhone && c.phone?.replace(/\D/g, '').slice(-10) === cleanPhone)
    );
    return customer?.wishlist || [];
  }

  addToCustomerWishlist(customerId: string, itemId: string): string[] {
    const cleanPhone = String(customerId || '').replace(/\D/g, '').slice(-10);
    let customer = this.customers.find(
      (c) => c.id === customerId || (cleanPhone && c.phone?.replace(/\D/g, '').slice(-10) === cleanPhone)
    );
    if (!customer) {
      customer = this.addCustomer({ id: customerId, name: 'Valued Customer', phone: cleanPhone || '9121999999' });
    }
    const currentList = Array.isArray(customer.wishlist) ? customer.wishlist : [];
    if (!currentList.includes(itemId)) {
      customer.wishlist = [...currentList, itemId];
      customer.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

      if (isDbConnected && pool) {
        pool
          .query(
            'UPDATE customers SET wishlist = ?, updated_at = NOW() WHERE id = ? OR phone LIKE ?',
            [JSON.stringify(customer.wishlist), customer.id, `%${cleanPhone}`]
          )
          .catch((err) => console.error('Error updating customer wishlist in MySQL:', err));
      }
    }
    return customer.wishlist;
  }

  removeFromCustomerWishlist(customerId: string, itemId: string): string[] {
    const cleanPhone = String(customerId || '').replace(/\D/g, '').slice(-10);
    const customer = this.customers.find(
      (c) => c.id === customerId || (cleanPhone && c.phone?.replace(/\D/g, '').slice(-10) === cleanPhone)
    );
    if (!customer) return [];
    customer.wishlist = (customer.wishlist || []).filter((id: string) => id !== itemId);
    customer.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (isDbConnected && pool) {
      pool
        .query(
          'UPDATE customers SET wishlist = ?, updated_at = NOW() WHERE id = ? OR phone LIKE ?',
          [JSON.stringify(customer.wishlist), customer.id, `%${cleanPhone}`]
        )
        .catch((err) => console.error('Error removing customer wishlist item in MySQL:', err));
    }
    return customer.wishlist;
  }

  mergeCustomerWishlist(customerId: string, itemIds: string[]): string[] {
    const cleanPhone = String(customerId || '').replace(/\D/g, '').slice(-10);
    let customer = this.customers.find(
      (c) => c.id === customerId || (cleanPhone && c.phone?.replace(/\D/g, '').slice(-10) === cleanPhone)
    );
    if (!customer) {
      customer = this.addCustomer({ id: customerId, name: 'Valued Customer', phone: cleanPhone || '9121999999' });
    }
    const currentList = Array.isArray(customer.wishlist) ? customer.wishlist : [];
    const merged = Array.from(new Set([...currentList, ...itemIds.filter(Boolean)]));
    customer.wishlist = merged;
    customer.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (isDbConnected && pool) {
      pool
        .query(
          'UPDATE customers SET wishlist = ?, updated_at = NOW() WHERE id = ? OR phone LIKE ?',
          [JSON.stringify(customer.wishlist), customer.id, `%${cleanPhone}`]
        )
        .catch((err) => console.error('Error merging customer wishlist in MySQL:', err));
    }
    return customer.wishlist;
  }

  getWishlistAnalytics(): Array<{
    clothId: string;
    clothName: string;
    categoryTag: string;
    savedCount: number;
  }> {
    const counts = new Map<string, number>();
    for (const c of this.customers) {
      if (Array.isArray(c.wishlist)) {
        for (const id of c.wishlist) {
          if (id && typeof id === 'string') {
            counts.set(id, (counts.get(id) || 0) + 1);
          }
        }
      }
    }

    const result: Array<{
      clothId: string;
      clothName: string;
      categoryTag: string;
      savedCount: number;
    }> = [];

    for (const [id, count] of counts.entries()) {
      const cloth = this.clothTypes.find((item) => item.id === id);
      const cleanName = id.replace(/^cloth-/, '').replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      result.push({
        clothId: id,
        clothName: cloth?.name || cleanName,
        categoryTag: cloth?.categoryTag || 'GENERAL',
        savedCount: count,
      });
    }

    return result.sort((a, b) => b.savedCount - a.savedCount);
  }
}

export const db = new BackendDatabase();

