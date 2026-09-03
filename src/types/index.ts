export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'LAUNDRY_STAFF'
  | 'PICKUP_AGENT'
  | 'DELIVERY_AGENT'
  | 'CUSTOMER';

export type PricingModel = 'PER_KG' | 'PER_ITEM';

export type OrderStatus =
  | 'ORDER_PLACED'
  | 'PICKUP_ASSIGNED'
  | 'PICKED_UP'
  | 'RECEIVED_AT_FACILITY'
  | 'WEIGHED_VERIFIED'
  | 'WASHING'
  | 'DRYING'
  | 'IRONING'
  | 'QUALITY_CHECK'
  | 'PACKED'
  | 'DELIVERY_ASSIGNED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentMethod = 'ONLINE_RAZORPAY' | 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET' | 'COD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type ExpressTier = 'REGULAR' | 'EXPRESS_24H' | 'SAME_DAY';

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  isPopular?: boolean;
  color?: string;
  imageUrl?: string;
  image?: string;
}


export interface Service {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  pricingModel: PricingModel;
  basePrice: number; // In INR (₹)
  unit: string; // "KG", "Item", "Pair", "Piece"
  minOrderQuantity?: number; // e.g. min 3 KG for wash & fold
  turnaroundHours: number; // e.g. 24, 48
  popular?: boolean;
  image?: string;
  imageUrl?: string;
  includedItems?: string[];
  expressAvailable?: boolean;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  serviceName: string;
  categoryName: string;
  pricingModel: PricingModel;
  unitPrice: number;
  quantity: number; // e.g. 4 (KG) or 3 (Items)
  estimatedWeightKg?: number;
  actualWeightKg?: number;
  unit: string;
  subtotal: number;
  specialInstructions?: string;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  updatedBy?: string;
  location?: string;
}

export interface Order {
  id: string; // e.g. "LAU10245"
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: {
    id: string;
    type: 'Home' | 'Office' | 'Other';
    street: string;
    landmark?: string;
    city: string;
    pincode: string;
  };
  items: OrderItem[];
  pricingModelSummary: PricingModel;
  expressTier: ExpressTier;
  pickupSlot: {
    date: string;
    slot: string; // "08:00 AM - 10:00 AM"
  };
  deliverySlot?: {
    date: string;
    slot: string;
  };
  pickupOtp: string; // e.g. "4921"
  deliveryOtp: string; // e.g. "8134"
  bagTagCode: string; // e.g. "BAG-LAU10245"
  currentStatus: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  assignedPickupAgent?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
  };
  assignedDeliveryAgent?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
  };
  facilityBatchId?: string;
  isWeighed: boolean;
  estimatedWeightKg?: number;
  actualWeightKg?: number;
  
  // Financials
  itemTotal: number;
  discountAmount: number;
  couponCode?: string;
  pickupDeliveryFee: number;
  expressFee: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  paymentGatewayOrderId?: string;
  paymentGateway?: 'RAZORPAY';
  
  notes?: string;
  garmentTags?: GarmentTagItem[];
  weightVerification?: WeightVerification;
  internalNotes?: InternalNote[];
  disputeReports?: DisputeReport[];
  assignedHubId?: string;
  deliveryDistanceKm?: number;
  distanceDeliveryFee?: number;
  qcRecords?: QCChecklistRecord[];
  photoEvidence?: GarmentPhotoEvidence[];
  reworkCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number; // 20 for 20%, 100 for ₹100
  minOrderValue: number;
  maxDiscountCap?: number;
  firstOrderOnly?: boolean;
  expiryDate: string;
  usageCount: number;
  usageLimit?: number;
  isActive: boolean;
}

export interface Offer {
  id: string;
  title: string;
  badge: string;
  description: string;
  code?: string;
  discount: string;
  validTill: string;
  color: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price: number; // e.g. 999
  validityDays: number; // 30
  includedKg: number; // 20
  freePickupDelivery: boolean;
  priorityService: boolean;
  maxFamilyMembers?: number;
  features: string[];
  popular?: boolean;
}

export interface CustomerSubscription {
  id: string;
  customerId: string;
  planId: string;
  planName: string;
  totalKg: number;
  usedKg: number;
  remainingKg: number;
  startDate: string;
  expiryDate: string;
  autoRenew: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}

export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  category: 'WELCOME_BONUS' | 'REFERRAL_REWARD' | 'ORDER_PAYMENT' | 'DISPUTE_REFUND' | 'CASH_RECHARGE' | 'LOYALTY_REDEMPTION';
  amount: number;
  balanceAfter: number;
  referenceId?: string;
  description: string;
  timestamp: string;
}

export interface Wallet {
  customerId: string;
  balance: number;
  rewardPoints: number;
  transactions: WalletTransaction[];
}

