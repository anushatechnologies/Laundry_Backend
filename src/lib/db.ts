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
} from '../types';
import { pool, isDbConnected } from './mysql';

export const INITIAL_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat-1',
    name: "Men's Wear",
    slug: 'mens-wear',
    icon: '👔',
    description: 'Shirts, T-Shirts, Trousers, Suits, Blazers, Kurtas & Jackets.',
    isPopular: true,
    color: 'blue',
  },
  {
    id: 'cat-2',
    name: "Women's Wear",
    slug: 'womens-wear',
    icon: '👗',
    description: 'Sarees, Kurtis, Salwar Suits, Dresses, Gowns, Dupattas & Tops.',
    isPopular: true,
    color: 'pink',
  },
  {
    id: 'cat-3',
    name: 'Premium & Bridal Wear',
    slug: 'bridal-wear',
    icon: '💍',
    description: 'Bridal Lehengas, Heavy Sarees, Gowns, Sherwanis & Designer Wear.',
    isPopular: true,
    color: 'purple',
  },
  {
    id: 'cat-4',
    name: 'Kids Wear',
    slug: 'kids-wear',
    icon: '👶',
    description: 'Shirts, Frocks, Uniforms, Baby Rompers & Baby Blankets.',
    isPopular: false,
    color: 'amber',
  },
  {
    id: 'cat-5',
    name: 'Home Textiles',
    slug: 'home-textiles',
    icon: '🛏️',
    description: 'Bedsheets, Blankets, Comforters, Curtains, Towels & Cushion Covers.',
    isPopular: true,
    color: 'teal',
  },
  {
    id: 'cat-6',
    name: 'Special Deep Cleaning',
    slug: 'special-cleaning',
    icon: '🧹',
    description: 'Mattress, Carpet, Rug, Curtain & Sofa Cover Deep Treatment.',
    isPopular: false,
    color: 'indigo',
  },
  {
    id: 'cat-7',
    name: 'Bulk / Per-KG Laundry',
    slug: 'bulk-laundry',
    icon: '🧺',
    description: 'Everyday clothes, towels, bedsheets weighed per KG.',
    isPopular: true,
    color: 'emerald',
  },
  {
    id: 'cat-8',
    name: 'Baby Care Laundry',
    slug: 'baby-care',
    icon: '👶',
    description: 'Gentle sanitizing wash with extra rinse for sensitive baby skin.',
    isPopular: false,
    color: 'cyan',
  },
  {
    id: 'cat-9',
    name: 'Wedding & Couture Care',
    slug: 'wedding-care',
    icon: '💍',
    description: 'Special handling, hand finish, stain treatment & bridal packaging.',
    isPopular: false,
    color: 'rose',
  },
  {
    id: 'cat-10',
    name: 'Corporate & Bulk Commercial',
    slug: 'corporate-laundry',
    icon: '🏢',
    description: 'Hotel linen, PG laundry, gym towels, uniforms & monthly contracts.',
    isPopular: false,
    color: 'slate',
  },
];

export const INITIAL_CLOTH_TYPES: ClothType[] = [
  // ── MEN'S CLOTHING ──
  { id: 'cloth-shirt', name: 'Shirt', icon: '👔', categoryTag: 'MENS', categoryLabel: "Men's Clothing", description: 'Regular casual & formal shirts', isActive: true, sortOrder: 1 },
  { id: 'cloth-tshirt', name: 'T-Shirt', icon: '👕', categoryTag: 'MENS', categoryLabel: "Men's Clothing", description: 'Polo & round-neck t-shirts', isActive: true, sortOrder: 2 },
  { id: 'cloth-jeans', name: 'Jeans / Denim', icon: '👖', categoryTag: 'MENS', categoryLabel: "Men's Clothing", description: 'Heavy denim and cotton jeans', isActive: true, sortOrder: 3 },
  { id: 'cloth-trouser', name: 'Formal Trouser / Chinos', icon: '👖', categoryTag: 'MENS', categoryLabel: "Men's Clothing", description: 'Cotton trousers, chinos & pants', isActive: true, sortOrder: 4 },
  { id: 'cloth-kurta-m', name: 'Kurta (Men)', icon: '🥻', categoryTag: 'MENS', categoryLabel: "Men's Clothing", description: 'Cotton & festive silk kurtas', isActive: true, sortOrder: 5 },
  { id: 'cloth-dhoti', name: 'Dhoti / Mundu / Lungi', icon: '🥻', categoryTag: 'MENS', categoryLabel: "Men's Clothing", description: 'Traditional cotton & silk lower wear', isActive: true, sortOrder: 6 },
  { id: 'cloth-sherwani', name: 'Sherwani / Indo-Western', icon: '🤴', categoryTag: 'MENS', categoryLabel: "Men's Clothing", description: 'Groom & wedding ethnic designer wear', isActive: true, sortOrder: 7 },
  { id: 'cloth-nehru', name: 'Nehru Jacket / Waistcoat', icon: '🧥', categoryTag: 'MENS', categoryLabel: "Men's Clothing", description: 'Sleeveless Modi / Nehru bandhgala jacket', isActive: true, sortOrder: 8 },
  { id: 'cloth-blazer', name: 'Blazer / Coat', icon: '🧥', categoryTag: 'MENS', categoryLabel: "Men's Clothing", description: 'Single or double-breasted formal blazer', isActive: true, sortOrder: 9 },
  { id: 'cloth-suit-2p', name: 'Suit 2-Piece', icon: '👔', categoryTag: 'MENS', categoryLabel: "Men's Clothing", description: 'Blazer + Trouser combo set', isActive: true, sortOrder: 10 },
  { id: 'cloth-suit-3p', name: 'Suit 3-Piece', icon: '👔', categoryTag: 'MENS', categoryLabel: "Men's Clothing", description: 'Blazer + Vest + Trouser combo set', isActive: true, sortOrder: 11 },
  { id: 'cloth-sweater', name: 'Sweater / Pullover', icon: '🧶', categoryTag: 'MENS', categoryLabel: "Men's Clothing", description: 'Woolen & blended sweaters', isActive: true, sortOrder: 12 },
  { id: 'cloth-jacket', name: 'Winter Jacket', icon: '🧥', categoryTag: 'MENS', categoryLabel: "Men's Clothing", description: 'Fleece, windcheater & padded jacket', isActive: true, sortOrder: 13 },
  { id: 'cloth-tracksuit', name: 'Tracksuit / Gym Set', icon: '🏃', categoryTag: 'MENS', categoryLabel: "Men's Clothing", description: 'Athletic hoodie and trackpants', isActive: true, sortOrder: 14 },
  { id: 'cloth-tie', name: 'Tie / Pocket Square', icon: '👔', categoryTag: 'MENS', categoryLabel: "Men's Clothing", description: 'Silk ties, bowties and pocket squares', isActive: true, sortOrder: 15 },

  // ── WOMEN'S CLOTHING ──
  { id: 'cloth-saree-reg', name: 'Saree (Daily / Cotton)', icon: '🥻', categoryTag: 'WOMENS', categoryLabel: "Women's Clothing", description: 'Cotton, chiffon, georgette daily sarees', isActive: true, sortOrder: 16 },
  { id: 'cloth-saree-silk', name: 'Silk Saree (Kanchipuram / Zari)', icon: '🥻', categoryTag: 'WOMENS', categoryLabel: "Women's Clothing", description: 'Pure silk, Banarasi & embroidered zari sarees', isActive: true, sortOrder: 17 },
  { id: 'cloth-saree-heavy', name: 'Heavy Designer Saree', icon: '🥻', categoryTag: 'WOMENS', categoryLabel: "Women's Clothing", description: 'Stone work, cutwork and heavy bridal sarees', isActive: true, sortOrder: 18 },
  { id: 'cloth-blouse', name: 'Blouse', icon: '👚', categoryTag: 'WOMENS', categoryLabel: "Women's Clothing", description: 'Regular cotton & silk blouses', isActive: true, sortOrder: 19 },
  { id: 'cloth-blouse-padded', name: 'Blouse (Padded / Zari)', icon: '👚', categoryTag: 'WOMENS', categoryLabel: "Women's Clothing", description: 'Padded & designer embroidered blouses', isActive: true, sortOrder: 20 },
  { id: 'cloth-kurti', name: 'Kurti / Tunic', icon: '👚', categoryTag: 'WOMENS', categoryLabel: "Women's Clothing", description: 'Casual & partywear kurtis', isActive: true, sortOrder: 21 },
  { id: 'cloth-salwar', name: 'Salwar Kameez / Suit Set', icon: '👗', categoryTag: 'WOMENS', categoryLabel: "Women's Clothing", description: '3-Piece Top, Bottom & Dupatta set', isActive: true, sortOrder: 22 },
  { id: 'cloth-sharara', name: 'Sharara / Gharara Set', icon: '👗', categoryTag: 'WOMENS', categoryLabel: "Women's Clothing", description: 'Flared festive ethnic party wear', isActive: true, sortOrder: 23 },
  { id: 'cloth-dupatta', name: 'Dupatta / Stole', icon: '🧣', categoryTag: 'WOMENS', categoryLabel: "Women's Clothing", description: 'Cotton, chiffon and silk stoles', isActive: true, sortOrder: 24 },
  { id: 'cloth-leggings', name: 'Leggings / Plazo', icon: '👖', categoryTag: 'WOMENS', categoryLabel: "Women's Clothing", description: 'Stretch cotton leggings, jeggings and plazos', isActive: true, sortOrder: 25 },
  { id: 'cloth-lehenga', name: 'Bridal / Party Lehenga', icon: '👰', categoryTag: 'WOMENS', categoryLabel: "Women's Clothing", description: 'Heavy flared lehenga with stone & zardozi work', isActive: true, sortOrder: 26 },
  { id: 'cloth-dress-w', name: 'Dress / Western Gown', icon: '👗', categoryTag: 'WOMENS', categoryLabel: "Women's Clothing", description: 'Maxi dress, evening gowns & party dresses', isActive: true, sortOrder: 27 },
  { id: 'cloth-shawl', name: 'Kashmiri / Pashmina Shawl', icon: '🧣', categoryTag: 'WOMENS', categoryLabel: "Women's Clothing", description: 'Pure wool & delicate embroidered shawls', isActive: true, sortOrder: 28 },
  { id: 'cloth-nighty', name: 'Nighty / Loungewear', icon: '👘', categoryTag: 'WOMENS', categoryLabel: "Women's Clothing", description: 'Cotton nighties, kaftans and pyjamas', isActive: true, sortOrder: 29 },

  // ── KIDS & BABY CARE ──
  { id: 'cloth-kid-shirt', name: 'Kids Shirt / Top', icon: '👕', categoryTag: 'KIDS', categoryLabel: 'Kids Clothing', description: 'Infant to teenage shirts and tops', isActive: true, sortOrder: 30 },
  { id: 'cloth-kid-pant', name: 'Kids Pant / Shorts', icon: '🩳', categoryTag: 'KIDS', categoryLabel: 'Kids Clothing', description: 'Kids denim, track pants & shorts', isActive: true, sortOrder: 31 },
  { id: 'cloth-kid-dress', name: 'Kids Frock / Dress', icon: '👗', categoryTag: 'KIDS', categoryLabel: 'Kids Clothing', description: 'Girls dresses and party frocks', isActive: true, sortOrder: 32 },
  { id: 'cloth-kid-uniform', name: 'School Uniform Set', icon: '🎒', categoryTag: 'KIDS', categoryLabel: 'Kids Clothing', description: 'Shirt + Skirt/Trouser with tie and badge', isActive: true, sortOrder: 33 },
  { id: 'cloth-baby-romper', name: 'Baby Rompers (Pack of 3)', icon: '👶', categoryTag: 'KIDS', categoryLabel: 'Baby Care', description: 'Hypoallergenic sanitizing wash for infant onesies', isActive: true, sortOrder: 34 },
  { id: 'cloth-soft-toy', name: 'Soft Toys / Teddy Bear', icon: '🧸', categoryTag: 'KIDS', categoryLabel: 'Baby Care', description: 'Anti-allergen ozone sanitization for plush toys', isActive: true, sortOrder: 35 },

  // ── HOME & BEDDING TEXTILES ──
  { id: 'cloth-bedsheet-s', name: 'Bedsheet (Single)', icon: '🛏️', categoryTag: 'HOME_TEXTILES', categoryLabel: 'Home & Bedding', description: 'Single bedsheet + 1 pillow cover', isActive: true, sortOrder: 36 },
  { id: 'cloth-bedsheet-d', name: 'Bedsheet (Double / King)', icon: '🛏️', categoryTag: 'HOME_TEXTILES', categoryLabel: 'Home & Bedding', description: 'Double/King bedsheet + 2 pillow covers', isActive: true, sortOrder: 37 },
  { id: 'cloth-pillow-cover', name: 'Pillow Covers (Pair)', icon: '🛋️', categoryTag: 'HOME_TEXTILES', categoryLabel: 'Home & Bedding', description: 'Standard size bed pillow slips', isActive: true, sortOrder: 38 },
  { id: 'cloth-blanket', name: 'Blanket / Quilt (Single)', icon: '🛋️', categoryTag: 'HOME_TEXTILES', categoryLabel: 'Home & Bedding', description: 'Medium weight single quilt or fleece blanket', isActive: true, sortOrder: 39 },
  { id: 'cloth-blanket-d', name: 'Blanket / Mink (Double)', icon: '🛋️', categoryTag: 'HOME_TEXTILES', categoryLabel: 'Home & Bedding', description: 'Heavy double mink blanket with sanitization', isActive: true, sortOrder: 40 },
  { id: 'cloth-comforter', name: 'Heavy Comforter / Rajai (Double)', icon: '🛋️', categoryTag: 'HOME_TEXTILES', categoryLabel: 'Home & Bedding', description: 'Heavy double winter comforter or duvet', isActive: true, sortOrder: 41 },
  { id: 'cloth-curtain', name: 'Curtains (Per Panel)', icon: '🪟', categoryTag: 'HOME_TEXTILES', categoryLabel: 'Home & Bedding', description: 'Window and door curtains up to 9ft', isActive: true, sortOrder: 42 },
  { id: 'cloth-towel', name: 'Bath Towel', icon: '🛁', categoryTag: 'HOME_TEXTILES', categoryLabel: 'Home & Bedding', description: 'Plush cotton bath towels and robes', isActive: true, sortOrder: 43 },
  { id: 'cloth-sofa-cover', name: 'Sofa Covers (Set of 5)', icon: '🛋️', categoryTag: 'HOME_TEXTILES', categoryLabel: 'Home & Bedding', description: 'Living room cushion & sofa fabric covers', isActive: true, sortOrder: 44 },
  { id: 'cloth-tablecloth', name: 'Tablecloth / Runner', icon: '🍽️', categoryTag: 'HOME_TEXTILES', categoryLabel: 'Home & Bedding', description: '6-8 seater dining tablecloth and runner', isActive: true, sortOrder: 45 },
  { id: 'cloth-doormat', name: 'Door Mat / Small Rug', icon: '🚪', categoryTag: 'HOME_TEXTILES', categoryLabel: 'Home & Bedding', description: 'Entrance & bath microfiber mats', isActive: true, sortOrder: 46 },

  // ── FOOTWEAR & SHOES ──
  { id: 'cloth-shoes-sneaker', name: 'Sneakers / Sports Shoes', icon: '👟', categoryTag: 'FOOTWEAR', categoryLabel: 'Footwear', description: 'Mesh, knit & canvas running shoes', isActive: true, sortOrder: 47 },
  { id: 'cloth-shoes-formal', name: 'Formal Leather Shoes', icon: '👞', categoryTag: 'FOOTWEAR', categoryLabel: 'Footwear', description: 'Leather conditioning, buff & polish', isActive: true, sortOrder: 48 },
  { id: 'cloth-shoes-suede', name: 'Suede / Nubuck Shoes', icon: '👞', categoryTag: 'FOOTWEAR', categoryLabel: 'Footwear', description: 'Delicate suede shampoo & waterproofing', isActive: true, sortOrder: 49 },

  // ── BAGS & TRAVEL LUGGAGE ──
  { id: 'cloth-bag-backpack', name: 'Backpack / School Bag', icon: '🎒', categoryTag: 'ACCESSORIES', categoryLabel: 'Bags & Accessories', description: 'Canvas & polyester laptop backpacks', isActive: true, sortOrder: 50 },
  { id: 'cloth-bag-luxury', name: 'Luxury Handbag', icon: '👜', categoryTag: 'ACCESSORIES', categoryLabel: 'Bags & Accessories', description: 'Designer leather and fabric handbags', isActive: true, sortOrder: 51 },
  { id: 'cloth-trolley-cabin', name: 'Cabin Trolley Bag (20")', icon: '🧳', categoryTag: 'ACCESSORIES', categoryLabel: 'Travel & Luggage', description: 'Deep vacuum & outer shell sanitization', isActive: true, sortOrder: 52 },
  { id: 'cloth-trolley-large', name: 'Check-in Suitcase (28")', icon: '🧳', categoryTag: 'ACCESSORIES', categoryLabel: 'Travel & Luggage', description: 'Large luggage antibacterial shampooing', isActive: true, sortOrder: 53 },
  { id: 'cloth-helmet', name: 'Bike Riding Helmet', icon: '🪖', categoryTag: 'ACCESSORIES', categoryLabel: 'Accessories', description: 'Inner foam anti-odor deep sanitization', isActive: true, sortOrder: 54 },
];