export interface PincodeZone {
  pincode: string;
  areaName: string;
  city: string;
  isServiceable: boolean;
  standardFee: number;
  minFreeOrderValue: number;
  expressAvailable: boolean;
  averageTurnaroundHours: number;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  assignedFacility?: string;
  assignedZone?: string;
  isActive: boolean;
  ordersProcessed?: number;
  rating?: number;
}

export interface LaundryBatch {
  id: string;
  stage: 'WASHING' | 'DRYING' | 'IRONING' | 'QC' | 'PACKING';
  machineId: string;
  orderIds: string[];
  totalWeightKg: number;
  startedAt: string;
  completedAt?: string;
  operatorName: string;
}

export type ClothCategoryTag =
  | 'MENS'
  | 'WOMENS'
  | 'KIDS'
  | 'HOME_TEXTILES'
  | 'FOOTWEAR'
  | 'ACCESSORIES'
  | 'TRADITIONAL';

export interface ClothType {
  id: string;
  name: string;
  icon: string;
  categoryTag: ClothCategoryTag;
  categoryLabel: string;
  subCategory?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  imageUrl?: string;
}

export interface ServiceMaster {
  id: string;
  name: string;
  slug: string;
  serviceCode?: 'PRESS' | 'WASH_IRON' | 'DRY_CLEAN' | 'SAREE_POLISH' | 'STARCH' | 'SHOE_SPA' | 'EXPRESS' | string;
  icon?: string;
  imageUrl?: string;
  pricingType: 'PER_KG' | 'PER_ITEM' | 'FIXED_PACKAGE';
  baseKgPrice?: number;
  minOrderKg?: number;
  turnaroundHours: number;
  description: string;
  isActive: boolean;
}


export interface ServicePriceItem {
  id: string;
  clothTypeId: string;
  clothName: string;
  clothIcon: string;
  categoryTag: ClothCategoryTag;
  serviceId: string;
  serviceName: string;
  price: number;
  expressPrice?: number;
  minQuantity?: number;
  turnaroundHours: number;
  isActive: boolean;
  isAvailable?: boolean;
  specialNotes?: string;
}

export interface PricingSettings {
  taxPercentage: number;
  minOrderValue: number;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  expressDeliveryFee: number;
  extraKgPrice: number;
}

// -------------------------------------------------------------
// P0 Operational & Production Lifecycle Interfaces
// -------------------------------------------------------------

export type GarmentTagStatus =
  | 'TAGGED'
  | 'WASHING'
  | 'DRYING'
  | 'IRONING'
  | 'QC_PASSED'
  | 'PACKED'
  | 'DISPUTED';

export interface GarmentTagItem {
  id: string; // e.g. "SH-10245-01"
  orderId: string;
  clothName: string;
  clothIcon: string;
  serviceName: string;
  barcode: string;
  currentStatus: GarmentTagStatus;
  qcNotes?: string;
  isDamaged?: boolean;
}

export type WeightVerificationStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED_BY_CUSTOMER'
  | 'AUTO_APPROVED'
  | 'DISPUTED';

export interface WeightVerification {
  orderId: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  estimatedWeightKg: number;
  ratePerKg: number;
  estimatedAmount: number;
  actualAmount: number;
  differenceAmount: number; // positive = customer owes more, negative = refund
  weighedAt: string;
  weighedBy: string;
  scalePhotoUrl?: string;
  status: WeightVerificationStatus;
  customerApprovedAt?: string;
}

export type DisputeType =
  | 'MISSING_ITEM'
  | 'DAMAGED_GARMENT'
  | 'COLOR_BLEED'
  | 'DELAY'
  | 'BILLING_DISPUTE';

export type DisputeStatus =
  | 'OPEN'
  | 'INVESTIGATING'
  | 'STAFF_VERIFIED'
  | 'RESOLVED_REFUND'
  | 'RESOLVED_CREDIT'
  | 'REJECTED';

export interface DisputeReport {
  id: string; // e.g. "DSP-1024"
  orderId: string;
  itemTagId?: string;
  itemName: string;
  issueType: DisputeType;
  description: string;
  evidencePhotoUrl?: string;
  reportedBy: string;
  reportedAt: string;
  status: DisputeStatus;
  resolutionNotes?: string;
  compensationAmount?: number;
  closedAt?: string;
}

export interface InternalNote {
  id: string;
  author: string;
  role: string;
  content: string;
  createdAt: string;
}

export type MachineStatus = 'AVAILABLE' | 'RUNNING' | 'MAINTENANCE' | 'OFFLINE';

export interface LaundryMachine {
  id: string; // "WM-001"
  type: 'WASHER' | 'DRYER' | 'STEAM_PRESS' | 'HYDRO_EXTRACTOR';
  name: string;
  capacityKg: number;
  currentLoadKg: number;
  status: MachineStatus;
  lastServiceDate: string;
  nextServiceDate: string;
}