export const INITIAL_SERVICE_MASTERS: ServiceMaster[] = [
  { id: 'srv-m-wash-fold', name: 'Wash & Fold', slug: 'wash-and-fold', icon: '🧺', pricingType: 'PER_KG', baseKgPrice: 60, minOrderKg: 3, turnaroundHours: 24, description: 'Hygienic wash, tumble dry, and neat compact fold.', isActive: true },
  { id: 'srv-m-wash-iron', name: 'Wash & Steam Iron', slug: 'wash-and-iron', icon: '👔', pricingType: 'PER_KG', baseKgPrice: 85, minOrderKg: 3, turnaroundHours: 36, description: 'Eco-wash + industrial steam pressing on hangers.', isActive: true },
  { id: 'srv-m-dry-clean', name: 'Dry Cleaning', slug: 'dry-cleaning', icon: '🧥', pricingType: 'PER_ITEM', turnaroundHours: 48, description: 'Hydrocarbon solvent treatment with breathable garment cover.', isActive: true },
  { id: 'srv-m-steam-iron', name: 'Steam Pressing Only', slug: 'steam-iron', icon: '♨️', pricingType: 'PER_ITEM', turnaroundHours: 18, description: 'High-pressure wrinkle removal with shape restoration.', isActive: true },
  { id: 'srv-m-charak', name: 'Saree Polishing & Charak', slug: 'saree-charak', icon: '🥻', pricingType: 'PER_ITEM', turnaroundHours: 48, description: 'Traditional starching, roll pressing & zari shine revival.', isActive: true },
  { id: 'srv-m-starch', name: 'Starch & Crisp Finish', slug: 'starch-finish', icon: '✨', pricingType: 'PER_ITEM', turnaroundHours: 24, description: 'Stiff starching for crisp cotton shirts, dhotis & uniforms.', isActive: true },
  { id: 'srv-m-spa', name: 'Deep Shoe & Leather Spa', slug: 'shoe-spa', icon: '👟', pricingType: 'PER_ITEM', turnaroundHours: 48, description: 'Ultrasonic stain treatment and antibacterial ozone sanitization.', isActive: true },
  { id: 'srv-m-express', name: 'Express Emergency Laundry', slug: 'express-emergency', icon: '⚡', pricingType: 'PER_KG', baseKgPrice: 120, minOrderKg: 3, turnaroundHours: 12, description: 'Dedicated machine slot with same-day return.', isActive: true },
];