export interface CODReconciliationRecord {
  id: string;
  riderId: string;
  riderName: string;
  date: string;
  orderIds: string[];
  totalCollected: number;
  depositedAmount: number;
  difference: number;
  status: 'SETTLED' | 'PENDING' | 'DISCREPANCY';
  notes?: string;
}

// Enterprise Operational & Fleet Infrastructure
export interface InHouseFleetVehicle {
  id: string; // "VAN-01", "EV-SCOOT-02"
  vehicleType: 'ELECTRIC_VAN' | 'DELIVERY_VAN' | 'CARGO_SCOOTER';
  registrationNo: string;
  driverName: string;
  driverPhone: string;
  capacityKg: number;
  status: 'IDLE' | 'ON_ROUTE' | 'MAINTENANCE';
  currentHubId: string;
}

export interface HubBranch {
  id: string; // "HUB-RJY-01", "HUB-BGL-01"
  name: string; // "Rajahmundry Central Hub"
  city: string;
  address: string;
  pincodes: string[];
  contactPhone: string;
  capacityKgPerDay: number;
  activeOrdersCount: number;
  inHouseVehicles: InHouseFleetVehicle[];
  isActive: boolean;
}

export interface DistanceTier {
  minKm: number;
  maxKm: number;
  fee: number; // In INR
}

export interface DistanceDeliveryConfig {
  baseDistanceKm: number; // e.g. 3 KM
  baseFee: number; // e.g. 0
  perKmRateAfterBase: number; // e.g. ₹10/KM
  distanceTiers: DistanceTier[];
  freeDeliveryOrderValue: number; // e.g. ₹499
  maxServiceRadiusKm: number; // e.g. 25 KM
  expressDeliveryMultiplier: number;
}

export interface TimeSlotCapacity {
  id: string;
  hubId: string;
  date: string;
  startTime: string;
  endTime: string;
  maxOrders: number;
  maxKg: number;
  bookedOrders: number;
  bookedKg: number;
  isAvailable: boolean;
  isActive: boolean;
}

export interface QCChecklistRecord {
  id: string;
  orderId: string;
  garmentTagId: string;
  clothName: string;
  stainRemoved: boolean;
  washedProperly: boolean;
  driedProperly: boolean;
  ironedProperly: boolean;
  noDamage: boolean;
  correctItem: boolean;
  correctQuantity: boolean;
  correctPackaging: boolean;
  status: 'QC_PASSED' | 'QC_FAILED_REWORK';
  reworkReason?: string;
  reworkCount: number;
  inspectedBy: string;
  inspectedAt: string;
}

export interface GarmentPhotoEvidence {
  id: string;
  orderId: string;
  garmentTagId?: string;
  stage: 'PICKUP_PRE_INSPECTION' | 'FACILITY_RECEIVED' | 'POST_QC_PACKED' | 'DAMAGE_EVIDENCE';
  photoUrl: string;
  notes?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface DamageCompensationRule {
  id: string;
  garmentCategory: string;
  damageType: 'MINOR_TEAR' | 'MAJOR_TEAR' | 'COLOR_BLEED' | 'MISSING_ITEM' | 'BUTTON_LOSS';
  maxCompensation: number;
  requiresAdminApproval: boolean;
}

export interface LoyaltyPointsAccount {
  customerId: string;
  totalPoints: number; // 100 points = ₹10
  pointsEarnedLifetime: number;
  pointsRedeemedLifetime: number;
  conversionRateInr: number;
}

export interface NotificationTemplate {
  id: string;
  eventName: string;
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL' | 'IN_APP';
  title: string;
  templateBody: string;
  placeholders: string[];
  isActive: boolean;
}

export interface ConsumableInventory {
  id: string;
  itemName: string;
  category: 'DETERGENT' | 'SOFTENER' | 'BLEACH' | 'TAGS_LABELS' | 'PACKAGING' | 'HANGER';
  currentStock: number;
  minThresholdStock: number;
  unit: 'KG' | 'LITRE' | 'PIECES' | 'ROLLS';
  unitCost: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  lastRestockedDate: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export type BulkLaundryType =
  | 'MIXED_LAUNDRY'
  | 'FAMILY_LAUNDRY'
  | 'STUDENT_LAUNDRY'
  | 'HOSTEL_LAUNDRY'
  | 'PG_LAUNDRY'
  | 'CORPORATE_LAUNDRY';

export interface BulkPricingItem {
  id: string;
  laundryType: BulkLaundryType;
  serviceId: string;
  serviceName: string;
  weightKg: number;
  regularPrice: number;
  expressPrice: number;
  regularTatHours: number;
  expressTatHours: number;
  minQuantity?: number;
  maxQuantity?: number;
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badgeText?: string;
  imageUrl: string;
  couponCode?: string;
  discountPercent?: number;
  actionType?: 'CATEGORY' | 'SERVICE' | 'OFFER' | 'BOOK' | 'URL';
  actionTarget?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}