export const INITIAL_SERVICE_PRICE_MATRIX: ServicePriceItem[] = [
  // ── 1. MEN'S CLOTHING ──
  // Shirt
  { id: 'pr-shirt-wf', clothTypeId: 'cloth-shirt', clothName: 'Shirt', clothIcon: '👔', categoryTag: 'MENS', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 30, expressPrice: 50, turnaroundHours: 24, isActive: true },
  { id: 'pr-shirt-wi', clothTypeId: 'cloth-shirt', clothName: 'Shirt', clothIcon: '👔', categoryTag: 'MENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 45, expressPrice: 65, turnaroundHours: 36, isActive: true },
  { id: 'pr-shirt-dc', clothTypeId: 'cloth-shirt', clothName: 'Shirt', clothIcon: '👔', categoryTag: 'MENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 80, expressPrice: 120, turnaroundHours: 48, isActive: true },
  { id: 'pr-shirt-si', clothTypeId: 'cloth-shirt', clothName: 'Shirt', clothIcon: '👔', categoryTag: 'MENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 20, expressPrice: 35, turnaroundHours: 18, isActive: true },
  { id: 'pr-shirt-ex', clothTypeId: 'cloth-shirt', clothName: 'Shirt', clothIcon: '👔', categoryTag: 'MENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 60, expressPrice: 90, turnaroundHours: 12, isActive: true },
  { id: 'pr-shirt-st', clothTypeId: 'cloth-shirt', clothName: 'Shirt', clothIcon: '👔', categoryTag: 'MENS', serviceId: 'srv-m-starch', serviceName: 'Starch & Crisp Finish', price: 25, expressPrice: 40, turnaroundHours: 24, isActive: true },

  // T-Shirt
  { id: 'pr-tshirt-wf', clothTypeId: 'cloth-tshirt', clothName: 'T-Shirt', clothIcon: '👕', categoryTag: 'MENS', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 25, expressPrice: 45, turnaroundHours: 24, isActive: true },
  { id: 'pr-tshirt-wi', clothTypeId: 'cloth-tshirt', clothName: 'T-Shirt', clothIcon: '👕', categoryTag: 'MENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 35, expressPrice: 55, turnaroundHours: 36, isActive: true },
  { id: 'pr-tshirt-dc', clothTypeId: 'cloth-tshirt', clothName: 'T-Shirt', clothIcon: '👕', categoryTag: 'MENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 60, expressPrice: 90, turnaroundHours: 48, isActive: true },
  { id: 'pr-tshirt-si', clothTypeId: 'cloth-tshirt', clothName: 'T-Shirt', clothIcon: '👕', categoryTag: 'MENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 15, expressPrice: 25, turnaroundHours: 18, isActive: true },
  { id: 'pr-tshirt-ex', clothTypeId: 'cloth-tshirt', clothName: 'T-Shirt', clothIcon: '👕', categoryTag: 'MENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 50, expressPrice: 75, turnaroundHours: 12, isActive: true },

  // Jeans
  { id: 'pr-jeans-wf', clothTypeId: 'cloth-jeans', clothName: 'Jeans / Denim', clothIcon: '👖', categoryTag: 'MENS', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 35, expressPrice: 55, turnaroundHours: 24, isActive: true },
  { id: 'pr-jeans-wi', clothTypeId: 'cloth-jeans', clothName: 'Jeans / Denim', clothIcon: '👖', categoryTag: 'MENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 50, expressPrice: 70, turnaroundHours: 36, isActive: true },
  { id: 'pr-jeans-dc', clothTypeId: 'cloth-jeans', clothName: 'Jeans / Denim', clothIcon: '👖', categoryTag: 'MENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 90, expressPrice: 130, turnaroundHours: 48, isActive: true },
  { id: 'pr-jeans-si', clothTypeId: 'cloth-jeans', clothName: 'Jeans / Denim', clothIcon: '👖', categoryTag: 'MENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 25, expressPrice: 40, turnaroundHours: 18, isActive: true },
  { id: 'pr-jeans-ex', clothTypeId: 'cloth-jeans', clothName: 'Jeans / Denim', clothIcon: '👖', categoryTag: 'MENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 70, expressPrice: 100, turnaroundHours: 12, isActive: true },

  // Formal Trouser
  { id: 'pr-trouser-wf', clothTypeId: 'cloth-trouser', clothName: 'Formal Trouser / Chinos', clothIcon: '👖', categoryTag: 'MENS', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 35, expressPrice: 55, turnaroundHours: 24, isActive: true },
  { id: 'pr-trouser-wi', clothTypeId: 'cloth-trouser', clothName: 'Formal Trouser / Chinos', clothIcon: '👖', categoryTag: 'MENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 50, expressPrice: 70, turnaroundHours: 36, isActive: true },
  { id: 'pr-trouser-dc', clothTypeId: 'cloth-trouser', clothName: 'Formal Trouser / Chinos', clothIcon: '👖', categoryTag: 'MENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 90, expressPrice: 130, turnaroundHours: 48, isActive: true },
  { id: 'pr-trouser-si', clothTypeId: 'cloth-trouser', clothName: 'Formal Trouser / Chinos', clothIcon: '👖', categoryTag: 'MENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 20, expressPrice: 35, turnaroundHours: 18, isActive: true },
  { id: 'pr-trouser-ex', clothTypeId: 'cloth-trouser', clothName: 'Formal Trouser / Chinos', clothIcon: '👖', categoryTag: 'MENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 70, expressPrice: 100, turnaroundHours: 12, isActive: true },
  { id: 'pr-trouser-st', clothTypeId: 'cloth-trouser', clothName: 'Formal Trouser / Chinos', clothIcon: '👖', categoryTag: 'MENS', serviceId: 'srv-m-starch', serviceName: 'Starch & Crisp Finish', price: 25, expressPrice: 40, turnaroundHours: 24, isActive: true },

  // Kurta (Men)
  { id: 'pr-kurta-m-wf', clothTypeId: 'cloth-kurta-m', clothName: 'Kurta (Men)', clothIcon: '🥻', categoryTag: 'MENS', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 45, expressPrice: 70, turnaroundHours: 24, isActive: true },
  { id: 'pr-kurta-m-wi', clothTypeId: 'cloth-kurta-m', clothName: 'Kurta (Men)', clothIcon: '🥻', categoryTag: 'MENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 65, expressPrice: 95, turnaroundHours: 36, isActive: true },
  { id: 'pr-kurta-m-dc', clothTypeId: 'cloth-kurta-m', clothName: 'Kurta (Men)', clothIcon: '🥻', categoryTag: 'MENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 110, expressPrice: 160, turnaroundHours: 48, isActive: true },
  { id: 'pr-kurta-m-si', clothTypeId: 'cloth-kurta-m', clothName: 'Kurta (Men)', clothIcon: '🥻', categoryTag: 'MENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 30, expressPrice: 45, turnaroundHours: 18, isActive: true },
  { id: 'pr-kurta-m-ex', clothTypeId: 'cloth-kurta-m', clothName: 'Kurta (Men)', clothIcon: '🥻', categoryTag: 'MENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 85, expressPrice: 120, turnaroundHours: 12, isActive: true },
  { id: 'pr-kurta-m-st', clothTypeId: 'cloth-kurta-m', clothName: 'Kurta (Men)', clothIcon: '🥻', categoryTag: 'MENS', serviceId: 'srv-m-starch', serviceName: 'Starch & Crisp Finish', price: 30, expressPrice: 45, turnaroundHours: 24, isActive: true },

  // Dhoti / Mundu
  { id: 'pr-dhoti-wf', clothTypeId: 'cloth-dhoti', clothName: 'Dhoti / Mundu / Lungi', clothIcon: '🥻', categoryTag: 'MENS', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 35, expressPrice: 55, turnaroundHours: 24, isActive: true },
  { id: 'pr-dhoti-wi', clothTypeId: 'cloth-dhoti', clothName: 'Dhoti / Mundu / Lungi', clothIcon: '🥻', categoryTag: 'MENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 55, expressPrice: 80, turnaroundHours: 36, isActive: true },
  { id: 'pr-dhoti-dc', clothTypeId: 'cloth-dhoti', clothName: 'Dhoti / Mundu / Lungi', clothIcon: '🥻', categoryTag: 'MENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 90, expressPrice: 130, turnaroundHours: 48, isActive: true },
  { id: 'pr-dhoti-si', clothTypeId: 'cloth-dhoti', clothName: 'Dhoti / Mundu / Lungi', clothIcon: '🥻', categoryTag: 'MENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 25, expressPrice: 40, turnaroundHours: 18, isActive: true },
  { id: 'pr-dhoti-ex', clothTypeId: 'cloth-dhoti', clothName: 'Dhoti / Mundu / Lungi', clothIcon: '🥻', categoryTag: 'MENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 70, expressPrice: 100, turnaroundHours: 12, isActive: true },
  { id: 'pr-dhoti-st', clothTypeId: 'cloth-dhoti', clothName: 'Dhoti / Mundu / Lungi', clothIcon: '🥻', categoryTag: 'MENS', serviceId: 'srv-m-starch', serviceName: 'Starch & Crisp Finish', price: 30, expressPrice: 45, turnaroundHours: 24, isActive: true },

  // Sherwani / Indo-Western
  { id: 'pr-sherwani-dc', clothTypeId: 'cloth-sherwani', clothName: 'Sherwani / Indo-Western', clothIcon: '🤴', categoryTag: 'MENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 450, expressPrice: 650, turnaroundHours: 72, isActive: true },
  { id: 'pr-sherwani-si', clothTypeId: 'cloth-sherwani', clothName: 'Sherwani / Indo-Western', clothIcon: '🤴', categoryTag: 'MENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 150, expressPrice: 220, turnaroundHours: 24, isActive: true },
  { id: 'pr-sherwani-ex', clothTypeId: 'cloth-sherwani', clothName: 'Sherwani / Indo-Western', clothIcon: '🤴', categoryTag: 'MENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 350, expressPrice: 500, turnaroundHours: 24, isActive: true },
  { id: 'pr-sherwani-spa', clothTypeId: 'cloth-sherwani', clothName: 'Sherwani / Indo-Western', clothIcon: '🤴', categoryTag: 'MENS', serviceId: 'srv-m-spa', serviceName: 'Deep Shoe & Leather Spa', price: 200, expressPrice: 290, turnaroundHours: 48, isActive: true },

  // Nehru Jacket / Waistcoat
  { id: 'pr-nehru-dc', clothTypeId: 'cloth-nehru', clothName: 'Nehru Jacket / Waistcoat', clothIcon: '🧥', categoryTag: 'MENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 120, expressPrice: 180, turnaroundHours: 48, isActive: true },
  { id: 'pr-nehru-si', clothTypeId: 'cloth-nehru', clothName: 'Nehru Jacket / Waistcoat', clothIcon: '🧥', categoryTag: 'MENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 50, expressPrice: 75, turnaroundHours: 18, isActive: true },
  { id: 'pr-nehru-ex', clothTypeId: 'cloth-nehru', clothName: 'Nehru Jacket / Waistcoat', clothIcon: '🧥', categoryTag: 'MENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 95, expressPrice: 140, turnaroundHours: 12, isActive: true },
  { id: 'pr-nehru-wi', clothTypeId: 'cloth-nehru', clothName: 'Nehru Jacket / Waistcoat', clothIcon: '🧥', categoryTag: 'MENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 70, expressPrice: 105, turnaroundHours: 36, isActive: true },

  // Blazer / Coat
  { id: 'pr-blazer-dc', clothTypeId: 'cloth-blazer', clothName: 'Blazer / Coat', clothIcon: '🧥', categoryTag: 'MENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 220, expressPrice: 320, turnaroundHours: 48, isActive: true },
  { id: 'pr-blazer-si', clothTypeId: 'cloth-blazer', clothName: 'Blazer / Coat', clothIcon: '🧥', categoryTag: 'MENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 90, expressPrice: 140, turnaroundHours: 24, isActive: true },
  { id: 'pr-blazer-ex', clothTypeId: 'cloth-blazer', clothName: 'Blazer / Coat', clothIcon: '🧥', categoryTag: 'MENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 180, expressPrice: 260, turnaroundHours: 18, isActive: true },

  // Suit 2-Piece
  { id: 'pr-suit-dc', clothTypeId: 'cloth-suit-2p', clothName: 'Suit 2-Piece', clothIcon: '👔', categoryTag: 'MENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 350, expressPrice: 480, turnaroundHours: 48, isActive: true },
  { id: 'pr-suit-si', clothTypeId: 'cloth-suit-2p', clothName: 'Suit 2-Piece', clothIcon: '👔', categoryTag: 'MENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 140, expressPrice: 200, turnaroundHours: 24, isActive: true },
  { id: 'pr-suit-ex', clothTypeId: 'cloth-suit-2p', clothName: 'Suit 2-Piece', clothIcon: '👔', categoryTag: 'MENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 280, expressPrice: 390, turnaroundHours: 18, isActive: true },

  // Suit 3-Piece
  { id: 'pr-suit-3p-dc', clothTypeId: 'cloth-suit-3p', clothName: 'Suit 3-Piece', clothIcon: '👔', categoryTag: 'MENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 450, expressPrice: 600, turnaroundHours: 48, isActive: true },
  { id: 'pr-suit-3p-si', clothTypeId: 'cloth-suit-3p', clothName: 'Suit 3-Piece', clothIcon: '👔', categoryTag: 'MENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 180, expressPrice: 250, turnaroundHours: 24, isActive: true },
  { id: 'pr-suit-3p-ex', clothTypeId: 'cloth-suit-3p', clothName: 'Suit 3-Piece', clothIcon: '👔', categoryTag: 'MENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 360, expressPrice: 490, turnaroundHours: 18, isActive: true },

  // Sweater / Pullover
  { id: 'pr-sweater-wf', clothTypeId: 'cloth-sweater', clothName: 'Sweater / Pullover', clothIcon: '🧶', categoryTag: 'MENS', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 50, expressPrice: 80, turnaroundHours: 24, isActive: true },
  { id: 'pr-sweater-wi', clothTypeId: 'cloth-sweater', clothName: 'Sweater / Pullover', clothIcon: '🧶', categoryTag: 'MENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 75, expressPrice: 110, turnaroundHours: 36, isActive: true },
  { id: 'pr-sweater-dc', clothTypeId: 'cloth-sweater', clothName: 'Sweater / Pullover', clothIcon: '🧶', categoryTag: 'MENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 120, expressPrice: 180, turnaroundHours: 48, isActive: true },
  { id: 'pr-sweater-si', clothTypeId: 'cloth-sweater', clothName: 'Sweater / Pullover', clothIcon: '🧶', categoryTag: 'MENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 40, expressPrice: 60, turnaroundHours: 18, isActive: true },
  { id: 'pr-sweater-ex', clothTypeId: 'cloth-sweater', clothName: 'Sweater / Pullover', clothIcon: '🧶', categoryTag: 'MENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 95, expressPrice: 140, turnaroundHours: 12, isActive: true },

  // Winter Jacket
  { id: 'pr-jacket-wf', clothTypeId: 'cloth-jacket', clothName: 'Winter Jacket', clothIcon: '🧥', categoryTag: 'MENS', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 80, expressPrice: 120, turnaroundHours: 24, isActive: true },
  { id: 'pr-jacket-wi', clothTypeId: 'cloth-jacket', clothName: 'Winter Jacket', clothIcon: '🧥', categoryTag: 'MENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 120, expressPrice: 170, turnaroundHours: 36, isActive: true },
  { id: 'pr-jacket-dc', clothTypeId: 'cloth-jacket', clothName: 'Winter Jacket', clothIcon: '🧥', categoryTag: 'MENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 250, expressPrice: 350, turnaroundHours: 48, isActive: true },
  { id: 'pr-jacket-si', clothTypeId: 'cloth-jacket', clothName: 'Winter Jacket', clothIcon: '🧥', categoryTag: 'MENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 60, expressPrice: 90, turnaroundHours: 24, isActive: true },
  { id: 'pr-jacket-ex', clothTypeId: 'cloth-jacket', clothName: 'Winter Jacket', clothIcon: '🧥', categoryTag: 'MENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 200, expressPrice: 290, turnaroundHours: 18, isActive: true },

  // Tracksuit / Gym Set
  { id: 'pr-tracksuit-wf', clothTypeId: 'cloth-tracksuit', clothName: 'Tracksuit / Gym Set', clothIcon: '🏃', categoryTag: 'MENS', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 45, expressPrice: 70, turnaroundHours: 24, isActive: true },
  { id: 'pr-tracksuit-wi', clothTypeId: 'cloth-tracksuit', clothName: 'Tracksuit / Gym Set', clothIcon: '🏃', categoryTag: 'MENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 70, expressPrice: 100, turnaroundHours: 36, isActive: true },
  { id: 'pr-tracksuit-dc', clothTypeId: 'cloth-tracksuit', clothName: 'Tracksuit / Gym Set', clothIcon: '🏃', categoryTag: 'MENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 140, expressPrice: 200, turnaroundHours: 48, isActive: true },
  { id: 'pr-tracksuit-si', clothTypeId: 'cloth-tracksuit', clothName: 'Tracksuit / Gym Set', clothIcon: '🏃', categoryTag: 'MENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 35, expressPrice: 50, turnaroundHours: 18, isActive: true },
  { id: 'pr-tracksuit-ex', clothTypeId: 'cloth-tracksuit', clothName: 'Tracksuit / Gym Set', clothIcon: '🏃', categoryTag: 'MENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 110, expressPrice: 160, turnaroundHours: 12, isActive: true },

  // Tie / Pocket Square
  { id: 'pr-tie-wi', clothTypeId: 'cloth-tie', clothName: 'Tie / Pocket Square', clothIcon: '👔', categoryTag: 'MENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 25, expressPrice: 40, turnaroundHours: 36, isActive: true },
  { id: 'pr-tie-dc', clothTypeId: 'cloth-tie', clothName: 'Tie / Pocket Square', clothIcon: '👔', categoryTag: 'MENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 40, expressPrice: 60, turnaroundHours: 48, isActive: true },
  { id: 'pr-tie-si', clothTypeId: 'cloth-tie', clothName: 'Tie / Pocket Square', clothIcon: '👔', categoryTag: 'MENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 15, expressPrice: 25, turnaroundHours: 18, isActive: true },
  { id: 'pr-tie-ex', clothTypeId: 'cloth-tie', clothName: 'Tie / Pocket Square', clothIcon: '👔', categoryTag: 'MENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 30, expressPrice: 45, turnaroundHours: 12, isActive: true },

  // ── 2. WOMEN'S CLOTHING ──
  // Saree (Daily / Cotton)
  { id: 'pr-saree-reg-wi', clothTypeId: 'cloth-saree-reg', clothName: 'Saree (Daily / Cotton)', clothIcon: '🥻', categoryTag: 'WOMENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 90, expressPrice: 140, turnaroundHours: 36, isActive: true },
  { id: 'pr-saree-reg-dc', clothTypeId: 'cloth-saree-reg', clothName: 'Saree (Daily / Cotton)', clothIcon: '🥻', categoryTag: 'WOMENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 150, expressPrice: 220, turnaroundHours: 48, isActive: true },
  { id: 'pr-saree-reg-si', clothTypeId: 'cloth-saree-reg', clothName: 'Saree (Daily / Cotton)', clothIcon: '🥻', categoryTag: 'WOMENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 60, expressPrice: 90, turnaroundHours: 24, isActive: true },
  { id: 'pr-saree-reg-ex', clothTypeId: 'cloth-saree-reg', clothName: 'Saree (Daily / Cotton)', clothIcon: '🥻', categoryTag: 'WOMENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 120, expressPrice: 175, turnaroundHours: 12, isActive: true },
  { id: 'pr-saree-reg-ch', clothTypeId: 'cloth-saree-reg', clothName: 'Saree (Daily / Cotton)', clothIcon: '🥻', categoryTag: 'WOMENS', serviceId: 'srv-m-charak', serviceName: 'Saree Polishing & Charak', price: 120, expressPrice: 180, turnaroundHours: 48, isActive: true },

  // Silk Saree (Kanchipuram / Zari)
  { id: 'pr-saree-silk-wi', clothTypeId: 'cloth-saree-silk', clothName: 'Silk Saree (Kanchipuram / Zari)', clothIcon: '🥻', categoryTag: 'WOMENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 130, expressPrice: 190, turnaroundHours: 36, isActive: true },
  { id: 'pr-saree-silk-dc', clothTypeId: 'cloth-saree-silk', clothName: 'Silk Saree (Kanchipuram / Zari)', clothIcon: '🥻', categoryTag: 'WOMENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 220, expressPrice: 320, turnaroundHours: 48, isActive: true },
  { id: 'pr-saree-silk-si', clothTypeId: 'cloth-saree-silk', clothName: 'Silk Saree (Kanchipuram / Zari)', clothIcon: '🥻', categoryTag: 'WOMENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 80, expressPrice: 120, turnaroundHours: 24, isActive: true },
  { id: 'pr-saree-silk-ex', clothTypeId: 'cloth-saree-silk', clothName: 'Silk Saree (Kanchipuram / Zari)', clothIcon: '🥻', categoryTag: 'WOMENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 180, expressPrice: 260, turnaroundHours: 18, isActive: true },
  { id: 'pr-saree-silk-ch', clothTypeId: 'cloth-saree-silk', clothName: 'Silk Saree (Kanchipuram / Zari)', clothIcon: '🥻', categoryTag: 'WOMENS', serviceId: 'srv-m-charak', serviceName: 'Saree Polishing & Charak', price: 150, expressPrice: 220, turnaroundHours: 48, isActive: true },

  // Heavy Designer Saree
  { id: 'pr-saree-heavy-dc', clothTypeId: 'cloth-saree-heavy', clothName: 'Heavy Designer Saree', clothIcon: '🥻', categoryTag: 'WOMENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 300, expressPrice: 420, turnaroundHours: 48, isActive: true },
  { id: 'pr-saree-heavy-si', clothTypeId: 'cloth-saree-heavy', clothName: 'Heavy Designer Saree', clothIcon: '🥻', categoryTag: 'WOMENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 100, expressPrice: 150, turnaroundHours: 24, isActive: true },
  { id: 'pr-saree-heavy-ex', clothTypeId: 'cloth-saree-heavy', clothName: 'Heavy Designer Saree', clothIcon: '🥻', categoryTag: 'WOMENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 240, expressPrice: 340, turnaroundHours: 18, isActive: true },
  { id: 'pr-saree-heavy-ch', clothTypeId: 'cloth-saree-heavy', clothName: 'Heavy Designer Saree', clothIcon: '🥻', categoryTag: 'WOMENS', serviceId: 'srv-m-charak', serviceName: 'Saree Polishing & Charak', price: 180, expressPrice: 260, turnaroundHours: 48, isActive: true },

  // Blouse
  { id: 'pr-blouse-wi', clothTypeId: 'cloth-blouse', clothName: 'Blouse', clothIcon: '👚', categoryTag: 'WOMENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 35, expressPrice: 55, turnaroundHours: 36, isActive: true },
  { id: 'pr-blouse-dc', clothTypeId: 'cloth-blouse', clothName: 'Blouse', clothIcon: '👚', categoryTag: 'WOMENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 60, expressPrice: 90, turnaroundHours: 48, isActive: true },
  { id: 'pr-blouse-si', clothTypeId: 'cloth-blouse', clothName: 'Blouse', clothIcon: '👚', categoryTag: 'WOMENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 20, expressPrice: 35, turnaroundHours: 18, isActive: true },
  { id: 'pr-blouse-ex', clothTypeId: 'cloth-blouse', clothName: 'Blouse', clothIcon: '👚', categoryTag: 'WOMENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 45, expressPrice: 70, turnaroundHours: 12, isActive: true },

  // Blouse (Padded / Zari)
  { id: 'pr-blouse-pad-wi', clothTypeId: 'cloth-blouse-padded', clothName: 'Blouse (Padded / Zari)', clothIcon: '👚', categoryTag: 'WOMENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 45, expressPrice: 65, turnaroundHours: 36, isActive: true },
  { id: 'pr-blouse-pad-dc', clothTypeId: 'cloth-blouse-padded', clothName: 'Blouse (Padded / Zari)', clothIcon: '👚', categoryTag: 'WOMENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 80, expressPrice: 120, turnaroundHours: 48, isActive: true },
  { id: 'pr-blouse-pad-si', clothTypeId: 'cloth-blouse-padded', clothName: 'Blouse (Padded / Zari)', clothIcon: '👚', categoryTag: 'WOMENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 25, expressPrice: 40, turnaroundHours: 18, isActive: true },
  { id: 'pr-blouse-pad-ex', clothTypeId: 'cloth-blouse-padded', clothName: 'Blouse (Padded / Zari)', clothIcon: '👚', categoryTag: 'WOMENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 65, expressPrice: 95, turnaroundHours: 12, isActive: true },

  // Kurti / Tunic
  { id: 'pr-kurti-wf', clothTypeId: 'cloth-kurti', clothName: 'Kurti / Tunic', clothIcon: '👚', categoryTag: 'WOMENS', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 30, expressPrice: 50, turnaroundHours: 24, isActive: true },
  { id: 'pr-kurti-wi', clothTypeId: 'cloth-kurti', clothName: 'Kurti / Tunic', clothIcon: '👚', categoryTag: 'WOMENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 45, expressPrice: 65, turnaroundHours: 36, isActive: true },
  { id: 'pr-kurti-dc', clothTypeId: 'cloth-kurti', clothName: 'Kurti / Tunic', clothIcon: '👚', categoryTag: 'WOMENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 80, expressPrice: 120, turnaroundHours: 48, isActive: true },
  { id: 'pr-kurti-si', clothTypeId: 'cloth-kurti', clothName: 'Kurti / Tunic', clothIcon: '👚', categoryTag: 'WOMENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 20, expressPrice: 35, turnaroundHours: 18, isActive: true },
  { id: 'pr-kurti-ex', clothTypeId: 'cloth-kurti', clothName: 'Kurti / Tunic', clothIcon: '👚', categoryTag: 'WOMENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 60, expressPrice: 90, turnaroundHours: 12, isActive: true },

  // Salwar Kameez / Suit Set
  { id: 'pr-salwar-wf', clothTypeId: 'cloth-salwar', clothName: 'Salwar Kameez / Suit Set', clothIcon: '👗', categoryTag: 'WOMENS', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 60, expressPrice: 90, turnaroundHours: 24, isActive: true },
  { id: 'pr-salwar-wi', clothTypeId: 'cloth-salwar', clothName: 'Salwar Kameez / Suit Set', clothIcon: '👗', categoryTag: 'WOMENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 85, expressPrice: 125, turnaroundHours: 36, isActive: true },
  { id: 'pr-salwar-dc', clothTypeId: 'cloth-salwar', clothName: 'Salwar Kameez / Suit Set', clothIcon: '👗', categoryTag: 'WOMENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 160, expressPrice: 230, turnaroundHours: 48, isActive: true },
  { id: 'pr-salwar-si', clothTypeId: 'cloth-salwar', clothName: 'Salwar Kameez / Suit Set', clothIcon: '👗', categoryTag: 'WOMENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 40, expressPrice: 60, turnaroundHours: 18, isActive: true },
  { id: 'pr-salwar-ex', clothTypeId: 'cloth-salwar', clothName: 'Salwar Kameez / Suit Set', clothIcon: '👗', categoryTag: 'WOMENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 130, expressPrice: 190, turnaroundHours: 12, isActive: true },

  // Sharara / Gharara Set
  { id: 'pr-sharara-wi', clothTypeId: 'cloth-sharara', clothName: 'Sharara / Gharara Set', clothIcon: '👗', categoryTag: 'WOMENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 140, expressPrice: 200, turnaroundHours: 36, isActive: true },
  { id: 'pr-sharara-dc', clothTypeId: 'cloth-sharara', clothName: 'Sharara / Gharara Set', clothIcon: '👗', categoryTag: 'WOMENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 280, expressPrice: 390, turnaroundHours: 48, isActive: true },
  { id: 'pr-sharara-si', clothTypeId: 'cloth-sharara', clothName: 'Sharara / Gharara Set', clothIcon: '👗', categoryTag: 'WOMENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 90, expressPrice: 135, turnaroundHours: 24, isActive: true },
  { id: 'pr-sharara-ex', clothTypeId: 'cloth-sharara', clothName: 'Sharara / Gharara Set', clothIcon: '👗', categoryTag: 'WOMENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 220, expressPrice: 310, turnaroundHours: 18, isActive: true },

  // Dupatta / Stole
  { id: 'pr-dupatta-wi', clothTypeId: 'cloth-dupatta', clothName: 'Dupatta / Stole', clothIcon: '🧣', categoryTag: 'WOMENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 30, expressPrice: 45, turnaroundHours: 36, isActive: true },
  { id: 'pr-dupatta-dc', clothTypeId: 'cloth-dupatta', clothName: 'Dupatta / Stole', clothIcon: '🧣', categoryTag: 'WOMENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 50, expressPrice: 75, turnaroundHours: 48, isActive: true },
  { id: 'pr-dupatta-si', clothTypeId: 'cloth-dupatta', clothName: 'Dupatta / Stole', clothIcon: '🧣', categoryTag: 'WOMENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 15, expressPrice: 25, turnaroundHours: 18, isActive: true },
  { id: 'pr-dupatta-ex', clothTypeId: 'cloth-dupatta', clothName: 'Dupatta / Stole', clothIcon: '🧣', categoryTag: 'WOMENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 40, expressPrice: 60, turnaroundHours: 12, isActive: true },

  // Leggings / Plazo
  { id: 'pr-leggings-wf', clothTypeId: 'cloth-leggings', clothName: 'Leggings / Plazo', clothIcon: '👖', categoryTag: 'WOMENS', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 25, expressPrice: 40, turnaroundHours: 24, isActive: true },
  { id: 'pr-leggings-wi', clothTypeId: 'cloth-leggings', clothName: 'Leggings / Plazo', clothIcon: '👖', categoryTag: 'WOMENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 35, expressPrice: 55, turnaroundHours: 36, isActive: true },
  { id: 'pr-leggings-dc', clothTypeId: 'cloth-leggings', clothName: 'Leggings / Plazo', clothIcon: '👖', categoryTag: 'WOMENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 60, expressPrice: 90, turnaroundHours: 48, isActive: true },
  { id: 'pr-leggings-si', clothTypeId: 'cloth-leggings', clothName: 'Leggings / Plazo', clothIcon: '👖', categoryTag: 'WOMENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 15, expressPrice: 25, turnaroundHours: 18, isActive: true },
  { id: 'pr-leggings-ex', clothTypeId: 'cloth-leggings', clothName: 'Leggings / Plazo', clothIcon: '👖', categoryTag: 'WOMENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 45, expressPrice: 70, turnaroundHours: 12, isActive: true },

  // Bridal / Party Lehenga
  { id: 'pr-lehenga-dc', clothTypeId: 'cloth-lehenga', clothName: 'Bridal / Party Lehenga', clothIcon: '👰', categoryTag: 'WOMENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 650, expressPrice: 900, turnaroundHours: 72, isActive: true },
  { id: 'pr-lehenga-si', clothTypeId: 'cloth-lehenga', clothName: 'Bridal / Party Lehenga', clothIcon: '👰', categoryTag: 'WOMENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 250, expressPrice: 350, turnaroundHours: 36, isActive: true },
  { id: 'pr-lehenga-ex', clothTypeId: 'cloth-lehenga', clothName: 'Bridal / Party Lehenga', clothIcon: '👰', categoryTag: 'WOMENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 490, expressPrice: 700, turnaroundHours: 24, isActive: true },
  { id: 'pr-lehenga-spa', clothTypeId: 'cloth-lehenga', clothName: 'Bridal / Party Lehenga', clothIcon: '👰', categoryTag: 'WOMENS', serviceId: 'srv-m-spa', serviceName: 'Deep Shoe & Leather Spa', price: 250, expressPrice: 360, turnaroundHours: 48, isActive: true },

  // Dress / Western Gown
  { id: 'pr-dress-w-wf', clothTypeId: 'cloth-dress-w', clothName: 'Dress / Western Gown', clothIcon: '👗', categoryTag: 'WOMENS', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 55, expressPrice: 85, turnaroundHours: 24, isActive: true },
  { id: 'pr-dress-w-wi', clothTypeId: 'cloth-dress-w', clothName: 'Dress / Western Gown', clothIcon: '👗', categoryTag: 'WOMENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 80, expressPrice: 120, turnaroundHours: 36, isActive: true },
  { id: 'pr-dress-w-dc', clothTypeId: 'cloth-dress-w', clothName: 'Dress / Western Gown', clothIcon: '👗', categoryTag: 'WOMENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 160, expressPrice: 240, turnaroundHours: 48, isActive: true },
  { id: 'pr-dress-w-si', clothTypeId: 'cloth-dress-w', clothName: 'Dress / Western Gown', clothIcon: '👗', categoryTag: 'WOMENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 40, expressPrice: 65, turnaroundHours: 18, isActive: true },
  { id: 'pr-dress-w-ex', clothTypeId: 'cloth-dress-w', clothName: 'Dress / Western Gown', clothIcon: '👗', categoryTag: 'WOMENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 130, expressPrice: 190, turnaroundHours: 12, isActive: true },

  // Kashmiri / Pashmina Shawl
  { id: 'pr-shawl-wi', clothTypeId: 'cloth-shawl', clothName: 'Kashmiri / Pashmina Shawl', clothIcon: '🧣', categoryTag: 'WOMENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 70, expressPrice: 105, turnaroundHours: 36, isActive: true },
  { id: 'pr-shawl-dc', clothTypeId: 'cloth-shawl', clothName: 'Kashmiri / Pashmina Shawl', clothIcon: '🧣', categoryTag: 'WOMENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 160, expressPrice: 240, turnaroundHours: 48, isActive: true },
  { id: 'pr-shawl-si', clothTypeId: 'cloth-shawl', clothName: 'Kashmiri / Pashmina Shawl', clothIcon: '🧣', categoryTag: 'WOMENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 40, expressPrice: 60, turnaroundHours: 18, isActive: true },
  { id: 'pr-shawl-ex', clothTypeId: 'cloth-shawl', clothName: 'Kashmiri / Pashmina Shawl', clothIcon: '🧣', categoryTag: 'WOMENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 130, expressPrice: 190, turnaroundHours: 12, isActive: true },

  // Nighty / Loungewear
  { id: 'pr-nighty-wf', clothTypeId: 'cloth-nighty', clothName: 'Nighty / Loungewear', clothIcon: '👘', categoryTag: 'WOMENS', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 30, expressPrice: 50, turnaroundHours: 24, isActive: true },
  { id: 'pr-nighty-wi', clothTypeId: 'cloth-nighty', clothName: 'Nighty / Loungewear', clothIcon: '👘', categoryTag: 'WOMENS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 45, expressPrice: 65, turnaroundHours: 36, isActive: true },
  { id: 'pr-nighty-dc', clothTypeId: 'cloth-nighty', clothName: 'Nighty / Loungewear', clothIcon: '👘', categoryTag: 'WOMENS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 80, expressPrice: 120, turnaroundHours: 48, isActive: true },
  { id: 'pr-nighty-si', clothTypeId: 'cloth-nighty', clothName: 'Nighty / Loungewear', clothIcon: '👘', categoryTag: 'WOMENS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 20, expressPrice: 35, turnaroundHours: 18, isActive: true },
  { id: 'pr-nighty-ex', clothTypeId: 'cloth-nighty', clothName: 'Nighty / Loungewear', clothIcon: '👘', categoryTag: 'WOMENS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 60, expressPrice: 90, turnaroundHours: 12, isActive: true },

  // ── 3. KIDS CLOTHING ──
  // Kids Shirt / Top
  { id: 'pr-kid-shirt-wf', clothTypeId: 'cloth-kid-shirt', clothName: 'Kids Shirt / Top', clothIcon: '👕', categoryTag: 'KIDS', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 20, expressPrice: 35, turnaroundHours: 24, isActive: true },
  { id: 'pr-kid-shirt-wi', clothTypeId: 'cloth-kid-shirt', clothName: 'Kids Shirt / Top', clothIcon: '👕', categoryTag: 'KIDS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 28, expressPrice: 45, turnaroundHours: 36, isActive: true },
  { id: 'pr-kid-shirt-dc', clothTypeId: 'cloth-kid-shirt', clothName: 'Kids Shirt / Top', clothIcon: '👕', categoryTag: 'KIDS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 50, expressPrice: 75, turnaroundHours: 48, isActive: true },
  { id: 'pr-kid-shirt-si', clothTypeId: 'cloth-kid-shirt', clothName: 'Kids Shirt / Top', clothIcon: '👕', categoryTag: 'KIDS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 12, expressPrice: 20, turnaroundHours: 18, isActive: true },
  { id: 'pr-kid-shirt-ex', clothTypeId: 'cloth-kid-shirt', clothName: 'Kids Shirt / Top', clothIcon: '👕', categoryTag: 'KIDS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 40, expressPrice: 60, turnaroundHours: 12, isActive: true },

  // Kids Pant / Shorts
  { id: 'pr-kid-pant-wf', clothTypeId: 'cloth-kid-pant', clothName: 'Kids Pant / Shorts', clothIcon: '🩳', categoryTag: 'KIDS', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 20, expressPrice: 35, turnaroundHours: 24, isActive: true },
  { id: 'pr-kid-pant-wi', clothTypeId: 'cloth-kid-pant', clothName: 'Kids Pant / Shorts', clothIcon: '🩳', categoryTag: 'KIDS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 28, expressPrice: 45, turnaroundHours: 36, isActive: true },
  { id: 'pr-kid-pant-dc', clothTypeId: 'cloth-kid-pant', clothName: 'Kids Pant / Shorts', clothIcon: '🩳', categoryTag: 'KIDS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 50, expressPrice: 75, turnaroundHours: 48, isActive: true },
  { id: 'pr-kid-pant-si', clothTypeId: 'cloth-kid-pant', clothName: 'Kids Pant / Shorts', clothIcon: '🩳', categoryTag: 'KIDS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 12, expressPrice: 20, turnaroundHours: 18, isActive: true },
  { id: 'pr-kid-pant-ex', clothTypeId: 'cloth-kid-pant', clothName: 'Kids Pant / Shorts', clothIcon: '🩳', categoryTag: 'KIDS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 40, expressPrice: 60, turnaroundHours: 12, isActive: true },

  // Kids Frock / Dress
  { id: 'pr-kid-dress-wf', clothTypeId: 'cloth-kid-dress', clothName: 'Kids Frock / Dress', clothIcon: '👗', categoryTag: 'KIDS', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 35, expressPrice: 55, turnaroundHours: 24, isActive: true },
  { id: 'pr-kid-dress-wi', clothTypeId: 'cloth-kid-dress', clothName: 'Kids Frock / Dress', clothIcon: '👗', categoryTag: 'KIDS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 50, expressPrice: 75, turnaroundHours: 36, isActive: true },
  { id: 'pr-kid-dress-dc', clothTypeId: 'cloth-kid-dress', clothName: 'Kids Frock / Dress', clothIcon: '👗', categoryTag: 'KIDS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 110, expressPrice: 160, turnaroundHours: 48, isActive: true },
  { id: 'pr-kid-dress-si', clothTypeId: 'cloth-kid-dress', clothName: 'Kids Frock / Dress', clothIcon: '👗', categoryTag: 'KIDS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 25, expressPrice: 40, turnaroundHours: 18, isActive: true },
  { id: 'pr-kid-dress-ex', clothTypeId: 'cloth-kid-dress', clothName: 'Kids Frock / Dress', clothIcon: '👗', categoryTag: 'KIDS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 85, expressPrice: 125, turnaroundHours: 12, isActive: true },

  // School Uniform Set
  { id: 'pr-kid-uniform-wf', clothTypeId: 'cloth-kid-uniform', clothName: 'School Uniform Set', clothIcon: '🎒', categoryTag: 'KIDS', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 40, expressPrice: 60, turnaroundHours: 24, isActive: true },
  { id: 'pr-kid-uniform-wi', clothTypeId: 'cloth-kid-uniform', clothName: 'School Uniform Set', clothIcon: '🎒', categoryTag: 'KIDS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 60, expressPrice: 90, turnaroundHours: 36, isActive: true },
  { id: 'pr-kid-uniform-dc', clothTypeId: 'cloth-kid-uniform', clothName: 'School Uniform Set', clothIcon: '🎒', categoryTag: 'KIDS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 120, expressPrice: 170, turnaroundHours: 48, isActive: true },
  { id: 'pr-kid-uniform-si', clothTypeId: 'cloth-kid-uniform', clothName: 'School Uniform Set', clothIcon: '🎒', categoryTag: 'KIDS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 25, expressPrice: 40, turnaroundHours: 18, isActive: true },
  { id: 'pr-kid-uniform-ex', clothTypeId: 'cloth-kid-uniform', clothName: 'School Uniform Set', clothIcon: '🎒', categoryTag: 'KIDS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 95, expressPrice: 135, turnaroundHours: 12, isActive: true },
  { id: 'pr-kid-uniform-st', clothTypeId: 'cloth-kid-uniform', clothName: 'School Uniform Set', clothIcon: '🎒', categoryTag: 'KIDS', serviceId: 'srv-m-starch', serviceName: 'Starch & Crisp Finish', price: 20, expressPrice: 35, turnaroundHours: 24, isActive: true },

  // Baby Rompers (Pack of 3)
  { id: 'pr-baby-romper-wf', clothTypeId: 'cloth-baby-romper', clothName: 'Baby Rompers (Pack of 3)', clothIcon: '👶', categoryTag: 'KIDS', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 35, expressPrice: 55, turnaroundHours: 24, isActive: true },
  { id: 'pr-baby-romper-wi', clothTypeId: 'cloth-baby-romper', clothName: 'Baby Rompers (Pack of 3)', clothIcon: '👶', categoryTag: 'KIDS', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 50, expressPrice: 75, turnaroundHours: 36, isActive: true },
  { id: 'pr-baby-romper-dc', clothTypeId: 'cloth-baby-romper', clothName: 'Baby Rompers (Pack of 3)', clothIcon: '👶', categoryTag: 'KIDS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 70, expressPrice: 100, turnaroundHours: 48, isActive: true },
  { id: 'pr-baby-romper-si', clothTypeId: 'cloth-baby-romper', clothName: 'Baby Rompers (Pack of 3)', clothIcon: '👶', categoryTag: 'KIDS', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 15, expressPrice: 25, turnaroundHours: 18, isActive: true },
  { id: 'pr-baby-romper-ex', clothTypeId: 'cloth-baby-romper', clothName: 'Baby Rompers (Pack of 3)', clothIcon: '👶', categoryTag: 'KIDS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 60, expressPrice: 90, turnaroundHours: 12, isActive: true },

  // Soft Toys / Teddy Bear
  { id: 'pr-soft-toy-spa', clothTypeId: 'cloth-soft-toy', clothName: 'Soft Toys / Teddy Bear', clothIcon: '🧸', categoryTag: 'KIDS', serviceId: 'srv-m-spa', serviceName: 'Deep Shoe & Leather Spa', price: 160, expressPrice: 240, turnaroundHours: 48, isActive: true },
  { id: 'pr-soft-toy-dc', clothTypeId: 'cloth-soft-toy', clothName: 'Soft Toys / Teddy Bear', clothIcon: '🧸', categoryTag: 'KIDS', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 140, expressPrice: 200, turnaroundHours: 48, isActive: true },
  { id: 'pr-soft-toy-ex', clothTypeId: 'cloth-soft-toy', clothName: 'Soft Toys / Teddy Bear', clothIcon: '🧸', categoryTag: 'KIDS', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 110, expressPrice: 160, turnaroundHours: 18, isActive: true },

  // ── 4. HOME & BEDDING ──
  // Bedsheet (Single)
  { id: 'pr-bedsheet-s-wf', clothTypeId: 'cloth-bedsheet-s', clothName: 'Bedsheet (Single)', clothIcon: '🛏️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 50, expressPrice: 75, turnaroundHours: 24, isActive: true },
  { id: 'pr-bedsheet-s-wi', clothTypeId: 'cloth-bedsheet-s', clothName: 'Bedsheet (Single)', clothIcon: '🛏️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 80, expressPrice: 120, turnaroundHours: 36, isActive: true },
  { id: 'pr-bedsheet-s-dc', clothTypeId: 'cloth-bedsheet-s', clothName: 'Bedsheet (Single)', clothIcon: '🛏️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 120, expressPrice: 170, turnaroundHours: 48, isActive: true },
  { id: 'pr-bedsheet-s-si', clothTypeId: 'cloth-bedsheet-s', clothName: 'Bedsheet (Single)', clothIcon: '🛏️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 35, expressPrice: 55, turnaroundHours: 18, isActive: true },
  { id: 'pr-bedsheet-s-ex', clothTypeId: 'cloth-bedsheet-s', clothName: 'Bedsheet (Single)', clothIcon: '🛏️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 95, expressPrice: 140, turnaroundHours: 12, isActive: true },

  // Bedsheet (Double / King)
  { id: 'pr-bedsheet-d-wf', clothTypeId: 'cloth-bedsheet-d', clothName: 'Bedsheet (Double / King)', clothIcon: '🛏️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 80, expressPrice: 120, turnaroundHours: 24, isActive: true },
  { id: 'pr-bedsheet-d-wi', clothTypeId: 'cloth-bedsheet-d', clothName: 'Bedsheet (Double / King)', clothIcon: '🛏️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 120, expressPrice: 180, turnaroundHours: 36, isActive: true },
  { id: 'pr-bedsheet-d-dc', clothTypeId: 'cloth-bedsheet-d', clothName: 'Bedsheet (Double / King)', clothIcon: '🛏️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 160, expressPrice: 240, turnaroundHours: 48, isActive: true },
  { id: 'pr-bedsheet-d-si', clothTypeId: 'cloth-bedsheet-d', clothName: 'Bedsheet (Double / King)', clothIcon: '🛏️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 50, expressPrice: 75, turnaroundHours: 18, isActive: true },
  { id: 'pr-bedsheet-d-ex', clothTypeId: 'cloth-bedsheet-d', clothName: 'Bedsheet (Double / King)', clothIcon: '🛏️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 130, expressPrice: 190, turnaroundHours: 12, isActive: true },

  // Pillow Covers (Pair)
  { id: 'pr-pillow-cover-wf', clothTypeId: 'cloth-pillow-cover', clothName: 'Pillow Covers (Pair)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 25, expressPrice: 40, turnaroundHours: 24, isActive: true },
  { id: 'pr-pillow-cover-wi', clothTypeId: 'cloth-pillow-cover', clothName: 'Pillow Covers (Pair)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 35, expressPrice: 55, turnaroundHours: 36, isActive: true },
  { id: 'pr-pillow-cover-dc', clothTypeId: 'cloth-pillow-cover', clothName: 'Pillow Covers (Pair)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 40, expressPrice: 60, turnaroundHours: 48, isActive: true },
  { id: 'pr-pillow-cover-si', clothTypeId: 'cloth-pillow-cover', clothName: 'Pillow Covers (Pair)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 15, expressPrice: 25, turnaroundHours: 18, isActive: true },
  { id: 'pr-pillow-cover-ex', clothTypeId: 'cloth-pillow-cover', clothName: 'Pillow Covers (Pair)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 30, expressPrice: 45, turnaroundHours: 12, isActive: true },

  // Blanket / Quilt (Single)
  { id: 'pr-blanket-wf', clothTypeId: 'cloth-blanket', clothName: 'Blanket / Quilt (Single)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 180, expressPrice: 260, turnaroundHours: 36, isActive: true },
  { id: 'pr-blanket-dc', clothTypeId: 'cloth-blanket', clothName: 'Blanket / Quilt (Single)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 240, expressPrice: 340, turnaroundHours: 48, isActive: true },
  { id: 'pr-blanket-ex', clothTypeId: 'cloth-blanket', clothName: 'Blanket / Quilt (Single)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 190, expressPrice: 270, turnaroundHours: 24, isActive: true },
  { id: 'pr-blanket-spa', clothTypeId: 'cloth-blanket', clothName: 'Blanket / Quilt (Single)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-spa', serviceName: 'Deep Shoe & Leather Spa', price: 260, expressPrice: 370, turnaroundHours: 48, isActive: true },

  // Blanket / Mink (Double)
  { id: 'pr-blanket-d-wf', clothTypeId: 'cloth-blanket-d', clothName: 'Blanket / Mink (Double)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 240, expressPrice: 340, turnaroundHours: 36, isActive: true },
  { id: 'pr-blanket-d-dc', clothTypeId: 'cloth-blanket-d', clothName: 'Blanket / Mink (Double)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 320, expressPrice: 440, turnaroundHours: 48, isActive: true },
  { id: 'pr-blanket-d-ex', clothTypeId: 'cloth-blanket-d', clothName: 'Blanket / Mink (Double)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 250, expressPrice: 360, turnaroundHours: 24, isActive: true },
  { id: 'pr-blanket-d-spa', clothTypeId: 'cloth-blanket-d', clothName: 'Blanket / Mink (Double)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-spa', serviceName: 'Deep Shoe & Leather Spa', price: 340, expressPrice: 480, turnaroundHours: 48, isActive: true },

  // Heavy Comforter / Rajai (Double)
  { id: 'pr-comforter-wf', clothTypeId: 'cloth-comforter', clothName: 'Heavy Comforter / Rajai (Double)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 240, expressPrice: 350, turnaroundHours: 36, isActive: true },
  { id: 'pr-comforter-dc', clothTypeId: 'cloth-comforter', clothName: 'Heavy Comforter / Rajai (Double)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 320, expressPrice: 450, turnaroundHours: 48, isActive: true },
  { id: 'pr-comforter-ex', clothTypeId: 'cloth-comforter', clothName: 'Heavy Comforter / Rajai (Double)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 250, expressPrice: 360, turnaroundHours: 24, isActive: true },
  { id: 'pr-comforter-spa', clothTypeId: 'cloth-comforter', clothName: 'Heavy Comforter / Rajai (Double)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-spa', serviceName: 'Deep Shoe & Leather Spa', price: 350, expressPrice: 490, turnaroundHours: 48, isActive: true },

  // Curtains (Per Panel)
  { id: 'pr-curtain-wi', clothTypeId: 'cloth-curtain', clothName: 'Curtains (Per Panel)', clothIcon: '🪟', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 70, expressPrice: 110, turnaroundHours: 36, isActive: true },
  { id: 'pr-curtain-dc', clothTypeId: 'cloth-curtain', clothName: 'Curtains (Per Panel)', clothIcon: '🪟', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 120, expressPrice: 180, turnaroundHours: 48, isActive: true },
  { id: 'pr-curtain-si', clothTypeId: 'cloth-curtain', clothName: 'Curtains (Per Panel)', clothIcon: '🪟', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 35, expressPrice: 55, turnaroundHours: 18, isActive: true },
  { id: 'pr-curtain-ex', clothTypeId: 'cloth-curtain', clothName: 'Curtains (Per Panel)', clothIcon: '🪟', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 95, expressPrice: 140, turnaroundHours: 12, isActive: true },

  // Bath Towel
  { id: 'pr-towel-wf', clothTypeId: 'cloth-towel', clothName: 'Bath Towel', clothIcon: '🛁', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 35, expressPrice: 55, turnaroundHours: 24, isActive: true },
  { id: 'pr-towel-wi', clothTypeId: 'cloth-towel', clothName: 'Bath Towel', clothIcon: '🛁', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 50, expressPrice: 75, turnaroundHours: 36, isActive: true },
  { id: 'pr-towel-dc', clothTypeId: 'cloth-towel', clothName: 'Bath Towel', clothIcon: '🛁', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 50, expressPrice: 75, turnaroundHours: 48, isActive: true },
  { id: 'pr-towel-si', clothTypeId: 'cloth-towel', clothName: 'Bath Towel', clothIcon: '🛁', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 15, expressPrice: 25, turnaroundHours: 18, isActive: true },
  { id: 'pr-towel-ex', clothTypeId: 'cloth-towel', clothName: 'Bath Towel', clothIcon: '🛁', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 40, expressPrice: 60, turnaroundHours: 12, isActive: true },

  // Sofa Covers (Set of 5)
  { id: 'pr-sofa-cover-wi', clothTypeId: 'cloth-sofa-cover', clothName: 'Sofa Covers (Set of 5)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 140, expressPrice: 200, turnaroundHours: 36, isActive: true },
  { id: 'pr-sofa-cover-dc', clothTypeId: 'cloth-sofa-cover', clothName: 'Sofa Covers (Set of 5)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 220, expressPrice: 320, turnaroundHours: 48, isActive: true },
  { id: 'pr-sofa-cover-si', clothTypeId: 'cloth-sofa-cover', clothName: 'Sofa Covers (Set of 5)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 60, expressPrice: 90, turnaroundHours: 24, isActive: true },
  { id: 'pr-sofa-cover-ex', clothTypeId: 'cloth-sofa-cover', clothName: 'Sofa Covers (Set of 5)', clothIcon: '🛋️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 175, expressPrice: 250, turnaroundHours: 18, isActive: true },

  // Tablecloth / Runner
  { id: 'pr-tablecloth-wf', clothTypeId: 'cloth-tablecloth', clothName: 'Tablecloth / Runner', clothIcon: '🍽️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 40, expressPrice: 60, turnaroundHours: 24, isActive: true },
  { id: 'pr-tablecloth-wi', clothTypeId: 'cloth-tablecloth', clothName: 'Tablecloth / Runner', clothIcon: '🍽️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-wash-iron', serviceName: 'Wash & Steam Iron', price: 70, expressPrice: 100, turnaroundHours: 36, isActive: true },
  { id: 'pr-tablecloth-dc', clothTypeId: 'cloth-tablecloth', clothName: 'Tablecloth / Runner', clothIcon: '🍽️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 120, expressPrice: 170, turnaroundHours: 48, isActive: true },
  { id: 'pr-tablecloth-si', clothTypeId: 'cloth-tablecloth', clothName: 'Tablecloth / Runner', clothIcon: '🍽️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-steam-iron', serviceName: 'Steam Pressing Only', price: 35, expressPrice: 50, turnaroundHours: 18, isActive: true },
  { id: 'pr-tablecloth-ex', clothTypeId: 'cloth-tablecloth', clothName: 'Tablecloth / Runner', clothIcon: '🍽️', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 70, expressPrice: 100, turnaroundHours: 12, isActive: true },

  // Door Mat / Small Rug
  { id: 'pr-doormat-wf', clothTypeId: 'cloth-doormat', clothName: 'Door Mat / Small Rug', clothIcon: '🚪', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 60, expressPrice: 90, turnaroundHours: 24, isActive: true },
  { id: 'pr-doormat-dc', clothTypeId: 'cloth-doormat', clothName: 'Door Mat / Small Rug', clothIcon: '🚪', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 80, expressPrice: 120, turnaroundHours: 48, isActive: true },
  { id: 'pr-doormat-spa', clothTypeId: 'cloth-doormat', clothName: 'Door Mat / Small Rug', clothIcon: '🚪', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-spa', serviceName: 'Deep Shoe & Leather Spa', price: 90, expressPrice: 130, turnaroundHours: 48, isActive: true },
  { id: 'pr-doormat-ex', clothTypeId: 'cloth-doormat', clothName: 'Door Mat / Small Rug', clothIcon: '🚪', categoryTag: 'HOME_TEXTILES', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 60, expressPrice: 90, turnaroundHours: 18, isActive: true },

  // ── 5. FOOTWEAR ──
  // Sneakers / Sports Shoes
  { id: 'pr-shoes-sneaker-spa', clothTypeId: 'cloth-shoes-sneaker', clothName: 'Sneakers / Sports Shoes', clothIcon: '👟', categoryTag: 'FOOTWEAR', serviceId: 'srv-m-spa', serviceName: 'Deep Shoe & Leather Spa', price: 250, expressPrice: 350, turnaroundHours: 48, isActive: true },
  { id: 'pr-shoes-sneaker-dc', clothTypeId: 'cloth-shoes-sneaker', clothName: 'Sneakers / Sports Shoes', clothIcon: '👟', categoryTag: 'FOOTWEAR', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 220, expressPrice: 320, turnaroundHours: 48, isActive: true },
  { id: 'pr-shoes-sneaker-ex', clothTypeId: 'cloth-shoes-sneaker', clothName: 'Sneakers / Sports Shoes', clothIcon: '👟', categoryTag: 'FOOTWEAR', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 190, expressPrice: 280, turnaroundHours: 18, isActive: true },

  // Formal Leather Shoes
  { id: 'pr-shoes-formal-spa', clothTypeId: 'cloth-shoes-formal', clothName: 'Formal Leather Shoes', clothIcon: '👞', categoryTag: 'FOOTWEAR', serviceId: 'srv-m-spa', serviceName: 'Deep Shoe & Leather Spa', price: 290, expressPrice: 400, turnaroundHours: 48, isActive: true },
  { id: 'pr-shoes-formal-dc', clothTypeId: 'cloth-shoes-formal', clothName: 'Formal Leather Shoes', clothIcon: '👞', categoryTag: 'FOOTWEAR', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 250, expressPrice: 350, turnaroundHours: 48, isActive: true },
  { id: 'pr-shoes-formal-ex', clothTypeId: 'cloth-shoes-formal', clothName: 'Formal Leather Shoes', clothIcon: '👞', categoryTag: 'FOOTWEAR', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 220, expressPrice: 310, turnaroundHours: 18, isActive: true },

  // Suede / Nubuck Shoes
  { id: 'pr-shoes-suede-spa', clothTypeId: 'cloth-shoes-suede', clothName: 'Suede / Nubuck Shoes', clothIcon: '👞', categoryTag: 'FOOTWEAR', serviceId: 'srv-m-spa', serviceName: 'Deep Shoe & Leather Spa', price: 350, expressPrice: 490, turnaroundHours: 48, isActive: true },
  { id: 'pr-shoes-suede-dc', clothTypeId: 'cloth-shoes-suede', clothName: 'Suede / Nubuck Shoes', clothIcon: '👞', categoryTag: 'FOOTWEAR', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 300, expressPrice: 420, turnaroundHours: 48, isActive: true },
  { id: 'pr-shoes-suede-ex', clothTypeId: 'cloth-shoes-suede', clothName: 'Suede / Nubuck Shoes', clothIcon: '👞', categoryTag: 'FOOTWEAR', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 260, expressPrice: 370, turnaroundHours: 18, isActive: true },

  // ── 6. BAGS, TRAVEL LUGGAGE & ACCESSORIES ──
  // Backpack / School Bag
  { id: 'pr-bag-backpack-spa', clothTypeId: 'cloth-bag-backpack', clothName: 'Backpack / School Bag', clothIcon: '🎒', categoryTag: 'ACCESSORIES', serviceId: 'srv-m-spa', serviceName: 'Deep Shoe & Leather Spa', price: 180, expressPrice: 260, turnaroundHours: 48, isActive: true },
  { id: 'pr-bag-backpack-dc', clothTypeId: 'cloth-bag-backpack', clothName: 'Backpack / School Bag', clothIcon: '🎒', categoryTag: 'ACCESSORIES', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 150, expressPrice: 220, turnaroundHours: 48, isActive: true },
  { id: 'pr-bag-backpack-wf', clothTypeId: 'cloth-bag-backpack', clothName: 'Backpack / School Bag', clothIcon: '🎒', categoryTag: 'ACCESSORIES', serviceId: 'srv-m-wash-fold', serviceName: 'Wash & Fold', price: 120, expressPrice: 180, turnaroundHours: 24, isActive: true },
  { id: 'pr-bag-backpack-ex', clothTypeId: 'cloth-bag-backpack', clothName: 'Backpack / School Bag', clothIcon: '🎒', categoryTag: 'ACCESSORIES', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 140, expressPrice: 200, turnaroundHours: 18, isActive: true },

  // Luxury Handbag
  { id: 'pr-bag-luxury-spa', clothTypeId: 'cloth-bag-luxury', clothName: 'Luxury Handbag', clothIcon: '👜', categoryTag: 'ACCESSORIES', serviceId: 'srv-m-spa', serviceName: 'Deep Shoe & Leather Spa', price: 490, expressPrice: 690, turnaroundHours: 48, isActive: true },
  { id: 'pr-bag-luxury-dc', clothTypeId: 'cloth-bag-luxury', clothName: 'Luxury Handbag', clothIcon: '👜', categoryTag: 'ACCESSORIES', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 420, expressPrice: 600, turnaroundHours: 48, isActive: true },
  { id: 'pr-bag-luxury-ex', clothTypeId: 'cloth-bag-luxury', clothName: 'Luxury Handbag', clothIcon: '👜', categoryTag: 'ACCESSORIES', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 380, expressPrice: 520, turnaroundHours: 18, isActive: true },

  // Cabin Trolley Bag (20")
  { id: 'pr-trolley-cabin-spa', clothTypeId: 'cloth-trolley-cabin', clothName: 'Cabin Trolley Bag (20")', clothIcon: '🧳', categoryTag: 'ACCESSORIES', serviceId: 'srv-m-spa', serviceName: 'Deep Shoe & Leather Spa', price: 250, expressPrice: 350, turnaroundHours: 48, isActive: true },
  { id: 'pr-trolley-cabin-dc', clothTypeId: 'cloth-trolley-cabin', clothName: 'Cabin Trolley Bag (20")', clothIcon: '🧳', categoryTag: 'ACCESSORIES', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 220, expressPrice: 320, turnaroundHours: 48, isActive: true },
  { id: 'pr-trolley-cabin-ex', clothTypeId: 'cloth-trolley-cabin', clothName: 'Cabin Trolley Bag (20")', clothIcon: '🧳', categoryTag: 'ACCESSORIES', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 220, expressPrice: 320, turnaroundHours: 18, isActive: true },

  // Check-in Suitcase (28")
  { id: 'pr-trolley-large-spa', clothTypeId: 'cloth-trolley-large', clothName: 'Check-in Suitcase (28")', clothIcon: '🧳', categoryTag: 'ACCESSORIES', serviceId: 'srv-m-spa', serviceName: 'Deep Shoe & Leather Spa', price: 390, expressPrice: 550, turnaroundHours: 48, isActive: true },
  { id: 'pr-trolley-large-dc', clothTypeId: 'cloth-trolley-large', clothName: 'Check-in Suitcase (28")', clothIcon: '🧳', categoryTag: 'ACCESSORIES', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 350, expressPrice: 500, turnaroundHours: 48, isActive: true },
  { id: 'pr-trolley-large-ex', clothTypeId: 'cloth-trolley-large', clothName: 'Check-in Suitcase (28")', clothIcon: '🧳', categoryTag: 'ACCESSORIES', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 340, expressPrice: 480, turnaroundHours: 18, isActive: true },

  // Bike Riding Helmet
  { id: 'pr-helmet-spa', clothTypeId: 'cloth-helmet', clothName: 'Bike Riding Helmet', clothIcon: '🪖', categoryTag: 'ACCESSORIES', serviceId: 'srv-m-spa', serviceName: 'Deep Shoe & Leather Spa', price: 180, expressPrice: 260, turnaroundHours: 48, isActive: true },
  { id: 'pr-helmet-dc', clothTypeId: 'cloth-helmet', clothName: 'Bike Riding Helmet', clothIcon: '🪖', categoryTag: 'ACCESSORIES', serviceId: 'srv-m-dry-clean', serviceName: 'Dry Cleaning', price: 160, expressPrice: 240, turnaroundHours: 48, isActive: true },
  { id: 'pr-helmet-ex', clothTypeId: 'cloth-helmet', clothName: 'Bike Riding Helmet', clothIcon: '🪖', categoryTag: 'ACCESSORIES', serviceId: 'srv-m-express', serviceName: 'Express Emergency Laundry', price: 150, expressPrice: 220, turnaroundHours: 18, isActive: true },
];

export const INITIAL_PRICING_SETTINGS: PricingSettings = {
  taxPercentage: 5,
  minOrderValue: 299,
  freeDeliveryThreshold: 499,
  standardDeliveryFee: 30,
  expressDeliveryFee: 80,
  extraKgPrice: 40,
};

export const INITIAL_SERVICES: Service[] = [
  { id: 'srv-1', categoryId: 'cat-1', name: 'Wash & Fold (Standard)', slug: 'wash-and-fold', description: 'Everyday clothes washed, tumble dried, and neatly folded.', pricingModel: 'PER_KG', basePrice: 60, unit: 'KG', minOrderQuantity: 3, turnaroundHours: 24, popular: true, expressAvailable: true },
  { id: 'srv-2', categoryId: 'cat-1', name: 'Wash & Steam Iron', slug: 'wash-and-iron', description: 'Hygiene wash + crisp steam press with hanger packaging.', pricingModel: 'PER_KG', basePrice: 85, unit: 'KG', minOrderQuantity: 3, turnaroundHours: 36, popular: true, expressAvailable: true },
  { id: 'srv-6', categoryId: 'cat-2', name: 'Steam Ironing — Shirt / Pant', slug: 'steam-iron-regular', description: 'Industrial steam press for wrinkle-free finish.', pricingModel: 'PER_ITEM', basePrice: 15, unit: 'Item', turnaroundHours: 18, popular: true },
  { id: 'srv-10', categoryId: 'cat-3', name: 'Dry Clean — Formal Shirt / Top', slug: 'dry-clean-shirt', description: 'Collar stain scrub, hydrocarbon solvent clean.', pricingModel: 'PER_ITEM', basePrice: 80, unit: 'Item', turnaroundHours: 48, popular: true },
  { id: 'srv-11', categoryId: 'cat-3', name: 'Dry Clean — 2-Piece Suit / Blazer', slug: 'dry-clean-suit', description: 'Multi-stage gentle dry clean with breathable cover.', pricingModel: 'PER_ITEM', basePrice: 280, unit: 'Item', turnaroundHours: 48, popular: true },
  { id: 'srv-14', categoryId: 'cat-4', name: 'Bridal Lehenga / Heavy Gown', slug: 'bridal-lehenga-cleaning', description: 'Delicate stone hand-shielding dry clean with tissue wrap box.', pricingModel: 'PER_ITEM', basePrice: 650, unit: 'Set', turnaroundHours: 72, popular: true },
];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_COUPONS: Coupon[] = [
  { id: 'cp-1', code: 'WELCOME100', title: 'Flat ₹100 Off First Order', description: 'Flat ₹100 discount above ₹299', discountType: 'FLAT', discountValue: 100, minOrderValue: 299, firstOrderOnly: true, expiryDate: '2026-12-31', usageCount: 1420, isActive: true },
  { id: 'cp-2', code: 'WEEKEND20', title: '20% Weekend Savings', description: 'Save 20% up to ₹150', discountType: 'PERCENTAGE', discountValue: 20, minOrderValue: 350, maxDiscountCap: 150, firstOrderOnly: false, expiryDate: '2026-12-31', usageCount: 654, isActive: true }
];

export const INITIAL_PINCODES: PincodeZone[] = [
  // --- HYDERABAD & SECUNDERABAD (50 Key Localities & Tech Hubs) ---
  { pincode: '500081', areaName: 'Hitec City / Madhapur / Cyber Towers', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500032', areaName: 'Gachibowli / Financial District / Nanakramguda', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500084', areaName: 'Kondapur / Kothaguda / Botanical Garden', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500072', areaName: 'Kukatpally / KPHB Colony (Phase 1-6)', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500085', areaName: 'KPHB Phase 7-9 / JNTU Road', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500033', areaName: 'Jubilee Hills / Film Nagar / Road No 36', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500034', areaName: 'Banjara Hills (Road 1-14) / Panjagutta', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500089', areaName: 'Manikonda / Puppalguda / Alkapur Township', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500075', areaName: 'Gandipet / Kokapet / Narsingi', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500049', areaName: 'Miyapur / Chandanagar / Gangaram', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500050', areaName: 'BHEL / Lingampally / Tara Nagar', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500090', areaName: 'Nizampet / Pragathi Nagar', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500018', areaName: 'Ameerpet / SR Nagar / Sanathnagar', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500082', areaName: 'Somajiguda / Raj Bhavan Road / Erramanzil', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500016', areaName: 'Begumpet / Prakash Nagar / Mayur Marg', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500003', areaName: 'Secunderabad / MG Road / Paradise', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500026', areaName: 'Marredpally (East & West) / Shenoy Nagar', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500009', areaName: 'Bowenpally / Hasmathpet / Manovikas Nagar', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500015', areaName: 'Karkhana / Trimulgherry / Gunrock', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500011', areaName: 'Alwal / Lothkunta / Old Alwal', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500062', areaName: 'ECIL / AS Rao Nagar / Dr AS Rao Nagar', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500047', areaName: 'Sainikpuri / Vayupuri / Yapral', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500040', areaName: 'Malkajgiri / Safilguda / Anandbagh', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500056', areaName: 'Dammaiguda / Nagaram / Keesara', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500014', areaName: 'Kompally / Jeedimetla Village / Petbasheerabad', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500055', areaName: 'Chintal / Quthbullapur / Suchitra', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500037', areaName: 'Balanagar / Moosapet / Fathenagar', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500008', areaName: 'Mehdipatnam / Tolichowki / Shaikpet', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500028', areaName: 'Masab Tank / AC Guards / Khairatabad', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500004', areaName: 'Nampally / Red Hills / Bazar Ghat', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500001', areaName: 'Abids / Koti / Gunfoundry / Sultan Bazaar', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500029', areaName: 'Himayatnagar / Liberty / Narayanguda', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500020', areaName: 'Domalguda / Ashok Nagar / Chikkadpally', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500044', areaName: 'Vidyanagar / Nallakunta / DD Colony', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500007', areaName: 'Tarnaka / Habsiguda / Osmania University', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500017', areaName: 'Moula Ali / Lalaguda / Industrial Area', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500039', areaName: 'Uppal / Ramanthapur / Survey of India', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500076', areaName: 'Boduppal / Peerzadiguda / Medipally', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500068', areaName: 'Nagole / Alkapuri / Snehapuri Colony', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500074', areaName: 'LB Nagar / Mansoorabad / Rock Town', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500070', areaName: 'Vanasthalipuram / Hayathnagar / Auto Nagar', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500035', areaName: 'Kothapet / Saroornagar / Gaddiannaram', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500036', areaName: 'Dilsukhnagar / Chaitanyapuri / P&T Colony', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500059', areaName: 'Saidabad / Champapet / Santoshnagar', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500053', areaName: 'Chandrayangutta / Bandlaguda / Falaknuma', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500077', areaName: 'Attapur / Hyderguda / Upparpally', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500030', areaName: 'Rajendranagar / Budvel / Shivrampally', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500052', areaName: 'Shamshabad / RGIA Airport Zone', city: 'Hyderabad', isServiceable: true, standardFee: 50, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500088', areaName: 'Pocharam / Ghatkesar / Infosys SEZ', city: 'Hyderabad', isServiceable: true, standardFee: 50, minFreeOrderValue: 499, expressAvailable: true, averageTurnaroundHours: 24 },
  { pincode: '500043', areaName: 'Bandlaguda Jagir / Sun City / Peerancheru', city: 'Hyderabad', isServiceable: true, standardFee: 40, minFreeOrderValue: 399, expressAvailable: true, averageTurnaroundHours: 24 },
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

class BackendDatabase {
  private orders: Order[] = [...INITIAL_ORDERS];
  private services: Service[] = [...INITIAL_SERVICES];
  private categories: ServiceCategory[] = [...INITIAL_CATEGORIES];
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
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
      }

      // Sync Cloth Types - ensure full 54-garment master catalog
      const [ctRows]: any = await pool.query('SELECT * FROM cloth_types ORDER BY sort_order ASC').catch(() => [[]]);
      if (ctRows && ctRows.length >= 50) {
        this.clothTypes = ctRows.map((r: any) => ({
          id: r.id,
          name: r.name,
          icon: r.icon,
          categoryTag: r.category_tag,
          categoryLabel: r.category_label,
          description: r.description,
          isActive: Boolean(r.is_active),
          sortOrder: r.sort_order,
          imageUrl: r.image_url || undefined,
        }));
      } else {
        this.clothTypes = [...INITIAL_CLOTH_TYPES];
        for (const item of this.clothTypes) {
          await pool.query(
            'INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, is_active, sort_order, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), icon=VALUES(icon), category_tag=VALUES(category_tag), category_label=VALUES(category_label), description=VALUES(description), is_active=VALUES(is_active), sort_order=VALUES(sort_order), image_url=VALUES(image_url)',
            [item.id, item.name, item.icon, item.categoryTag, item.categoryLabel, item.description, item.isActive ? 1 : 0, item.sortOrder, item.imageUrl || null]
          ).catch(() => {});
        }
      }

      // Sync Service Masters
      const [smRows]: any = await pool.query('SELECT * FROM service_masters').catch(() => [[]]);
      if (smRows && smRows.length >= 6) {
        this.serviceMasters = smRows.map((r: any) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          icon: r.icon,
          pricingType: r.pricing_type,
          baseKgPrice: r.base_kg_price ? Number(r.base_kg_price) : undefined,
          minOrderKg: r.min_order_kg ? Number(r.min_order_kg) : undefined,
          turnaroundHours: r.turnaround_hours,
          description: r.description,
          isActive: Boolean(r.is_active),
          imageUrl: r.image_url || undefined,
        }));
      } else {
        this.serviceMasters = [...INITIAL_SERVICE_MASTERS];
        for (const sm of this.serviceMasters) {
          await pool.query(
            'INSERT INTO service_masters (id, name, slug, icon, pricing_type, base_kg_price, min_order_kg, turnaround_hours, description, is_active, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), slug=VALUES(slug), icon=VALUES(icon), pricing_type=VALUES(pricing_type), base_kg_price=VALUES(base_kg_price), min_order_kg=VALUES(min_order_kg), turnaround_hours=VALUES(turnaround_hours), description=VALUES(description), is_active=VALUES(is_active)',
            [sm.id, sm.name, sm.slug, sm.icon, sm.pricingType, sm.baseKgPrice || null, sm.minOrderKg || null, sm.turnaroundHours, sm.description, sm.isActive ? 1 : 0, sm.imageUrl || null]
          ).catch(() => {});
        }
      }

      // Sync Price Matrix
      const [pmRows]: any = await pool.query('SELECT * FROM service_price_matrix').catch(() => [[]]);
      const hasStaleTestPrices = Array.isArray(pmRows) && pmRows.some((r: any) => r.cloth_type_id === 'cloth-shirt' && r.service_id === 'srv-m-dry-clean' && Number(r.price) < 50);
      if (pmRows && pmRows.length >= 150 && !hasStaleTestPrices) {
        this.priceMatrix = pmRows.map((r: any) => ({
          id: r.id,
          clothTypeId: r.cloth_type_id,
          clothName: r.cloth_name,
          clothIcon: r.cloth_icon,
          categoryTag: r.category_tag,
          serviceId: r.service_id,
          serviceName: r.service_name,
          price: Number(r.price),
          expressPrice: r.express_price ? Number(r.express_price) : undefined,
          turnaroundHours: r.turnaround_hours,
          isActive: Boolean(r.is_active),
        }));
      } else {
        this.priceMatrix = [...INITIAL_SERVICE_PRICE_MATRIX];
        for (const p of this.priceMatrix) {
          await pool.query(
            'INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE cloth_name=VALUES(cloth_name), cloth_icon=VALUES(cloth_icon), category_tag=VALUES(category_tag), price=VALUES(price), express_price=VALUES(express_price), turnaround_hours=VALUES(turnaround_hours), is_active=VALUES(is_active)',
            [p.id, p.clothTypeId, p.clothName, p.clothIcon, p.categoryTag, p.serviceId, p.serviceName, p.price, p.expressPrice || null, p.turnaroundHours, p.isActive ? 1 : 0]
          ).catch(() => {});
        }
      }

      // Sync Pricing Settings
      const [psRows]: any = await pool.query('SELECT * FROM pricing_settings WHERE id = 1').catch(() => [[]]);
      if (psRows && psRows.length > 0) {
        const s = psRows[0];
        this.pricingSettings = {
          taxPercentage: Number(s.tax_percentage),
          minOrderValue: Number(s.min_order_value),
          freeDeliveryThreshold: Number(s.free_delivery_threshold),
          standardDeliveryFee: Number(s.standard_delivery_fee),
          expressDeliveryFee: Number(s.express_delivery_fee),
          extraKgPrice: Number(s.extra_kg_price),
        };
      }

      // Sync Services
      const [srvRows]: any = await pool.query('SELECT * FROM services').catch(() => [[]]);
      if (srvRows && srvRows.length > 0) {
        this.services = srvRows.map((r: any) => ({
          id: r.id,
          categoryId: r.category_id,
          name: r.name,
          slug: r.slug,
          description: r.description,
          pricingModel: r.pricing_model,
          basePrice: r.id === 'srv-1' && Number(r.base_price) < 10 ? 60 : Number(r.base_price),
          unit: r.unit,
          minOrderQuantity: r.min_order_quantity ? Number(r.min_order_quantity) : undefined,
          turnaroundHours: r.turnaround_hours,
          popular: Boolean(r.popular),
          expressAvailable: Boolean(r.express_available),
          image: r.image_url || undefined,
          imageUrl: r.image_url || undefined,
        }));
        pool.query("UPDATE services SET base_price = 60 WHERE id = 'srv-1' AND base_price < 10").catch(() => {});
      }

      // Sync Categories
      const [catRows]: any = await pool.query('SELECT * FROM categories');
      if (catRows.length > 0) {
        this.categories = catRows.map((r: any) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          icon: r.icon,
          description: r.description,
          isPopular: Boolean(r.is_popular),
          image: r.image_url || undefined,
          imageUrl: r.image_url || undefined,
        }));
      }

      // Sync Coupons
      const [cpnRows]: any = await pool.query('SELECT * FROM coupons');
      if (cpnRows.length > 0) {
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
    } catch (err) {
      console.error('Error syncing data from MySQL:', err);
    }
  }

  getOrders(): Order[] { return this.orders; }
  getOrderById(id: string): Order | undefined { return this.orders.find((o) => o.id.toUpperCase() === id.toUpperCase()); }

  createOrder(data: any): Order {
    const nextNum = 10246 + this.orders.length;
    const id = `LAU${nextNum}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
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
    this.orders.unshift(order);

    if (isDbConnected && pool) {
      pool.query(
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
      ).catch((err) => console.error('Error inserting order to MySQL:', err));
    }

    return order;
  }

  updateOrderStatus(id: string, status: OrderStatus, notes?: string, updatedBy?: string): Order | null {
    const order = this.getOrderById(id);
    if (!order) return null;
    order.currentStatus = status;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
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
    order.taxAmount = +(taxable * (this.pricingSettings.taxPercentage / 100)).toFixed(2);
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
    order.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

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
    order.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

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
    order.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (isDbConnected && pool) {
      pool
        .query('UPDATE orders SET payment_status = ?, updated_at = ? WHERE id = ?', [order.paymentStatus, order.updatedAt, order.id])
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
    const id = `cloth-${Date.now()}`;
    const newCloth: ClothType = {
      id,
      name: data.name || 'New Garment',
      icon: data.icon || '👕',
      categoryTag: data.categoryTag || 'MENS',
      categoryLabel: data.categoryLabel || "Men's Clothing",
      description: data.description || '',
      isActive: data.isActive !== undefined ? data.isActive : true,
      sortOrder: this.clothTypes.length + 1,
    };
    this.clothTypes.push(newCloth);

    if (isDbConnected && pool) {
      pool.query(
        'INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, is_active, sort_order, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newCloth.id, newCloth.name, newCloth.icon, newCloth.categoryTag, newCloth.categoryLabel, newCloth.description, newCloth.isActive ? 1 : 0, newCloth.sortOrder, newCloth.imageUrl || null]
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
        'UPDATE cloth_types SET name = ?, icon = ?, category_tag = ?, category_label = ?, description = ?, is_active = ?, image_url = ? WHERE id = ?',
        [item.name, item.icon, item.categoryTag, item.categoryLabel, item.description, item.isActive ? 1 : 0, item.imageUrl || null, item.id]
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
    const id = `srv-m-${Date.now()}`;
    const service: ServiceMaster = {
      id,
      name: data.name || 'New Service',
      slug: (data.name || 'service').toLowerCase().replace(/\s+/g, '-'),
      icon: data.icon || '✨',
      pricingType: data.pricingType || 'PER_ITEM',
      baseKgPrice: data.baseKgPrice,
      minOrderKg: data.minOrderKg,
      turnaroundHours: data.turnaroundHours || 24,
      description: data.description || '',
      isActive: true,
    };
    this.serviceMasters.push(service);

    if (isDbConnected && pool) {
      pool.query(
        'INSERT INTO service_masters (id, name, slug, icon, pricing_type, base_kg_price, min_order_kg, turnaround_hours, description, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [service.id, service.name, service.slug, service.icon, service.pricingType, service.baseKgPrice || null, service.minOrderKg || null, service.turnaroundHours, service.description, 1]
      ).catch((err) => console.error('Error creating service master in MySQL:', err));
    }

    return service;
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

  // Settings
  getPricingSettings(): PricingSettings {
    return this.pricingSettings;
  }

  updatePricingSettings(settings: Partial<PricingSettings>): PricingSettings {
    Object.assign(this.pricingSettings, settings);

    if (isDbConnected && pool) {
      const s = this.pricingSettings;
      pool.query(
        'UPDATE pricing_settings SET tax_percentage = ?, min_order_value = ?, free_delivery_threshold = ?, standard_delivery_fee = ?, express_delivery_fee = ?, extra_kg_price = ? WHERE id = 1',
        [s.taxPercentage, s.minOrderValue, s.freeDeliveryThreshold, s.standardDeliveryFee, s.expressDeliveryFee, s.extraKgPrice]
      ).catch((err) => console.error('Error updating pricing settings in MySQL:', err));
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
    return {
      categories: this.categories,
      clothTypes: this.clothTypes,
      serviceMasters: this.serviceMasters,
      priceMatrix: this.priceMatrix,
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

  getCategories(): ServiceCategory[] { return this.categories; }

  addCategory(category: ServiceCategory): ServiceCategory {
    this.categories.push(category);
    if (isDbConnected && pool) {
      pool.query(
        'INSERT INTO categories (id, name, slug, icon, description, is_popular, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [category.id, category.name, category.slug, category.icon, category.description, category.isPopular ? 1 : 0, category.image || (category as any).imageUrl || null]
      ).catch((err) => console.error('Error adding category to MySQL:', err));
    }
    return category;
  }

  updateCategory(id: string, updates: Partial<ServiceCategory>): ServiceCategory | null {
    const cat = this.categories.find((c) => c.id === id);
    if (!cat) return null;
    Object.assign(cat, updates);
    if (isDbConnected && pool) {
      pool.query(
        'UPDATE categories SET name = ?, slug = ?, icon = ?, description = ?, is_popular = ?, image_url = ? WHERE id = ?',
        [cat.name, cat.slug, cat.icon, cat.description, cat.isPopular ? 1 : 0, cat.image || (cat as any).imageUrl || null, cat.id]
      ).catch((err) => console.error('Error updating category in MySQL:', err));
    }
    return cat;
  }

  deleteCategory(id: string): boolean {
    const idx = this.categories.findIndex((c) => c.id === id);
    if (idx < 0) return false;
    this.categories.splice(idx, 1);
    if (isDbConnected && pool) {
      pool.query('DELETE FROM categories WHERE id = ?', [id]).catch((err) => console.error('Error deleting category from MySQL:', err));
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

  // --- BANNERS SYSTEM ---
  banners: Banner[] = [
    {
      id: 'banner-1',
      title: '50% Flat Discount on First Order',
      subtitle: 'Pure Ozone Sanitization & Doorstep Pickup across Hyderabad',
      badgeText: 'FIRST ORDER SPECIAL',
      couponCode: 'FIRST50',
      discountPercent: 50,
      imageUrl: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=1200&q=80',
      actionType: 'BOOK',
      actionTarget: '',
      displayOrder: 1,
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
      imageUrl: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1200&q=80',
      actionType: 'CATEGORY',
      actionTarget: 'bridal-wear',
      displayOrder: 2,
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
      imageUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=1200&q=80',
      actionType: 'CATEGORY',
      actionTarget: 'bulk-laundry',
      displayOrder: 3,
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
      imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
      actionType: 'BOOK',
      actionTarget: '',
      displayOrder: 4,
      isActive: true,
      createdAt: '2026-01-01 10:00',
      updatedAt: '2026-01-01 10:00',
    },
  ];

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
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=1200&q=80',
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
    return this.banners[idx];
  }

  deleteBanner(id: string): boolean {
    const idx = this.banners.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    this.banners.splice(idx, 1);
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
    return customer.wishlist;
  }
}

export const db = new BackendDatabase();

