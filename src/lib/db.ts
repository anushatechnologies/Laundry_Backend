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
    imageUrl: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/categories/mens-wear.jpg',
  },
  {
    id: 'cat-2',
    name: "Women's Wear",
    slug: 'womens-wear',
    icon: '👗',
    description: 'Sarees, Kurtis, Salwar Suits, Dresses, Gowns, Dupattas & Tops.',
    isPopular: true,
    color: 'pink',
    imageUrl: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/categories/womens-wear.jpg',
  },
  {
    id: 'cat-3',
    name: 'Premium & Bridal Wear',
    slug: 'bridal-wear',
    icon: '💍',
    description: 'Bridal Lehengas, Heavy Sarees, Gowns, Sherwanis & Designer Wear.',
    isPopular: true,
    color: 'purple',
    imageUrl: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/categories/wedding-silk.jpg',
  },
  {
    id: 'cat-4',
    name: 'Kids Wear',
    slug: 'kids-wear',
    icon: '👶',
    description: 'Shirts, Frocks, Uniforms, Baby Rompers & Baby Blankets.',
    isPopular: false,
    color: 'amber',
    imageUrl: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/categories/kids-baby.jpg',
  },
  {
    id: 'cat-5',
    name: 'Home Textiles',
    slug: 'home-textiles',
    icon: '🛏️',
    description: 'Bedsheets, Blankets, Comforters, Curtains, Towels & Cushion Covers.',
    isPopular: true,
    color: 'teal',
    imageUrl: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/categories/home-textiles.jpg',
  },
  {
    id: 'cat-6',
    name: 'Special Deep Cleaning',
    slug: 'special-cleaning',
    icon: '🧹',
    description: 'Mattress, Carpet, Rug, Curtain & Sofa Cover Deep Treatment.',
    isPopular: false,
    color: 'indigo',
    imageUrl: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/categories/winter-wear.jpg',
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
  {
    "id": "cloth-shirt",
    "name": "Shirt",
    "icon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "categoryLabel": "Men's Clothing",
    "subCategory": "Shirts",
    "description": "Formal, casual & linen shirts, crisp hanger finish.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-shirt.jpg",
    "isActive": true,
    "sortOrder": 1
  },
  {
    "id": "cloth-tshirt",
    "name": "T-Shirt / Polo",
    "icon": "\ud83d\udc55",
    "categoryTag": "MENS",
    "categoryLabel": "Men's Clothing",
    "subCategory": "T-Shirts",
    "description": "Round neck, polo & sports tees, gentle anti-fade care.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-tshirt.jpg",
    "isActive": true,
    "sortOrder": 2
  },
  {
    "id": "cloth-jeans",
    "name": "Jeans / Denim",
    "icon": "\ud83d\udc56",
    "categoryTag": "MENS",
    "categoryLabel": "Men's Clothing",
    "subCategory": "Jeans & Trousers",
    "description": "Heavy denim and cotton jeans, deep color preservation.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-jeans.jpg",
    "isActive": true,
    "sortOrder": 3
  },
  {
    "id": "cloth-blazer",
    "name": "Blazer / Coat",
    "icon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "categoryLabel": "Men's Clothing",
    "subCategory": "Suits & Blazers",
    "description": "Structured corporate blazers, tweed & casual sport coats.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-blazer.jpg",
    "isActive": true,
    "sortOrder": 4
  },
  {
    "id": "cloth-jacket",
    "name": "Jacket",
    "icon": "\ud83e\udde5",
    "categoryTag": "MENS",
    "categoryLabel": "Men's Clothing",
    "subCategory": "Jackets",
    "description": "Bomber, windcheater, leatherette & winter fleece jackets.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-jacket.jpg",
    "isActive": true,
    "sortOrder": 5
  },
  {
    "id": "cloth-trouser",
    "name": "Trouser / Pant",
    "icon": "\ud83d\udc56",
    "categoryTag": "MENS",
    "categoryLabel": "Men's Clothing",
    "subCategory": "Jeans & Trousers",
    "description": "Formal pleated trousers, chinos & cotton khakis.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-trouser.jpg",
    "isActive": true,
    "sortOrder": 6
  },
  {
    "id": "cloth-kurta-m",
    "name": "Kurta",
    "icon": "\ud83d\udc55",
    "categoryTag": "MENS",
    "categoryLabel": "Men's Clothing",
    "subCategory": "Ethnic Wear",
    "description": "Traditional cotton, silk & designer festive kurtas.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-kurta-m.jpg",
    "isActive": true,
    "sortOrder": 7
  },
  {
    "id": "cloth-shorts-m",
    "name": "Shorts / Bermuda",
    "icon": "\ud83e\ude73",
    "categoryTag": "MENS",
    "categoryLabel": "Men's Clothing",
    "subCategory": "Shorts",
    "description": "Cotton bermudas, lounge shorts & gym activewear.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-shorts-m.jpg",
    "isActive": true,
    "sortOrder": 8
  },
  {
    "id": "cloth-suit-2p",
    "name": "Suit (2 Piece)",
    "icon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "categoryLabel": "Men's Clothing",
    "subCategory": "Suits & Blazers",
    "description": "Matching blazer jacket + trouser executive suit set.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-suit-2p.jpg",
    "isActive": true,
    "sortOrder": 9
  },
  {
    "id": "cloth-suit-3p",
    "name": "Suit (3 Piece)",
    "icon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "categoryLabel": "Men's Clothing",
    "subCategory": "Suits & Blazers",
    "description": "Blazer jacket + waistcoat vest + formal trouser tuxedo set.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-suit-3p.jpg",
    "isActive": true,
    "sortOrder": 10
  },
  {
    "id": "cloth-sherwani",
    "name": "Sherwani / Indo-Western",
    "icon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "categoryLabel": "Men's Clothing",
    "subCategory": "Ethnic Wear",
    "description": "Wedding sherwanis, heavy embroidery & royal brocade attire.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-sherwani.jpg",
    "isActive": true,
    "sortOrder": 11
  },
  {
    "id": "cloth-dhoti",
    "name": "Dhoti / Mundu",
    "icon": "\ud83e\udd7b",
    "categoryTag": "MENS",
    "categoryLabel": "Men's Clothing",
    "subCategory": "Ethnic Wear",
    "description": "Traditional zari border cotton and silk dhotis.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-dhoti.jpg",
    "isActive": true,
    "sortOrder": 12
  },
  {
    "id": "cloth-saree-reg",
    "name": "Saree (Daily / Georgette)",
    "icon": "\ud83e\udd7b",
    "categoryTag": "WOMENS",
    "categoryLabel": "Women's Clothing",
    "subCategory": "Sarees",
    "description": "Chiffon, georgette & synthetic daily sarees, soft steam pleating.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-saree-reg.jpg",
    "isActive": true,
    "sortOrder": 1
  },
  {
    "id": "cloth-saree-silk",
    "name": "Silk / Heavy Saree",
    "icon": "\ud83e\udd7b",
    "categoryTag": "WOMENS",
    "categoryLabel": "Women's Clothing",
    "subCategory": "Sarees",
    "description": "Kanjeevaram, Banarasi, pure Mysore silk with zari borders.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-saree-silk.jpg",
    "isActive": true,
    "sortOrder": 2
  },
  {
    "id": "cloth-saree-cotton",
    "name": "Cotton / Handloom Saree",
    "icon": "\ud83e\udd7b",
    "categoryTag": "WOMENS",
    "categoryLabel": "Women's Clothing",
    "subCategory": "Sarees",
    "description": "Chanderi, Tant, Mulmul & Kota doria handloom cotton.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-saree-cotton.jpg",
    "isActive": true,
    "sortOrder": 3
  },
  {
    "id": "cloth-salwar",
    "name": "Salwar Kameez / Suit Set",
    "icon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "categoryLabel": "Women's Clothing",
    "subCategory": "Suits & Kurtis",
    "description": "Kurta, bottom & dupatta complete matching suit ensemble.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-salwar.jpg",
    "isActive": true,
    "sortOrder": 4
  },
  {
    "id": "cloth-w-top",
    "name": "Western Top / Blouse",
    "icon": "\ud83d\udc5a",
    "categoryTag": "WOMENS",
    "categoryLabel": "Women's Clothing",
    "subCategory": "Tops & Shirts",
    "description": "Chiffon, georgette & satin designer tops and formal shirts.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-w-top.jpg",
    "isActive": true,
    "sortOrder": 5
  },
  {
    "id": "cloth-w-jeans",
    "name": "Jeans / Jeggings",
    "icon": "\ud83d\udc56",
    "categoryTag": "WOMENS",
    "categoryLabel": "Women's Clothing",
    "subCategory": "Bottoms",
    "description": "Skinny, flared, boyfriend jeans & stretch jeggings.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-w-jeans.jpg",
    "isActive": true,
    "sortOrder": 6
  },
  {
    "id": "cloth-kurti",
    "name": "Kurti / Tunic",
    "icon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "categoryLabel": "Women's Clothing",
    "subCategory": "Suits & Kurtis",
    "description": "Straight, A-line & Anarkali cotton/crepe daily tunics.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-kurti.jpg",
    "isActive": true,
    "sortOrder": 7
  },
  {
    "id": "cloth-lehenga",
    "name": "Lehenga / Bridal Set",
    "icon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "categoryLabel": "Women's Clothing",
    "subCategory": "Occasion Wear",
    "description": "Heavy zari, mirror-work, bridal flare skirt & choli set.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-lehenga.jpg",
    "isActive": true,
    "sortOrder": 8
  },
  {
    "id": "cloth-gown",
    "name": "Party Wear Gown / Maxi",
    "icon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "categoryLabel": "Women's Clothing",
    "subCategory": "Occasion Wear",
    "description": "Floor length evening gowns, cocktail dresses & pleated maxis.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-gown.jpg",
    "isActive": true,
    "sortOrder": 9
  },
  {
    "id": "cloth-w-jacket",
    "name": "Winter Jacket / Shrug",
    "icon": "\ud83e\udde5",
    "categoryTag": "WOMENS",
    "categoryLabel": "Women's Clothing",
    "subCategory": "Jackets",
    "description": "Puffer jackets, long trench coats, woolen shrugs & capes.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-w-jacket.jpg",
    "isActive": true,
    "sortOrder": 10
  },
  {
    "id": "cloth-kid-uniform-shirt",
    "name": "School Uniform Shirt",
    "icon": "\ud83d\udc66",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "School Uniforms",
    "description": "Crisp collar, starch & crease pressing for daily school wear.",
    "imageUrl": "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 1
  },
  {
    "id": "cloth-kid-uniform-pant",
    "name": "School Uniform Trousers",
    "icon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "School Uniforms",
    "description": "Stain release & sharp pleat steam finish on school pants.",
    "imageUrl": "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 2
  },
  {
    "id": "cloth-kid-uniform-skirt",
    "name": "School Uniform Skirt / Pinafore",
    "icon": "\ud83d\udc57",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "School Uniforms",
    "description": "Permanent knife & box pleat press for girls school pinafore.",
    "imageUrl": "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 3
  },
  {
    "id": "cloth-kid-uniform-blazer",
    "name": "School Uniform Blazer / Coat",
    "icon": "\ud83e\udde5",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "School Uniforms",
    "description": "Gentle dry cleaning & form shaping for winter school blazers.",
    "imageUrl": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 4
  },
  {
    "id": "cloth-kid-uniform-tie-belt",
    "name": "School Tie & Accessories Set",
    "icon": "\ud83d\udc54",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "School Uniforms",
    "description": "Gentle stain removal and delicate finish on ties & fabric belts.",
    "imageUrl": "https://images.unsplash.com/photo-1589756823695-278bc923f962?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 5
  },
  {
    "id": "cloth-kid-shirt",
    "name": "Kids Shirt (Casual / Party)",
    "icon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "Tops & Shirts",
    "description": "Button-down printed and formal party shirts for boys.",
    "imageUrl": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 6
  },
  {
    "id": "cloth-kids-tshirt",
    "name": "Kids T-Shirt / Top",
    "icon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "Tops & Shirts",
    "description": "Graphic, round neck & cartoon print everyday tees.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-kids-tshirt.jpg",
    "isActive": true,
    "sortOrder": 7
  },
  {
    "id": "cloth-kid-polo",
    "name": "Kids Polo Collar T-Shirt",
    "icon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "Tops & Shirts",
    "description": "Sporty collared tees, pique cotton fabric protection.",
    "imageUrl": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 8
  },
  {
    "id": "cloth-kid-hoodie",
    "name": "Kids Hoodie / Sweatshirt",
    "icon": "\ud83e\udde5",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "Winter Wear",
    "description": "Fleece lined pullover hoodies and zip-up sweatshirts.",
    "imageUrl": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 9
  },
  {
    "id": "cloth-kid-sweater",
    "name": "Kids Woolen Sweater / Cardigan",
    "icon": "\ud83e\uddf6",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "Winter Wear",
    "description": "Anti-shrink wool wash & debobbling for knitwear.",
    "imageUrl": "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 10
  },
  {
    "id": "cloth-kid-pant",
    "name": "Kids Denim Jeans",
    "icon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "Bottoms",
    "description": "Durable denim care with gentle enzymatic stain scrub.",
    "imageUrl": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 11
  },
  {
    "id": "cloth-kid-trousers",
    "name": "Kids Cotton Chinos / Trousers",
    "icon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "Bottoms",
    "description": "Comfort cotton trousers and party chinos.",
    "imageUrl": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 12
  },
  {
    "id": "cloth-kids-shorts",
    "name": "Kids Shorts / Half Pant",
    "icon": "\ud83e\ude73",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "Bottoms",
    "description": "Cotton bermudas, denim shorts and playwear half pants.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-kids-shorts.jpg",
    "isActive": true,
    "sortOrder": 13
  },
  {
    "id": "cloth-kid-trackpant",
    "name": "Kids Trackpant / Joggers",
    "icon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "Bottoms",
    "description": "Activewear joggers, sweatpants & elastic waist trackpants.",
    "imageUrl": "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 14
  },
  {
    "id": "cloth-kids-frock",
    "name": "Kids Frock / Party Dress",
    "icon": "\ud83d\udc57",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "Ethnic & Dresses",
    "description": "Princess net frocks, birthday dresses with bows and ruffles.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-kids-frock.jpg",
    "isActive": true,
    "sortOrder": 15
  },
  {
    "id": "cloth-kids-ethnic",
    "name": "Kids Kurta Pyjama / Dhoti",
    "icon": "\ud83e\udd7b",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "Ethnic & Dresses",
    "description": "Festive boys kurta pajama, dhoti sets & cotton ethnic wear.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-kids-ethnic.jpg",
    "isActive": true,
    "sortOrder": 16
  },
  {
    "id": "cloth-kid-lehenga",
    "name": "Kids Ghagra / Lehenga Choli",
    "icon": "\ud83d\udc57",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "Ethnic & Dresses",
    "description": "Festive silk flare lehengas and choli with delicate tassels.",
    "imageUrl": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 17
  },
  {
    "id": "cloth-kid-sherwani",
    "name": "Kids Sherwani / Indo-Western",
    "icon": "\ud83d\udc54",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "Ethnic & Dresses",
    "description": "Boys wedding sherwanis, bandhgala suits with brocade work.",
    "imageUrl": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 18
  },
  {
    "id": "cloth-baby-set",
    "name": "Baby Romper / Onesie Set",
    "icon": "\ud83d\udc76",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "Baby Care",
    "description": "Hypoallergenic, pediatrician-safe organic baby wash.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-baby-set.jpg",
    "isActive": true,
    "sortOrder": 19
  },
  {
    "id": "cloth-kid-nightsuit",
    "name": "Kids Pajama / Sleepwear Set",
    "icon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "categoryLabel": "Kids & Baby",
    "subCategory": "Baby Care",
    "description": "Soft breathable 2-piece cotton nightwear set.",
    "imageUrl": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 20
  },
  {
    "id": "cloth-bedsheet-single",
    "name": "Single Bedsheet (Cotton)",
    "icon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Bed Linen",
    "description": "Pure cotton single bedsheet with anti-bacterial rinse.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-bedsheet-s.jpg",
    "isActive": true,
    "sortOrder": 1
  },
  {
    "id": "cloth-bedsheet-double",
    "name": "Double Bedsheet (Cotton)",
    "icon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Bed Linen",
    "description": "Standard queen/double flat bedsheet, roller steam press.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-bedsheet-d.jpg",
    "isActive": true,
    "sortOrder": 2
  },
  {
    "id": "cloth-bedsheet-king",
    "name": "King Size Designer Bedsheet",
    "icon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Bed Linen",
    "description": "Heavy 400+ TC Egyptian and luxury satin striped king sheets.",
    "imageUrl": "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 3
  },
  {
    "id": "cloth-bedsheet-fitted",
    "name": "Elastic Fitted Bedsheet",
    "icon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Bed Linen",
    "description": "Deep pocket elastic corner sheets, smooth stretch press.",
    "imageUrl": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 4
  },
  {
    "id": "cloth-bedsheet-silk",
    "name": "Silk / Satin Luxury Bedsheet",
    "icon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Bed Linen",
    "description": "Delicate low-temp solvent dry clean for Mulberry silk bed sets.",
    "imageUrl": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 5
  },
  {
    "id": "cloth-pillow",
    "name": "Pillow Covers (Pair)",
    "icon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Bed Linen",
    "description": "Flanged, oxford & zippered pillow slipcovers (2 pieces).",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-pillow.jpg",
    "isActive": true,
    "sortOrder": 6
  },
  {
    "id": "cloth-cushion-cover",
    "name": "Cushion Covers (Set of 2)",
    "icon": "\ud83d\udecb\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Bed Linen",
    "description": "Velvet, jacquard & embroidered living room cushions.",
    "imageUrl": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 7
  },
  {
    "id": "cloth-bolster-cover",
    "name": "Bolster / Diwan Roll Cover (Pair)",
    "icon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Bed Linen",
    "description": "Traditional cylindrical diwan covers with drawstring ends.",
    "imageUrl": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 8
  },
  {
    "id": "cloth-blanket-single",
    "name": "Single Fleece / Light Blanket",
    "icon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Blankets & Quilts",
    "description": "Polar fleece, AC dharwad & light single microplush blankets.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-blanket.jpg",
    "isActive": true,
    "sortOrder": 9
  },
  {
    "id": "cloth-blanket-double",
    "name": "Double Mink Blanket (Heavy)",
    "icon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Blankets & Quilts",
    "description": "Heavy 2-ply Korean mink & embossed thick winter blankets.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-blanket-d.jpg",
    "isActive": true,
    "sortOrder": 10
  },
  {
    "id": "cloth-quilt-single",
    "name": "Single Quilt / Jaipuri Razai",
    "icon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Blankets & Quilts",
    "description": "Fine block print cotton stuffed lightweight Indian razai.",
    "imageUrl": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 11
  },
  {
    "id": "cloth-quilt-double",
    "name": "Double Quilt / Heavy Razai",
    "icon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Blankets & Quilts",
    "description": "Thick cotton carded winter razai, gentle dust mite sanitization.",
    "imageUrl": "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 12
  },
  {
    "id": "cloth-comforter-single",
    "name": "Single Down / Microfiber Comforter",
    "icon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Blankets & Quilts",
    "description": "Fluffy single duvet comforter with baffle box thermal washing.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-comforter.jpg",
    "isActive": true,
    "sortOrder": 13
  },
  {
    "id": "cloth-comforter-double",
    "name": "Double Down / Microfiber Comforter",
    "icon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Blankets & Quilts",
    "description": "Heavy king/queen hypoallergenic luxury microfiber duvet.",
    "imageUrl": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 14
  },
  {
    "id": "cloth-duvet-cover",
    "name": "Duvet / Comforter Outer Cover",
    "icon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Blankets & Quilts",
    "description": "Buttoned or zipped removable cotton duvet protective encasement.",
    "imageUrl": "https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 15
  },
  {
    "id": "cloth-mattress-protector",
    "name": "Mattress Protector (Waterproof)",
    "icon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Blankets & Quilts",
    "description": "Terry cotton waterproof fitted mattress pad deep clean.",
    "imageUrl": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 16
  },
  {
    "id": "cloth-curtain-window",
    "name": "Window Curtain (Up to 5 ft)",
    "icon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Curtains & Drapes",
    "description": "Eyelet or ring-top small cotton/polyester window drapes.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-curtain.jpg",
    "isActive": true,
    "sortOrder": 17
  },
  {
    "id": "cloth-curtain-door",
    "name": "Door Curtain (Up to 7 ft)",
    "icon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Curtains & Drapes",
    "description": "Standard height door drapes with dust extraction & pleat steam.",
    "imageUrl": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 18
  },
  {
    "id": "cloth-curtain-long",
    "name": "Long / Heavy Blackout Curtain (9 ft+)",
    "icon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Curtains & Drapes",
    "description": "Thermal lined velvet, jacquard & blackout drapes per panel.",
    "imageUrl": "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 19
  },
  {
    "id": "cloth-curtain-sheer",
    "name": "Sheer / Net Lace Curtain",
    "icon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Curtains & Drapes",
    "description": "Ultra delicate organza, voile & lace net drape care.",
    "imageUrl": "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 20
  },
  {
    "id": "cloth-bath-towel-large",
    "name": "Bath Towel (Large / Turkish)",
    "icon": "\ud83d\udebf",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Bath Linen",
    "description": "Heavy 600+ GSM plush terry towel, fabric softener sanitize.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-bath-towel.jpg",
    "isActive": true,
    "sortOrder": 21
  },
  {
    "id": "cloth-hand-towel",
    "name": "Hand & Face Towels (Pair)",
    "icon": "\ud83e\uddfc",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Bath Linen",
    "description": "Soft absorbent bathroom hand towels and gym napkins.",
    "imageUrl": "https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 22
  },
  {
    "id": "cloth-bathrobe",
    "name": "Bathrobe (Terrycloth / Waffle)",
    "icon": "\ud83e\udd4b",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Bath Linen",
    "description": "Hotel grade plush wrap bathrobe with belt.",
    "imageUrl": "https://images.unsplash.com/photo-1584208124888-3a20b9c799e2?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 23
  },
  {
    "id": "cloth-bath-mat",
    "name": "Bath Mat / Floor Rug",
    "icon": "\ud83d\udec1",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Bath Linen",
    "description": "Thick memory foam or woven cotton bathroom floor mat.",
    "imageUrl": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 24
  },
  {
    "id": "cloth-sofa-cover-1s",
    "name": "Single Armchair / Sofa Cover",
    "icon": "\ud83d\udecb\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Living & Kitchen",
    "description": "Elastic stretch slipcover for single seater couch or recliner.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-sofa-cover.jpg",
    "isActive": true,
    "sortOrder": 25
  },
  {
    "id": "cloth-sofa-cover-3s",
    "name": "3-Seater Sofa Full Slipcover",
    "icon": "\ud83d\udecb\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Living & Kitchen",
    "description": "Large full coverage fabric slipcover for 3-seater sofa.",
    "imageUrl": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 26
  },
  {
    "id": "cloth-tablecloth-dining",
    "name": "Dining Tablecloth (6-8 Seater)",
    "icon": "\ud83c\udf7d\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Living & Kitchen",
    "description": "Stain release wash & crisp flat roller iron for dining covers.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-tablecloth.jpg",
    "isActive": true,
    "sortOrder": 27
  },
  {
    "id": "cloth-table-runner",
    "name": "Table Runner & Mats Set",
    "icon": "\ud83c\udf7d\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Living & Kitchen",
    "description": "Center table runner with matching 6-piece placemats.",
    "imageUrl": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 28
  },
  {
    "id": "cloth-kitchen-apron",
    "name": "Kitchen Apron & Mittens Set",
    "icon": "\ud83d\udc68\u200d\ud83c\udf73",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Living & Kitchen",
    "description": "Heavy degreasing wash for cooking aprons and padded oven gloves.",
    "imageUrl": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
    "isActive": true,
    "sortOrder": 29
  },
  {
    "id": "cloth-doormat-heavy",
    "name": "Heavy Coir / Rubber Doormat",
    "icon": "\ud83d\udeaa",
    "categoryTag": "HOME_TEXTILES",
    "categoryLabel": "Home Textiles",
    "subCategory": "Living & Kitchen",
    "description": "Deep pressure dirt & mud extraction for entrance mats.",
    "imageUrl": "https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-doormat.jpg",
    "isActive": true,
    "sortOrder": 30
  }
];


export const INITIAL_SERVICE_MASTERS: ServiceMaster[] = [
  { id: 'srv-m-steam-iron', name: 'Iron Only (Steam Press)', slug: 'steam-iron', serviceCode: 'PRESS', icon: '🔥', pricingType: 'PER_ITEM', turnaroundHours: 18, description: 'High-pressure wrinkle removal, crease setting & crisp hanger finish.', isActive: true },
  { id: 'srv-m-wash-fold', name: 'Wash & Fold', slug: 'wash-and-fold', serviceCode: 'WASH_IRON', icon: '🧺', pricingType: 'PER_KG', baseKgPrice: 60, minOrderKg: 3, turnaroundHours: 24, description: 'Hygienic wash, tumble dry, and neat compact fold.', isActive: true },
  { id: 'srv-m-wash-iron', name: 'Wash & Steam Iron', slug: 'wash-and-iron', serviceCode: 'WASH_IRON', icon: '👔', pricingType: 'PER_KG', baseKgPrice: 85, minOrderKg: 3, turnaroundHours: 36, description: 'Eco-wash + industrial steam pressing on hangers.', isActive: true },
  { id: 'srv-m-dry-clean', name: 'Dry Cleaning', slug: 'dry-cleaning', serviceCode: 'DRY_CLEAN', icon: '🧥', pricingType: 'PER_ITEM', turnaroundHours: 48, description: 'Hydrocarbon solvent treatment with breathable garment cover.', isActive: true },
  { id: 'srv-m-charak', name: 'Saree Polishing & Charak', slug: 'saree-charak', serviceCode: 'SAREE_POLISH', icon: '✨', pricingType: 'PER_ITEM', turnaroundHours: 48, description: 'Traditional starching, roll pressing & zari shine revival.', isActive: true },
  { id: 'srv-m-starch', name: 'Starch & Crisp Finish', slug: 'starch-finish', serviceCode: 'STARCH', icon: '👔', pricingType: 'PER_ITEM', turnaroundHours: 24, description: 'Stiff starching for crisp cotton shirts, dhotis & uniforms.', isActive: true },
  { id: 'srv-m-spa', name: 'Deep Shoe & Leather Spa', slug: 'shoe-spa', serviceCode: 'SHOE_SPA', icon: '👞', pricingType: 'PER_ITEM', turnaroundHours: 48, description: 'Ultrasonic stain treatment and antibacterial ozone sanitization.', isActive: true },
  { id: 'srv-m-express', name: 'Express Emergency Laundry', slug: 'express-emergency', serviceCode: 'EXPRESS', icon: '⚡', pricingType: 'PER_KG', baseKgPrice: 120, minOrderKg: 3, turnaroundHours: 12, description: 'Dedicated machine slot with same-day return.', isActive: true },
];

export const INITIAL_SERVICE_PRICE_MATRIX: ServicePriceItem[] = [
  {
    "id": "pr-cloth-shirt-srv-m-steam-iron",
    "clothTypeId": "cloth-shirt",
    "clothName": "Shirt",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 20,
    "expressPrice": 30,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-shirt-srv-m-wash-fold",
    "clothTypeId": "cloth-shirt",
    "clothName": "Shirt",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 35,
    "expressPrice": 53,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-shirt-srv-m-wash-iron",
    "clothTypeId": "cloth-shirt",
    "clothName": "Shirt",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 49,
    "expressPrice": 74,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-shirt-srv-m-dry-clean",
    "clothTypeId": "cloth-shirt",
    "clothName": "Shirt",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 80,
    "expressPrice": 120,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-tshirt-srv-m-steam-iron",
    "clothTypeId": "cloth-tshirt",
    "clothName": "T-Shirt / Polo",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "MENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 15,
    "expressPrice": 23,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-tshirt-srv-m-wash-fold",
    "clothTypeId": "cloth-tshirt",
    "clothName": "T-Shirt / Polo",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 29,
    "expressPrice": 44,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-tshirt-srv-m-wash-iron",
    "clothTypeId": "cloth-tshirt",
    "clothName": "T-Shirt / Polo",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 39,
    "expressPrice": 59,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-tshirt-srv-m-dry-clean",
    "clothTypeId": "cloth-tshirt",
    "clothName": "T-Shirt / Polo",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "MENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 60,
    "expressPrice": 90,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-jeans-srv-m-steam-iron",
    "clothTypeId": "cloth-jeans",
    "clothName": "Jeans / Denim",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "MENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 25,
    "expressPrice": 38,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-jeans-srv-m-wash-fold",
    "clothTypeId": "cloth-jeans",
    "clothName": "Jeans / Denim",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 45,
    "expressPrice": 68,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-jeans-srv-m-wash-iron",
    "clothTypeId": "cloth-jeans",
    "clothName": "Jeans / Denim",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 59,
    "expressPrice": 89,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-jeans-srv-m-dry-clean",
    "clothTypeId": "cloth-jeans",
    "clothName": "Jeans / Denim",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "MENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 90,
    "expressPrice": 135,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-blazer-srv-m-steam-iron",
    "clothTypeId": "cloth-blazer",
    "clothName": "Blazer / Coat",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 60,
    "expressPrice": 90,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-blazer-srv-m-wash-fold",
    "clothTypeId": "cloth-blazer",
    "clothName": "Blazer / Coat",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 90,
    "expressPrice": 135,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-blazer-srv-m-wash-iron",
    "clothTypeId": "cloth-blazer",
    "clothName": "Blazer / Coat",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 120,
    "expressPrice": 180,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-blazer-srv-m-dry-clean",
    "clothTypeId": "cloth-blazer",
    "clothName": "Blazer / Coat",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 180,
    "expressPrice": 270,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-jacket-srv-m-steam-iron",
    "clothTypeId": "cloth-jacket",
    "clothName": "Jacket",
    "clothIcon": "\ud83e\udde5",
    "categoryTag": "MENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 70,
    "expressPrice": 105,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-jacket-srv-m-wash-fold",
    "clothTypeId": "cloth-jacket",
    "clothName": "Jacket",
    "clothIcon": "\ud83e\udde5",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 110,
    "expressPrice": 165,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-jacket-srv-m-wash-iron",
    "clothTypeId": "cloth-jacket",
    "clothName": "Jacket",
    "clothIcon": "\ud83e\udde5",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 140,
    "expressPrice": 210,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-jacket-srv-m-dry-clean",
    "clothTypeId": "cloth-jacket",
    "clothName": "Jacket",
    "clothIcon": "\ud83e\udde5",
    "categoryTag": "MENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 220,
    "expressPrice": 330,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-trouser-srv-m-steam-iron",
    "clothTypeId": "cloth-trouser",
    "clothName": "Trouser / Pant",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "MENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 20,
    "expressPrice": 30,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-trouser-srv-m-wash-fold",
    "clothTypeId": "cloth-trouser",
    "clothName": "Trouser / Pant",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 39,
    "expressPrice": 59,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-trouser-srv-m-wash-iron",
    "clothTypeId": "cloth-trouser",
    "clothName": "Trouser / Pant",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 49,
    "expressPrice": 74,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-trouser-srv-m-dry-clean",
    "clothTypeId": "cloth-trouser",
    "clothName": "Trouser / Pant",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "MENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 75,
    "expressPrice": 113,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kurta-m-srv-m-steam-iron",
    "clothTypeId": "cloth-kurta-m",
    "clothName": "Kurta",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "MENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 30,
    "expressPrice": 45,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kurta-m-srv-m-wash-fold",
    "clothTypeId": "cloth-kurta-m",
    "clothName": "Kurta",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 49,
    "expressPrice": 74,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kurta-m-srv-m-wash-iron",
    "clothTypeId": "cloth-kurta-m",
    "clothName": "Kurta",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 69,
    "expressPrice": 104,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kurta-m-srv-m-dry-clean",
    "clothTypeId": "cloth-kurta-m",
    "clothName": "Kurta",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "MENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 99,
    "expressPrice": 149,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-shorts-m-srv-m-steam-iron",
    "clothTypeId": "cloth-shorts-m",
    "clothName": "Shorts / Bermuda",
    "clothIcon": "\ud83e\ude73",
    "categoryTag": "MENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 18,
    "expressPrice": 27,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-shorts-m-srv-m-wash-fold",
    "clothTypeId": "cloth-shorts-m",
    "clothName": "Shorts / Bermuda",
    "clothIcon": "\ud83e\ude73",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 29,
    "expressPrice": 44,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-shorts-m-srv-m-wash-iron",
    "clothTypeId": "cloth-shorts-m",
    "clothName": "Shorts / Bermuda",
    "clothIcon": "\ud83e\ude73",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 39,
    "expressPrice": 59,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-shorts-m-srv-m-dry-clean",
    "clothTypeId": "cloth-shorts-m",
    "clothName": "Shorts / Bermuda",
    "clothIcon": "\ud83e\ude73",
    "categoryTag": "MENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 59,
    "expressPrice": 89,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-suit-2p-srv-m-steam-iron",
    "clothTypeId": "cloth-suit-2p",
    "clothName": "Suit (2 Piece)",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 90,
    "expressPrice": 135,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-suit-2p-srv-m-wash-fold",
    "clothTypeId": "cloth-suit-2p",
    "clothName": "Suit (2 Piece)",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 140,
    "expressPrice": 210,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-suit-2p-srv-m-wash-iron",
    "clothTypeId": "cloth-suit-2p",
    "clothName": "Suit (2 Piece)",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 180,
    "expressPrice": 270,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-suit-2p-srv-m-dry-clean",
    "clothTypeId": "cloth-suit-2p",
    "clothName": "Suit (2 Piece)",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 280,
    "expressPrice": 420,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-suit-3p-srv-m-steam-iron",
    "clothTypeId": "cloth-suit-3p",
    "clothName": "Suit (3 Piece)",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 120,
    "expressPrice": 180,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-suit-3p-srv-m-wash-fold",
    "clothTypeId": "cloth-suit-3p",
    "clothName": "Suit (3 Piece)",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 180,
    "expressPrice": 270,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-suit-3p-srv-m-wash-iron",
    "clothTypeId": "cloth-suit-3p",
    "clothName": "Suit (3 Piece)",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 240,
    "expressPrice": 360,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-suit-3p-srv-m-dry-clean",
    "clothTypeId": "cloth-suit-3p",
    "clothName": "Suit (3 Piece)",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 350,
    "expressPrice": 525,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-sherwani-srv-m-steam-iron",
    "clothTypeId": "cloth-sherwani",
    "clothName": "Sherwani / Indo-Western",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 150,
    "expressPrice": 225,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-sherwani-srv-m-wash-fold",
    "clothTypeId": "cloth-sherwani",
    "clothName": "Sherwani / Indo-Western",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 220,
    "expressPrice": 330,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-sherwani-srv-m-wash-iron",
    "clothTypeId": "cloth-sherwani",
    "clothName": "Sherwani / Indo-Western",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 290,
    "expressPrice": 435,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-sherwani-srv-m-dry-clean",
    "clothTypeId": "cloth-sherwani",
    "clothName": "Sherwani / Indo-Western",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "MENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 450,
    "expressPrice": 675,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-dhoti-srv-m-steam-iron",
    "clothTypeId": "cloth-dhoti",
    "clothName": "Dhoti / Mundu",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "MENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 25,
    "expressPrice": 38,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-dhoti-srv-m-wash-fold",
    "clothTypeId": "cloth-dhoti",
    "clothName": "Dhoti / Mundu",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 39,
    "expressPrice": 59,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-dhoti-srv-m-wash-iron",
    "clothTypeId": "cloth-dhoti",
    "clothName": "Dhoti / Mundu",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "MENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 55,
    "expressPrice": 83,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-dhoti-srv-m-dry-clean",
    "clothTypeId": "cloth-dhoti",
    "clothName": "Dhoti / Mundu",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "MENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 80,
    "expressPrice": 120,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-saree-reg-srv-m-steam-iron",
    "clothTypeId": "cloth-saree-reg",
    "clothName": "Saree (Daily / Georgette)",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 35,
    "expressPrice": 53,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-saree-reg-srv-m-wash-fold",
    "clothTypeId": "cloth-saree-reg",
    "clothName": "Saree (Daily / Georgette)",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 55,
    "expressPrice": 83,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-saree-reg-srv-m-wash-iron",
    "clothTypeId": "cloth-saree-reg",
    "clothName": "Saree (Daily / Georgette)",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 75,
    "expressPrice": 113,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-saree-reg-srv-m-dry-clean",
    "clothTypeId": "cloth-saree-reg",
    "clothName": "Saree (Daily / Georgette)",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 110,
    "expressPrice": 165,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-saree-silk-srv-m-steam-iron",
    "clothTypeId": "cloth-saree-silk",
    "clothName": "Silk / Heavy Saree",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 60,
    "expressPrice": 90,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-saree-silk-srv-m-wash-fold",
    "clothTypeId": "cloth-saree-silk",
    "clothName": "Silk / Heavy Saree",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 90,
    "expressPrice": 135,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-saree-silk-srv-m-wash-iron",
    "clothTypeId": "cloth-saree-silk",
    "clothName": "Silk / Heavy Saree",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 130,
    "expressPrice": 195,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-saree-silk-srv-m-dry-clean",
    "clothTypeId": "cloth-saree-silk",
    "clothName": "Silk / Heavy Saree",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 210,
    "expressPrice": 315,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-saree-cotton-srv-m-steam-iron",
    "clothTypeId": "cloth-saree-cotton",
    "clothName": "Cotton / Handloom Saree",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 40,
    "expressPrice": 60,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-saree-cotton-srv-m-wash-fold",
    "clothTypeId": "cloth-saree-cotton",
    "clothName": "Cotton / Handloom Saree",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 60,
    "expressPrice": 90,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-saree-cotton-srv-m-wash-iron",
    "clothTypeId": "cloth-saree-cotton",
    "clothName": "Cotton / Handloom Saree",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 85,
    "expressPrice": 128,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-saree-cotton-srv-m-dry-clean",
    "clothTypeId": "cloth-saree-cotton",
    "clothName": "Cotton / Handloom Saree",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 130,
    "expressPrice": 195,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-salwar-srv-m-steam-iron",
    "clothTypeId": "cloth-salwar",
    "clothName": "Salwar Kameez / Suit Set",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 45,
    "expressPrice": 68,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-salwar-srv-m-wash-fold",
    "clothTypeId": "cloth-salwar",
    "clothName": "Salwar Kameez / Suit Set",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 70,
    "expressPrice": 105,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-salwar-srv-m-wash-iron",
    "clothTypeId": "cloth-salwar",
    "clothName": "Salwar Kameez / Suit Set",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 95,
    "expressPrice": 143,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-salwar-srv-m-dry-clean",
    "clothTypeId": "cloth-salwar",
    "clothName": "Salwar Kameez / Suit Set",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 140,
    "expressPrice": 210,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-w-top-srv-m-steam-iron",
    "clothTypeId": "cloth-w-top",
    "clothName": "Western Top / Blouse",
    "clothIcon": "\ud83d\udc5a",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 20,
    "expressPrice": 30,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-w-top-srv-m-wash-fold",
    "clothTypeId": "cloth-w-top",
    "clothName": "Western Top / Blouse",
    "clothIcon": "\ud83d\udc5a",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 35,
    "expressPrice": 53,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-w-top-srv-m-wash-iron",
    "clothTypeId": "cloth-w-top",
    "clothName": "Western Top / Blouse",
    "clothIcon": "\ud83d\udc5a",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 49,
    "expressPrice": 74,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-w-top-srv-m-dry-clean",
    "clothTypeId": "cloth-w-top",
    "clothName": "Western Top / Blouse",
    "clothIcon": "\ud83d\udc5a",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 70,
    "expressPrice": 105,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-w-jeans-srv-m-steam-iron",
    "clothTypeId": "cloth-w-jeans",
    "clothName": "Jeans / Jeggings",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 25,
    "expressPrice": 38,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-w-jeans-srv-m-wash-fold",
    "clothTypeId": "cloth-w-jeans",
    "clothName": "Jeans / Jeggings",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 45,
    "expressPrice": 68,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-w-jeans-srv-m-wash-iron",
    "clothTypeId": "cloth-w-jeans",
    "clothName": "Jeans / Jeggings",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 59,
    "expressPrice": 89,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-w-jeans-srv-m-dry-clean",
    "clothTypeId": "cloth-w-jeans",
    "clothName": "Jeans / Jeggings",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 85,
    "expressPrice": 128,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kurti-srv-m-steam-iron",
    "clothTypeId": "cloth-kurti",
    "clothName": "Kurti / Tunic",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 25,
    "expressPrice": 38,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kurti-srv-m-wash-fold",
    "clothTypeId": "cloth-kurti",
    "clothName": "Kurti / Tunic",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 40,
    "expressPrice": 60,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kurti-srv-m-wash-iron",
    "clothTypeId": "cloth-kurti",
    "clothName": "Kurti / Tunic",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 55,
    "expressPrice": 83,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kurti-srv-m-dry-clean",
    "clothTypeId": "cloth-kurti",
    "clothName": "Kurti / Tunic",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 80,
    "expressPrice": 120,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-lehenga-srv-m-steam-iron",
    "clothTypeId": "cloth-lehenga",
    "clothName": "Lehenga / Bridal Set",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 180,
    "expressPrice": 270,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-lehenga-srv-m-wash-fold",
    "clothTypeId": "cloth-lehenga",
    "clothName": "Lehenga / Bridal Set",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 260,
    "expressPrice": 390,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-lehenga-srv-m-wash-iron",
    "clothTypeId": "cloth-lehenga",
    "clothName": "Lehenga / Bridal Set",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 350,
    "expressPrice": 525,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-lehenga-srv-m-dry-clean",
    "clothTypeId": "cloth-lehenga",
    "clothName": "Lehenga / Bridal Set",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 550,
    "expressPrice": 825,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-gown-srv-m-steam-iron",
    "clothTypeId": "cloth-gown",
    "clothName": "Party Wear Gown / Maxi",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 90,
    "expressPrice": 135,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-gown-srv-m-wash-fold",
    "clothTypeId": "cloth-gown",
    "clothName": "Party Wear Gown / Maxi",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 140,
    "expressPrice": 210,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-gown-srv-m-wash-iron",
    "clothTypeId": "cloth-gown",
    "clothName": "Party Wear Gown / Maxi",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 180,
    "expressPrice": 270,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-gown-srv-m-dry-clean",
    "clothTypeId": "cloth-gown",
    "clothName": "Party Wear Gown / Maxi",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 280,
    "expressPrice": 420,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-w-jacket-srv-m-steam-iron",
    "clothTypeId": "cloth-w-jacket",
    "clothName": "Winter Jacket / Shrug",
    "clothIcon": "\ud83e\udde5",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 70,
    "expressPrice": 105,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-w-jacket-srv-m-wash-fold",
    "clothTypeId": "cloth-w-jacket",
    "clothName": "Winter Jacket / Shrug",
    "clothIcon": "\ud83e\udde5",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 110,
    "expressPrice": 165,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-w-jacket-srv-m-wash-iron",
    "clothTypeId": "cloth-w-jacket",
    "clothName": "Winter Jacket / Shrug",
    "clothIcon": "\ud83e\udde5",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 145,
    "expressPrice": 218,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-w-jacket-srv-m-dry-clean",
    "clothTypeId": "cloth-w-jacket",
    "clothName": "Winter Jacket / Shrug",
    "clothIcon": "\ud83e\udde5",
    "categoryTag": "WOMENS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 220,
    "expressPrice": 330,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-shirt-srv-m-steam-iron",
    "clothTypeId": "cloth-kid-uniform-shirt",
    "clothName": "School Uniform Shirt",
    "clothIcon": "\ud83d\udc66",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 15,
    "expressPrice": 23,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-shirt-srv-m-wash-fold",
    "clothTypeId": "cloth-kid-uniform-shirt",
    "clothName": "School Uniform Shirt",
    "clothIcon": "\ud83d\udc66",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 28,
    "expressPrice": 42,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-shirt-srv-m-wash-iron",
    "clothTypeId": "cloth-kid-uniform-shirt",
    "clothName": "School Uniform Shirt",
    "clothIcon": "\ud83d\udc66",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 38,
    "expressPrice": 57,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-shirt-srv-m-dry-clean",
    "clothTypeId": "cloth-kid-uniform-shirt",
    "clothName": "School Uniform Shirt",
    "clothIcon": "\ud83d\udc66",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 55,
    "expressPrice": 83,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-pant-srv-m-steam-iron",
    "clothTypeId": "cloth-kid-uniform-pant",
    "clothName": "School Uniform Trousers",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 18,
    "expressPrice": 27,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-pant-srv-m-wash-fold",
    "clothTypeId": "cloth-kid-uniform-pant",
    "clothName": "School Uniform Trousers",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 30,
    "expressPrice": 45,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-pant-srv-m-wash-iron",
    "clothTypeId": "cloth-kid-uniform-pant",
    "clothName": "School Uniform Trousers",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 42,
    "expressPrice": 63,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-pant-srv-m-dry-clean",
    "clothTypeId": "cloth-kid-uniform-pant",
    "clothName": "School Uniform Trousers",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 60,
    "expressPrice": 90,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-skirt-srv-m-steam-iron",
    "clothTypeId": "cloth-kid-uniform-skirt",
    "clothName": "School Uniform Skirt / Pinafore",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 20,
    "expressPrice": 30,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-skirt-srv-m-wash-fold",
    "clothTypeId": "cloth-kid-uniform-skirt",
    "clothName": "School Uniform Skirt / Pinafore",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 32,
    "expressPrice": 48,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-skirt-srv-m-wash-iron",
    "clothTypeId": "cloth-kid-uniform-skirt",
    "clothName": "School Uniform Skirt / Pinafore",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 45,
    "expressPrice": 68,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-skirt-srv-m-dry-clean",
    "clothTypeId": "cloth-kid-uniform-skirt",
    "clothName": "School Uniform Skirt / Pinafore",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 65,
    "expressPrice": 98,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-blazer-srv-m-steam-iron",
    "clothTypeId": "cloth-kid-uniform-blazer",
    "clothName": "School Uniform Blazer / Coat",
    "clothIcon": "\ud83e\udde5",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 45,
    "expressPrice": 68,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-blazer-srv-m-wash-fold",
    "clothTypeId": "cloth-kid-uniform-blazer",
    "clothName": "School Uniform Blazer / Coat",
    "clothIcon": "\ud83e\udde5",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 75,
    "expressPrice": 113,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-blazer-srv-m-wash-iron",
    "clothTypeId": "cloth-kid-uniform-blazer",
    "clothName": "School Uniform Blazer / Coat",
    "clothIcon": "\ud83e\udde5",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 95,
    "expressPrice": 143,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-blazer-srv-m-dry-clean",
    "clothTypeId": "cloth-kid-uniform-blazer",
    "clothName": "School Uniform Blazer / Coat",
    "clothIcon": "\ud83e\udde5",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 140,
    "expressPrice": 210,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-tie-belt-srv-m-steam-iron",
    "clothTypeId": "cloth-kid-uniform-tie-belt",
    "clothName": "School Tie & Accessories Set",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 10,
    "expressPrice": 15,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-tie-belt-srv-m-wash-fold",
    "clothTypeId": "cloth-kid-uniform-tie-belt",
    "clothName": "School Tie & Accessories Set",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 15,
    "expressPrice": 23,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-tie-belt-srv-m-wash-iron",
    "clothTypeId": "cloth-kid-uniform-tie-belt",
    "clothName": "School Tie & Accessories Set",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 22,
    "expressPrice": 33,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-uniform-tie-belt-srv-m-dry-clean",
    "clothTypeId": "cloth-kid-uniform-tie-belt",
    "clothName": "School Tie & Accessories Set",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 35,
    "expressPrice": 53,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-shirt-srv-m-steam-iron",
    "clothTypeId": "cloth-kid-shirt",
    "clothName": "Kids Shirt (Casual / Party)",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 15,
    "expressPrice": 23,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-shirt-srv-m-wash-fold",
    "clothTypeId": "cloth-kid-shirt",
    "clothName": "Kids Shirt (Casual / Party)",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 28,
    "expressPrice": 42,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-shirt-srv-m-wash-iron",
    "clothTypeId": "cloth-kid-shirt",
    "clothName": "Kids Shirt (Casual / Party)",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 38,
    "expressPrice": 57,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-shirt-srv-m-dry-clean",
    "clothTypeId": "cloth-kid-shirt",
    "clothName": "Kids Shirt (Casual / Party)",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 55,
    "expressPrice": 83,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kids-tshirt-srv-m-steam-iron",
    "clothTypeId": "cloth-kids-tshirt",
    "clothName": "Kids T-Shirt / Top",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 12,
    "expressPrice": 18,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kids-tshirt-srv-m-wash-fold",
    "clothTypeId": "cloth-kids-tshirt",
    "clothName": "Kids T-Shirt / Top",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 24,
    "expressPrice": 36,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kids-tshirt-srv-m-wash-iron",
    "clothTypeId": "cloth-kids-tshirt",
    "clothName": "Kids T-Shirt / Top",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 32,
    "expressPrice": 48,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kids-tshirt-srv-m-dry-clean",
    "clothTypeId": "cloth-kids-tshirt",
    "clothName": "Kids T-Shirt / Top",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 48,
    "expressPrice": 72,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-polo-srv-m-steam-iron",
    "clothTypeId": "cloth-kid-polo",
    "clothName": "Kids Polo Collar T-Shirt",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 14,
    "expressPrice": 21,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-polo-srv-m-wash-fold",
    "clothTypeId": "cloth-kid-polo",
    "clothName": "Kids Polo Collar T-Shirt",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 26,
    "expressPrice": 39,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-polo-srv-m-wash-iron",
    "clothTypeId": "cloth-kid-polo",
    "clothName": "Kids Polo Collar T-Shirt",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 35,
    "expressPrice": 53,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-polo-srv-m-dry-clean",
    "clothTypeId": "cloth-kid-polo",
    "clothName": "Kids Polo Collar T-Shirt",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 50,
    "expressPrice": 75,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-hoodie-srv-m-steam-iron",
    "clothTypeId": "cloth-kid-hoodie",
    "clothName": "Kids Hoodie / Sweatshirt",
    "clothIcon": "\ud83e\udde5",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 30,
    "expressPrice": 45,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-hoodie-srv-m-wash-fold",
    "clothTypeId": "cloth-kid-hoodie",
    "clothName": "Kids Hoodie / Sweatshirt",
    "clothIcon": "\ud83e\udde5",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 50,
    "expressPrice": 75,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-hoodie-srv-m-wash-iron",
    "clothTypeId": "cloth-kid-hoodie",
    "clothName": "Kids Hoodie / Sweatshirt",
    "clothIcon": "\ud83e\udde5",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 65,
    "expressPrice": 98,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-hoodie-srv-m-dry-clean",
    "clothTypeId": "cloth-kid-hoodie",
    "clothName": "Kids Hoodie / Sweatshirt",
    "clothIcon": "\ud83e\udde5",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 95,
    "expressPrice": 143,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-sweater-srv-m-steam-iron",
    "clothTypeId": "cloth-kid-sweater",
    "clothName": "Kids Woolen Sweater / Cardigan",
    "clothIcon": "\ud83e\uddf6",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 35,
    "expressPrice": 53,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-sweater-srv-m-wash-fold",
    "clothTypeId": "cloth-kid-sweater",
    "clothName": "Kids Woolen Sweater / Cardigan",
    "clothIcon": "\ud83e\uddf6",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 55,
    "expressPrice": 83,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-sweater-srv-m-wash-iron",
    "clothTypeId": "cloth-kid-sweater",
    "clothName": "Kids Woolen Sweater / Cardigan",
    "clothIcon": "\ud83e\uddf6",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 75,
    "expressPrice": 113,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-sweater-srv-m-dry-clean",
    "clothTypeId": "cloth-kid-sweater",
    "clothName": "Kids Woolen Sweater / Cardigan",
    "clothIcon": "\ud83e\uddf6",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 110,
    "expressPrice": 165,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-pant-srv-m-steam-iron",
    "clothTypeId": "cloth-kid-pant",
    "clothName": "Kids Denim Jeans",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 18,
    "expressPrice": 27,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-pant-srv-m-wash-fold",
    "clothTypeId": "cloth-kid-pant",
    "clothName": "Kids Denim Jeans",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 32,
    "expressPrice": 48,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-pant-srv-m-wash-iron",
    "clothTypeId": "cloth-kid-pant",
    "clothName": "Kids Denim Jeans",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 44,
    "expressPrice": 66,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-pant-srv-m-dry-clean",
    "clothTypeId": "cloth-kid-pant",
    "clothName": "Kids Denim Jeans",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 65,
    "expressPrice": 98,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-trousers-srv-m-steam-iron",
    "clothTypeId": "cloth-kid-trousers",
    "clothName": "Kids Cotton Chinos / Trousers",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 16,
    "expressPrice": 24,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-trousers-srv-m-wash-fold",
    "clothTypeId": "cloth-kid-trousers",
    "clothName": "Kids Cotton Chinos / Trousers",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 30,
    "expressPrice": 45,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-trousers-srv-m-wash-iron",
    "clothTypeId": "cloth-kid-trousers",
    "clothName": "Kids Cotton Chinos / Trousers",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 40,
    "expressPrice": 60,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-trousers-srv-m-dry-clean",
    "clothTypeId": "cloth-kid-trousers",
    "clothName": "Kids Cotton Chinos / Trousers",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 60,
    "expressPrice": 90,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kids-shorts-srv-m-steam-iron",
    "clothTypeId": "cloth-kids-shorts",
    "clothName": "Kids Shorts / Half Pant",
    "clothIcon": "\ud83e\ude73",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 12,
    "expressPrice": 18,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kids-shorts-srv-m-wash-fold",
    "clothTypeId": "cloth-kids-shorts",
    "clothName": "Kids Shorts / Half Pant",
    "clothIcon": "\ud83e\ude73",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 22,
    "expressPrice": 33,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kids-shorts-srv-m-wash-iron",
    "clothTypeId": "cloth-kids-shorts",
    "clothName": "Kids Shorts / Half Pant",
    "clothIcon": "\ud83e\ude73",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 30,
    "expressPrice": 45,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kids-shorts-srv-m-dry-clean",
    "clothTypeId": "cloth-kids-shorts",
    "clothName": "Kids Shorts / Half Pant",
    "clothIcon": "\ud83e\ude73",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 45,
    "expressPrice": 68,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-trackpant-srv-m-steam-iron",
    "clothTypeId": "cloth-kid-trackpant",
    "clothName": "Kids Trackpant / Joggers",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 15,
    "expressPrice": 23,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-trackpant-srv-m-wash-fold",
    "clothTypeId": "cloth-kid-trackpant",
    "clothName": "Kids Trackpant / Joggers",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 28,
    "expressPrice": 42,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-trackpant-srv-m-wash-iron",
    "clothTypeId": "cloth-kid-trackpant",
    "clothName": "Kids Trackpant / Joggers",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 38,
    "expressPrice": 57,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-trackpant-srv-m-dry-clean",
    "clothTypeId": "cloth-kid-trackpant",
    "clothName": "Kids Trackpant / Joggers",
    "clothIcon": "\ud83d\udc56",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 55,
    "expressPrice": 83,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kids-frock-srv-m-steam-iron",
    "clothTypeId": "cloth-kids-frock",
    "clothName": "Kids Frock / Party Dress",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 28,
    "expressPrice": 42,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kids-frock-srv-m-wash-fold",
    "clothTypeId": "cloth-kids-frock",
    "clothName": "Kids Frock / Party Dress",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 45,
    "expressPrice": 68,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kids-frock-srv-m-wash-iron",
    "clothTypeId": "cloth-kids-frock",
    "clothName": "Kids Frock / Party Dress",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 60,
    "expressPrice": 90,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kids-frock-srv-m-dry-clean",
    "clothTypeId": "cloth-kids-frock",
    "clothName": "Kids Frock / Party Dress",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 90,
    "expressPrice": 135,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kids-ethnic-srv-m-steam-iron",
    "clothTypeId": "cloth-kids-ethnic",
    "clothName": "Kids Kurta Pyjama / Dhoti",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 25,
    "expressPrice": 38,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kids-ethnic-srv-m-wash-fold",
    "clothTypeId": "cloth-kids-ethnic",
    "clothName": "Kids Kurta Pyjama / Dhoti",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 40,
    "expressPrice": 60,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kids-ethnic-srv-m-wash-iron",
    "clothTypeId": "cloth-kids-ethnic",
    "clothName": "Kids Kurta Pyjama / Dhoti",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 55,
    "expressPrice": 83,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kids-ethnic-srv-m-dry-clean",
    "clothTypeId": "cloth-kids-ethnic",
    "clothName": "Kids Kurta Pyjama / Dhoti",
    "clothIcon": "\ud83e\udd7b",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 80,
    "expressPrice": 120,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-lehenga-srv-m-steam-iron",
    "clothTypeId": "cloth-kid-lehenga",
    "clothName": "Kids Ghagra / Lehenga Choli",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 50,
    "expressPrice": 75,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-lehenga-srv-m-wash-fold",
    "clothTypeId": "cloth-kid-lehenga",
    "clothName": "Kids Ghagra / Lehenga Choli",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 80,
    "expressPrice": 120,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-lehenga-srv-m-wash-iron",
    "clothTypeId": "cloth-kid-lehenga",
    "clothName": "Kids Ghagra / Lehenga Choli",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 110,
    "expressPrice": 165,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-lehenga-srv-m-dry-clean",
    "clothTypeId": "cloth-kid-lehenga",
    "clothName": "Kids Ghagra / Lehenga Choli",
    "clothIcon": "\ud83d\udc57",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 160,
    "expressPrice": 240,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-sherwani-srv-m-steam-iron",
    "clothTypeId": "cloth-kid-sherwani",
    "clothName": "Kids Sherwani / Indo-Western",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 65,
    "expressPrice": 98,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-sherwani-srv-m-wash-fold",
    "clothTypeId": "cloth-kid-sherwani",
    "clothName": "Kids Sherwani / Indo-Western",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 95,
    "expressPrice": 143,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-sherwani-srv-m-wash-iron",
    "clothTypeId": "cloth-kid-sherwani",
    "clothName": "Kids Sherwani / Indo-Western",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 130,
    "expressPrice": 195,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-sherwani-srv-m-dry-clean",
    "clothTypeId": "cloth-kid-sherwani",
    "clothName": "Kids Sherwani / Indo-Western",
    "clothIcon": "\ud83d\udc54",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 190,
    "expressPrice": 285,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-baby-set-srv-m-steam-iron",
    "clothTypeId": "cloth-baby-set",
    "clothName": "Baby Romper / Onesie Set",
    "clothIcon": "\ud83d\udc76",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 12,
    "expressPrice": 18,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-baby-set-srv-m-wash-fold",
    "clothTypeId": "cloth-baby-set",
    "clothName": "Baby Romper / Onesie Set",
    "clothIcon": "\ud83d\udc76",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 20,
    "expressPrice": 30,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-baby-set-srv-m-wash-iron",
    "clothTypeId": "cloth-baby-set",
    "clothName": "Baby Romper / Onesie Set",
    "clothIcon": "\ud83d\udc76",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 28,
    "expressPrice": 42,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-baby-set-srv-m-dry-clean",
    "clothTypeId": "cloth-baby-set",
    "clothName": "Baby Romper / Onesie Set",
    "clothIcon": "\ud83d\udc76",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 40,
    "expressPrice": 60,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-nightsuit-srv-m-steam-iron",
    "clothTypeId": "cloth-kid-nightsuit",
    "clothName": "Kids Pajama / Sleepwear Set",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 16,
    "expressPrice": 24,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-nightsuit-srv-m-wash-fold",
    "clothTypeId": "cloth-kid-nightsuit",
    "clothName": "Kids Pajama / Sleepwear Set",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 28,
    "expressPrice": 42,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-nightsuit-srv-m-wash-iron",
    "clothTypeId": "cloth-kid-nightsuit",
    "clothName": "Kids Pajama / Sleepwear Set",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 38,
    "expressPrice": 57,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kid-nightsuit-srv-m-dry-clean",
    "clothTypeId": "cloth-kid-nightsuit",
    "clothName": "Kids Pajama / Sleepwear Set",
    "clothIcon": "\ud83d\udc55",
    "categoryTag": "KIDS",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 55,
    "expressPrice": 83,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-single-srv-m-steam-iron",
    "clothTypeId": "cloth-bedsheet-single",
    "clothName": "Single Bedsheet (Cotton)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 25,
    "expressPrice": 38,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-single-srv-m-wash-fold",
    "clothTypeId": "cloth-bedsheet-single",
    "clothName": "Single Bedsheet (Cotton)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 40,
    "expressPrice": 60,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-single-srv-m-wash-iron",
    "clothTypeId": "cloth-bedsheet-single",
    "clothName": "Single Bedsheet (Cotton)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 55,
    "expressPrice": 83,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-single-srv-m-dry-clean",
    "clothTypeId": "cloth-bedsheet-single",
    "clothName": "Single Bedsheet (Cotton)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 85,
    "expressPrice": 128,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-double-srv-m-steam-iron",
    "clothTypeId": "cloth-bedsheet-double",
    "clothName": "Double Bedsheet (Cotton)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 35,
    "expressPrice": 53,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-double-srv-m-wash-fold",
    "clothTypeId": "cloth-bedsheet-double",
    "clothName": "Double Bedsheet (Cotton)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 60,
    "expressPrice": 90,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-double-srv-m-wash-iron",
    "clothTypeId": "cloth-bedsheet-double",
    "clothName": "Double Bedsheet (Cotton)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 80,
    "expressPrice": 120,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-double-srv-m-dry-clean",
    "clothTypeId": "cloth-bedsheet-double",
    "clothName": "Double Bedsheet (Cotton)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 120,
    "expressPrice": 180,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-king-srv-m-steam-iron",
    "clothTypeId": "cloth-bedsheet-king",
    "clothName": "King Size Designer Bedsheet",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 45,
    "expressPrice": 68,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-king-srv-m-wash-fold",
    "clothTypeId": "cloth-bedsheet-king",
    "clothName": "King Size Designer Bedsheet",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 75,
    "expressPrice": 113,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-king-srv-m-wash-iron",
    "clothTypeId": "cloth-bedsheet-king",
    "clothName": "King Size Designer Bedsheet",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 95,
    "expressPrice": 143,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-king-srv-m-dry-clean",
    "clothTypeId": "cloth-bedsheet-king",
    "clothName": "King Size Designer Bedsheet",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 145,
    "expressPrice": 218,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-fitted-srv-m-steam-iron",
    "clothTypeId": "cloth-bedsheet-fitted",
    "clothName": "Elastic Fitted Bedsheet",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 35,
    "expressPrice": 53,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-fitted-srv-m-wash-fold",
    "clothTypeId": "cloth-bedsheet-fitted",
    "clothName": "Elastic Fitted Bedsheet",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 60,
    "expressPrice": 90,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-fitted-srv-m-wash-iron",
    "clothTypeId": "cloth-bedsheet-fitted",
    "clothName": "Elastic Fitted Bedsheet",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 80,
    "expressPrice": 120,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-fitted-srv-m-dry-clean",
    "clothTypeId": "cloth-bedsheet-fitted",
    "clothName": "Elastic Fitted Bedsheet",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 120,
    "expressPrice": 180,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-silk-srv-m-steam-iron",
    "clothTypeId": "cloth-bedsheet-silk",
    "clothName": "Silk / Satin Luxury Bedsheet",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 60,
    "expressPrice": 90,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-silk-srv-m-wash-fold",
    "clothTypeId": "cloth-bedsheet-silk",
    "clothName": "Silk / Satin Luxury Bedsheet",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 95,
    "expressPrice": 143,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-silk-srv-m-wash-iron",
    "clothTypeId": "cloth-bedsheet-silk",
    "clothName": "Silk / Satin Luxury Bedsheet",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 130,
    "expressPrice": 195,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bedsheet-silk-srv-m-dry-clean",
    "clothTypeId": "cloth-bedsheet-silk",
    "clothName": "Silk / Satin Luxury Bedsheet",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 195,
    "expressPrice": 293,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-pillow-srv-m-steam-iron",
    "clothTypeId": "cloth-pillow",
    "clothName": "Pillow Covers (Pair)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 15,
    "expressPrice": 23,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-pillow-srv-m-wash-fold",
    "clothTypeId": "cloth-pillow",
    "clothName": "Pillow Covers (Pair)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 20,
    "expressPrice": 30,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-pillow-srv-m-wash-iron",
    "clothTypeId": "cloth-pillow",
    "clothName": "Pillow Covers (Pair)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 30,
    "expressPrice": 45,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-pillow-srv-m-dry-clean",
    "clothTypeId": "cloth-pillow",
    "clothName": "Pillow Covers (Pair)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 45,
    "expressPrice": 68,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-cushion-cover-srv-m-steam-iron",
    "clothTypeId": "cloth-cushion-cover",
    "clothName": "Cushion Covers (Set of 2)",
    "clothIcon": "\ud83d\udecb\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 18,
    "expressPrice": 27,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-cushion-cover-srv-m-wash-fold",
    "clothTypeId": "cloth-cushion-cover",
    "clothName": "Cushion Covers (Set of 2)",
    "clothIcon": "\ud83d\udecb\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 25,
    "expressPrice": 38,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-cushion-cover-srv-m-wash-iron",
    "clothTypeId": "cloth-cushion-cover",
    "clothName": "Cushion Covers (Set of 2)",
    "clothIcon": "\ud83d\udecb\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 35,
    "expressPrice": 53,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-cushion-cover-srv-m-dry-clean",
    "clothTypeId": "cloth-cushion-cover",
    "clothName": "Cushion Covers (Set of 2)",
    "clothIcon": "\ud83d\udecb\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 50,
    "expressPrice": 75,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bolster-cover-srv-m-steam-iron",
    "clothTypeId": "cloth-bolster-cover",
    "clothName": "Bolster / Diwan Roll Cover (Pair)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 20,
    "expressPrice": 30,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bolster-cover-srv-m-wash-fold",
    "clothTypeId": "cloth-bolster-cover",
    "clothName": "Bolster / Diwan Roll Cover (Pair)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 30,
    "expressPrice": 45,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bolster-cover-srv-m-wash-iron",
    "clothTypeId": "cloth-bolster-cover",
    "clothName": "Bolster / Diwan Roll Cover (Pair)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 42,
    "expressPrice": 63,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bolster-cover-srv-m-dry-clean",
    "clothTypeId": "cloth-bolster-cover",
    "clothName": "Bolster / Diwan Roll Cover (Pair)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 60,
    "expressPrice": 90,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-blanket-single-srv-m-steam-iron",
    "clothTypeId": "cloth-blanket-single",
    "clothName": "Single Fleece / Light Blanket",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 40,
    "expressPrice": 60,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-blanket-single-srv-m-wash-fold",
    "clothTypeId": "cloth-blanket-single",
    "clothName": "Single Fleece / Light Blanket",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 99,
    "expressPrice": 149,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-blanket-single-srv-m-wash-iron",
    "clothTypeId": "cloth-blanket-single",
    "clothName": "Single Fleece / Light Blanket",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 130,
    "expressPrice": 195,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-blanket-single-srv-m-dry-clean",
    "clothTypeId": "cloth-blanket-single",
    "clothName": "Single Fleece / Light Blanket",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 180,
    "expressPrice": 270,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-blanket-double-srv-m-steam-iron",
    "clothTypeId": "cloth-blanket-double",
    "clothName": "Double Mink Blanket (Heavy)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 60,
    "expressPrice": 90,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-blanket-double-srv-m-wash-fold",
    "clothTypeId": "cloth-blanket-double",
    "clothName": "Double Mink Blanket (Heavy)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 160,
    "expressPrice": 240,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-blanket-double-srv-m-wash-iron",
    "clothTypeId": "cloth-blanket-double",
    "clothName": "Double Mink Blanket (Heavy)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 210,
    "expressPrice": 315,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-blanket-double-srv-m-dry-clean",
    "clothTypeId": "cloth-blanket-double",
    "clothName": "Double Mink Blanket (Heavy)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 290,
    "expressPrice": 435,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-quilt-single-srv-m-steam-iron",
    "clothTypeId": "cloth-quilt-single",
    "clothName": "Single Quilt / Jaipuri Razai",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 50,
    "expressPrice": 75,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-quilt-single-srv-m-wash-fold",
    "clothTypeId": "cloth-quilt-single",
    "clothName": "Single Quilt / Jaipuri Razai",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 120,
    "expressPrice": 180,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-quilt-single-srv-m-wash-iron",
    "clothTypeId": "cloth-quilt-single",
    "clothName": "Single Quilt / Jaipuri Razai",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 160,
    "expressPrice": 240,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-quilt-single-srv-m-dry-clean",
    "clothTypeId": "cloth-quilt-single",
    "clothName": "Single Quilt / Jaipuri Razai",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 220,
    "expressPrice": 330,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-quilt-double-srv-m-steam-iron",
    "clothTypeId": "cloth-quilt-double",
    "clothName": "Double Quilt / Heavy Razai",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 70,
    "expressPrice": 105,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-quilt-double-srv-m-wash-fold",
    "clothTypeId": "cloth-quilt-double",
    "clothName": "Double Quilt / Heavy Razai",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 180,
    "expressPrice": 270,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-quilt-double-srv-m-wash-iron",
    "clothTypeId": "cloth-quilt-double",
    "clothName": "Double Quilt / Heavy Razai",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 240,
    "expressPrice": 360,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-quilt-double-srv-m-dry-clean",
    "clothTypeId": "cloth-quilt-double",
    "clothName": "Double Quilt / Heavy Razai",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 330,
    "expressPrice": 495,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-comforter-single-srv-m-steam-iron",
    "clothTypeId": "cloth-comforter-single",
    "clothName": "Single Down / Microfiber Comforter",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 45,
    "expressPrice": 68,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-comforter-single-srv-m-wash-fold",
    "clothTypeId": "cloth-comforter-single",
    "clothName": "Single Down / Microfiber Comforter",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 130,
    "expressPrice": 195,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-comforter-single-srv-m-wash-iron",
    "clothTypeId": "cloth-comforter-single",
    "clothName": "Single Down / Microfiber Comforter",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 170,
    "expressPrice": 255,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-comforter-single-srv-m-dry-clean",
    "clothTypeId": "cloth-comforter-single",
    "clothName": "Single Down / Microfiber Comforter",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 240,
    "expressPrice": 360,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-comforter-double-srv-m-steam-iron",
    "clothTypeId": "cloth-comforter-double",
    "clothName": "Double Down / Microfiber Comforter",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 65,
    "expressPrice": 98,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-comforter-double-srv-m-wash-fold",
    "clothTypeId": "cloth-comforter-double",
    "clothName": "Double Down / Microfiber Comforter",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 190,
    "expressPrice": 285,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-comforter-double-srv-m-wash-iron",
    "clothTypeId": "cloth-comforter-double",
    "clothName": "Double Down / Microfiber Comforter",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 250,
    "expressPrice": 375,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-comforter-double-srv-m-dry-clean",
    "clothTypeId": "cloth-comforter-double",
    "clothName": "Double Down / Microfiber Comforter",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 350,
    "expressPrice": 525,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-duvet-cover-srv-m-steam-iron",
    "clothTypeId": "cloth-duvet-cover",
    "clothName": "Duvet / Comforter Outer Cover",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 35,
    "expressPrice": 53,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-duvet-cover-srv-m-wash-fold",
    "clothTypeId": "cloth-duvet-cover",
    "clothName": "Duvet / Comforter Outer Cover",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 65,
    "expressPrice": 98,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-duvet-cover-srv-m-wash-iron",
    "clothTypeId": "cloth-duvet-cover",
    "clothName": "Duvet / Comforter Outer Cover",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 85,
    "expressPrice": 128,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-duvet-cover-srv-m-dry-clean",
    "clothTypeId": "cloth-duvet-cover",
    "clothName": "Duvet / Comforter Outer Cover",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 125,
    "expressPrice": 188,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-mattress-protector-srv-m-steam-iron",
    "clothTypeId": "cloth-mattress-protector",
    "clothName": "Mattress Protector (Waterproof)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 40,
    "expressPrice": 60,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-mattress-protector-srv-m-wash-fold",
    "clothTypeId": "cloth-mattress-protector",
    "clothName": "Mattress Protector (Waterproof)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 85,
    "expressPrice": 128,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-mattress-protector-srv-m-wash-iron",
    "clothTypeId": "cloth-mattress-protector",
    "clothName": "Mattress Protector (Waterproof)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 110,
    "expressPrice": 165,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-mattress-protector-srv-m-dry-clean",
    "clothTypeId": "cloth-mattress-protector",
    "clothName": "Mattress Protector (Waterproof)",
    "clothIcon": "\ud83d\udecf\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 160,
    "expressPrice": 240,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-curtain-window-srv-m-steam-iron",
    "clothTypeId": "cloth-curtain-window",
    "clothName": "Window Curtain (Up to 5 ft)",
    "clothIcon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 30,
    "expressPrice": 45,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-curtain-window-srv-m-wash-fold",
    "clothTypeId": "cloth-curtain-window",
    "clothName": "Window Curtain (Up to 5 ft)",
    "clothIcon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 50,
    "expressPrice": 75,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-curtain-window-srv-m-wash-iron",
    "clothTypeId": "cloth-curtain-window",
    "clothName": "Window Curtain (Up to 5 ft)",
    "clothIcon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 70,
    "expressPrice": 105,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-curtain-window-srv-m-dry-clean",
    "clothTypeId": "cloth-curtain-window",
    "clothName": "Window Curtain (Up to 5 ft)",
    "clothIcon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 100,
    "expressPrice": 150,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-curtain-door-srv-m-steam-iron",
    "clothTypeId": "cloth-curtain-door",
    "clothName": "Door Curtain (Up to 7 ft)",
    "clothIcon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 40,
    "expressPrice": 60,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-curtain-door-srv-m-wash-fold",
    "clothTypeId": "cloth-curtain-door",
    "clothName": "Door Curtain (Up to 7 ft)",
    "clothIcon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 70,
    "expressPrice": 105,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-curtain-door-srv-m-wash-iron",
    "clothTypeId": "cloth-curtain-door",
    "clothName": "Door Curtain (Up to 7 ft)",
    "clothIcon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 95,
    "expressPrice": 143,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-curtain-door-srv-m-dry-clean",
    "clothTypeId": "cloth-curtain-door",
    "clothName": "Door Curtain (Up to 7 ft)",
    "clothIcon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 140,
    "expressPrice": 210,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-curtain-long-srv-m-steam-iron",
    "clothTypeId": "cloth-curtain-long",
    "clothName": "Long / Heavy Blackout Curtain (9 ft+)",
    "clothIcon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 60,
    "expressPrice": 90,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-curtain-long-srv-m-wash-fold",
    "clothTypeId": "cloth-curtain-long",
    "clothName": "Long / Heavy Blackout Curtain (9 ft+)",
    "clothIcon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 100,
    "expressPrice": 150,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-curtain-long-srv-m-wash-iron",
    "clothTypeId": "cloth-curtain-long",
    "clothName": "Long / Heavy Blackout Curtain (9 ft+)",
    "clothIcon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 135,
    "expressPrice": 203,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-curtain-long-srv-m-dry-clean",
    "clothTypeId": "cloth-curtain-long",
    "clothName": "Long / Heavy Blackout Curtain (9 ft+)",
    "clothIcon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 195,
    "expressPrice": 293,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-curtain-sheer-srv-m-steam-iron",
    "clothTypeId": "cloth-curtain-sheer",
    "clothName": "Sheer / Net Lace Curtain",
    "clothIcon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 30,
    "expressPrice": 45,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-curtain-sheer-srv-m-wash-fold",
    "clothTypeId": "cloth-curtain-sheer",
    "clothName": "Sheer / Net Lace Curtain",
    "clothIcon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 45,
    "expressPrice": 68,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-curtain-sheer-srv-m-wash-iron",
    "clothTypeId": "cloth-curtain-sheer",
    "clothName": "Sheer / Net Lace Curtain",
    "clothIcon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 60,
    "expressPrice": 90,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-curtain-sheer-srv-m-dry-clean",
    "clothTypeId": "cloth-curtain-sheer",
    "clothName": "Sheer / Net Lace Curtain",
    "clothIcon": "\ud83e\ude9f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 90,
    "expressPrice": 135,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bath-towel-large-srv-m-steam-iron",
    "clothTypeId": "cloth-bath-towel-large",
    "clothName": "Bath Towel (Large / Turkish)",
    "clothIcon": "\ud83d\udebf",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 15,
    "expressPrice": 23,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bath-towel-large-srv-m-wash-fold",
    "clothTypeId": "cloth-bath-towel-large",
    "clothName": "Bath Towel (Large / Turkish)",
    "clothIcon": "\ud83d\udebf",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 35,
    "expressPrice": 53,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bath-towel-large-srv-m-wash-iron",
    "clothTypeId": "cloth-bath-towel-large",
    "clothName": "Bath Towel (Large / Turkish)",
    "clothIcon": "\ud83d\udebf",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 45,
    "expressPrice": 68,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bath-towel-large-srv-m-dry-clean",
    "clothTypeId": "cloth-bath-towel-large",
    "clothName": "Bath Towel (Large / Turkish)",
    "clothIcon": "\ud83d\udebf",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 65,
    "expressPrice": 98,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-hand-towel-srv-m-steam-iron",
    "clothTypeId": "cloth-hand-towel",
    "clothName": "Hand & Face Towels (Pair)",
    "clothIcon": "\ud83e\uddfc",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 12,
    "expressPrice": 18,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-hand-towel-srv-m-wash-fold",
    "clothTypeId": "cloth-hand-towel",
    "clothName": "Hand & Face Towels (Pair)",
    "clothIcon": "\ud83e\uddfc",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 22,
    "expressPrice": 33,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-hand-towel-srv-m-wash-iron",
    "clothTypeId": "cloth-hand-towel",
    "clothName": "Hand & Face Towels (Pair)",
    "clothIcon": "\ud83e\uddfc",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 30,
    "expressPrice": 45,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-hand-towel-srv-m-dry-clean",
    "clothTypeId": "cloth-hand-towel",
    "clothName": "Hand & Face Towels (Pair)",
    "clothIcon": "\ud83e\uddfc",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 45,
    "expressPrice": 68,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bathrobe-srv-m-steam-iron",
    "clothTypeId": "cloth-bathrobe",
    "clothName": "Bathrobe (Terrycloth / Waffle)",
    "clothIcon": "\ud83e\udd4b",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 35,
    "expressPrice": 53,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bathrobe-srv-m-wash-fold",
    "clothTypeId": "cloth-bathrobe",
    "clothName": "Bathrobe (Terrycloth / Waffle)",
    "clothIcon": "\ud83e\udd4b",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 60,
    "expressPrice": 90,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bathrobe-srv-m-wash-iron",
    "clothTypeId": "cloth-bathrobe",
    "clothName": "Bathrobe (Terrycloth / Waffle)",
    "clothIcon": "\ud83e\udd4b",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 85,
    "expressPrice": 128,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bathrobe-srv-m-dry-clean",
    "clothTypeId": "cloth-bathrobe",
    "clothName": "Bathrobe (Terrycloth / Waffle)",
    "clothIcon": "\ud83e\udd4b",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 120,
    "expressPrice": 180,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bath-mat-srv-m-steam-iron",
    "clothTypeId": "cloth-bath-mat",
    "clothName": "Bath Mat / Floor Rug",
    "clothIcon": "\ud83d\udec1",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 20,
    "expressPrice": 30,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bath-mat-srv-m-wash-fold",
    "clothTypeId": "cloth-bath-mat",
    "clothName": "Bath Mat / Floor Rug",
    "clothIcon": "\ud83d\udec1",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 40,
    "expressPrice": 60,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bath-mat-srv-m-wash-iron",
    "clothTypeId": "cloth-bath-mat",
    "clothName": "Bath Mat / Floor Rug",
    "clothIcon": "\ud83d\udec1",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 55,
    "expressPrice": 83,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-bath-mat-srv-m-dry-clean",
    "clothTypeId": "cloth-bath-mat",
    "clothName": "Bath Mat / Floor Rug",
    "clothIcon": "\ud83d\udec1",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 80,
    "expressPrice": 120,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-sofa-cover-1s-srv-m-steam-iron",
    "clothTypeId": "cloth-sofa-cover-1s",
    "clothName": "Single Armchair / Sofa Cover",
    "clothIcon": "\ud83d\udecb\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 30,
    "expressPrice": 45,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-sofa-cover-1s-srv-m-wash-fold",
    "clothTypeId": "cloth-sofa-cover-1s",
    "clothName": "Single Armchair / Sofa Cover",
    "clothIcon": "\ud83d\udecb\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 60,
    "expressPrice": 90,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-sofa-cover-1s-srv-m-wash-iron",
    "clothTypeId": "cloth-sofa-cover-1s",
    "clothName": "Single Armchair / Sofa Cover",
    "clothIcon": "\ud83d\udecb\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 80,
    "expressPrice": 120,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-sofa-cover-1s-srv-m-dry-clean",
    "clothTypeId": "cloth-sofa-cover-1s",
    "clothName": "Single Armchair / Sofa Cover",
    "clothIcon": "\ud83d\udecb\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 115,
    "expressPrice": 173,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-sofa-cover-3s-srv-m-steam-iron",
    "clothTypeId": "cloth-sofa-cover-3s",
    "clothName": "3-Seater Sofa Full Slipcover",
    "clothIcon": "\ud83d\udecb\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 60,
    "expressPrice": 90,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-sofa-cover-3s-srv-m-wash-fold",
    "clothTypeId": "cloth-sofa-cover-3s",
    "clothName": "3-Seater Sofa Full Slipcover",
    "clothIcon": "\ud83d\udecb\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 140,
    "expressPrice": 210,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-sofa-cover-3s-srv-m-wash-iron",
    "clothTypeId": "cloth-sofa-cover-3s",
    "clothName": "3-Seater Sofa Full Slipcover",
    "clothIcon": "\ud83d\udecb\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 180,
    "expressPrice": 270,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-sofa-cover-3s-srv-m-dry-clean",
    "clothTypeId": "cloth-sofa-cover-3s",
    "clothName": "3-Seater Sofa Full Slipcover",
    "clothIcon": "\ud83d\udecb\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 250,
    "expressPrice": 375,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-tablecloth-dining-srv-m-steam-iron",
    "clothTypeId": "cloth-tablecloth-dining",
    "clothName": "Dining Tablecloth (6-8 Seater)",
    "clothIcon": "\ud83c\udf7d\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 35,
    "expressPrice": 53,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-tablecloth-dining-srv-m-wash-fold",
    "clothTypeId": "cloth-tablecloth-dining",
    "clothName": "Dining Tablecloth (6-8 Seater)",
    "clothIcon": "\ud83c\udf7d\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 65,
    "expressPrice": 98,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-tablecloth-dining-srv-m-wash-iron",
    "clothTypeId": "cloth-tablecloth-dining",
    "clothName": "Dining Tablecloth (6-8 Seater)",
    "clothIcon": "\ud83c\udf7d\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 85,
    "expressPrice": 128,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-tablecloth-dining-srv-m-dry-clean",
    "clothTypeId": "cloth-tablecloth-dining",
    "clothName": "Dining Tablecloth (6-8 Seater)",
    "clothIcon": "\ud83c\udf7d\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 125,
    "expressPrice": 188,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-table-runner-srv-m-steam-iron",
    "clothTypeId": "cloth-table-runner",
    "clothName": "Table Runner & Mats Set",
    "clothIcon": "\ud83c\udf7d\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 25,
    "expressPrice": 38,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-table-runner-srv-m-wash-fold",
    "clothTypeId": "cloth-table-runner",
    "clothName": "Table Runner & Mats Set",
    "clothIcon": "\ud83c\udf7d\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 40,
    "expressPrice": 60,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-table-runner-srv-m-wash-iron",
    "clothTypeId": "cloth-table-runner",
    "clothName": "Table Runner & Mats Set",
    "clothIcon": "\ud83c\udf7d\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 55,
    "expressPrice": 83,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-table-runner-srv-m-dry-clean",
    "clothTypeId": "cloth-table-runner",
    "clothName": "Table Runner & Mats Set",
    "clothIcon": "\ud83c\udf7d\ufe0f",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 80,
    "expressPrice": 120,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kitchen-apron-srv-m-steam-iron",
    "clothTypeId": "cloth-kitchen-apron",
    "clothName": "Kitchen Apron & Mittens Set",
    "clothIcon": "\ud83d\udc68\u200d\ud83c\udf73",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 18,
    "expressPrice": 27,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kitchen-apron-srv-m-wash-fold",
    "clothTypeId": "cloth-kitchen-apron",
    "clothName": "Kitchen Apron & Mittens Set",
    "clothIcon": "\ud83d\udc68\u200d\ud83c\udf73",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 32,
    "expressPrice": 48,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kitchen-apron-srv-m-wash-iron",
    "clothTypeId": "cloth-kitchen-apron",
    "clothName": "Kitchen Apron & Mittens Set",
    "clothIcon": "\ud83d\udc68\u200d\ud83c\udf73",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 42,
    "expressPrice": 63,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-kitchen-apron-srv-m-dry-clean",
    "clothTypeId": "cloth-kitchen-apron",
    "clothName": "Kitchen Apron & Mittens Set",
    "clothIcon": "\ud83d\udc68\u200d\ud83c\udf73",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 60,
    "expressPrice": 90,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-doormat-heavy-srv-m-steam-iron",
    "clothTypeId": "cloth-doormat-heavy",
    "clothName": "Heavy Coir / Rubber Doormat",
    "clothIcon": "\ud83d\udeaa",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-steam-iron",
    "serviceName": "Iron Only (Steam Press)",
    "price": 20,
    "expressPrice": 30,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-doormat-heavy-srv-m-wash-fold",
    "clothTypeId": "cloth-doormat-heavy",
    "clothName": "Heavy Coir / Rubber Doormat",
    "clothIcon": "\ud83d\udeaa",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-fold",
    "serviceName": "Wash & Fold",
    "price": 45,
    "expressPrice": 68,
    "turnaroundHours": 24,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-doormat-heavy-srv-m-wash-iron",
    "clothTypeId": "cloth-doormat-heavy",
    "clothName": "Heavy Coir / Rubber Doormat",
    "clothIcon": "\ud83d\udeaa",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-wash-iron",
    "serviceName": "Wash & Steam Iron",
    "price": 60,
    "expressPrice": 90,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  },
  {
    "id": "pr-cloth-doormat-heavy-srv-m-dry-clean",
    "clothTypeId": "cloth-doormat-heavy",
    "clothName": "Heavy Coir / Rubber Doormat",
    "clothIcon": "\ud83d\udeaa",
    "categoryTag": "HOME_TEXTILES",
    "serviceId": "srv-m-dry-clean",
    "serviceName": "Dry Cleaning",
    "price": 90,
    "expressPrice": 135,
    "turnaroundHours": 48,
    "isActive": true,
    "isAvailable": true
  }
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
  // Men's Wear Dry Cleaning & Care
  {
    id: 'srv-dc-shirt',
    categoryId: 'cat-1',
    name: 'Dry Clean — Men\'s Shirt',
    slug: 'dry-clean-shirt',
    description: 'Collar stain scrub, hydrocarbon solvent clean, hand steam finish.',
    pricingModel: 'PER_ITEM',
    basePrice: 80,
    unit: 'Item',
    turnaroundHours: 48,
    popular: true,
    expressAvailable: true,
    image: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-shirt.jpg',
    imageUrl: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-shirt.jpg',
  },
  {
    id: 'srv-dc-tshirt',
    categoryId: 'cat-1',
    name: 'Dry Clean — Men\'s T-Shirt / Polo',
    slug: 'dry-clean-tshirt',
    description: 'Gentle color-safe dry cleaning, anti-shrink wash and press.',
    pricingModel: 'PER_ITEM',
    basePrice: 60,
    unit: 'Item',
    turnaroundHours: 48,
    popular: true,
    expressAvailable: true,
    image: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-tshirt.jpg',
    imageUrl: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-tshirt.jpg',
  },
  {
    id: 'srv-dc-jeans',
    categoryId: 'cat-1',
    name: 'Dry Clean — Men\'s Jeans / Denim',
    slug: 'dry-clean-jeans',
    description: 'Indigo-preserving solvent treatment with crease shaping.',
    pricingModel: 'PER_ITEM',
    basePrice: 90,
    unit: 'Item',
    turnaroundHours: 48,
    popular: true,
    expressAvailable: true,
    image: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-jeans.jpg',
    imageUrl: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-jeans.jpg',
  },
  {
    id: 'srv-dc-blazer',
    categoryId: 'cat-1',
    name: 'Dry Clean — Men\'s Blazer / Coat',
    slug: 'dry-clean-blazer',
    description: 'Woolen & polyester structure preservation with shoulder-mould finish.',
    pricingModel: 'PER_ITEM',
    basePrice: 220,
    unit: 'Item',
    turnaroundHours: 48,
    popular: true,
    expressAvailable: true,
    image: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-blazer.jpg',
    imageUrl: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-blazer.jpg',
  },
  {
    id: 'srv-dc-jacket',
    categoryId: 'cat-1',
    name: 'Dry Clean — Men\'s Winter Jacket',
    slug: 'dry-clean-jacket',
    description: 'Heavy winter padding & zipper protective solvent clean.',
    pricingModel: 'PER_ITEM',
    basePrice: 250,
    unit: 'Item',
    turnaroundHours: 48,
    popular: true,
    expressAvailable: true,
    image: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-jacket.jpg',
    imageUrl: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-jacket.jpg',
  },
  {
    id: 'srv-dc-trouser',
    categoryId: 'cat-1',
    name: 'Dry Clean — Men\'s Formal Trouser / Chinos',
    slug: 'dry-clean-trouser',
    description: 'Precision vertical crease alignment & steam press.',
    pricingModel: 'PER_ITEM',
    basePrice: 90,
    unit: 'Item',
    turnaroundHours: 48,
    popular: true,
    expressAvailable: true,
    image: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-trouser.jpg',
    imageUrl: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-trouser.jpg',
  },
  {
    id: 'srv-dc-kurta',
    categoryId: 'cat-1',
    name: 'Dry Clean — Men\'s Kurta / Pyjama',
    slug: 'dry-clean-kurta',
    description: 'Linen, cotton & silk ethnic garment care with zero shrinkage.',
    pricingModel: 'PER_ITEM',
    basePrice: 110,
    unit: 'Item',
    turnaroundHours: 48,
    popular: true,
    expressAvailable: true,
    image: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-kurta-m.jpg',
    imageUrl: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-kurta-m.jpg',
  },
  {
    id: 'srv-dc-shorts',
    categoryId: 'cat-1',
    name: 'Dry Clean — Men\'s Shorts / Bermuda',
    slug: 'dry-clean-shorts',
    description: 'Gentle antibacterial wash & fresh steam iron.',
    pricingModel: 'PER_ITEM',
    basePrice: 59,
    unit: 'Item',
    turnaroundHours: 48,
    popular: false,
    expressAvailable: true,
    image: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-shorts-m.jpg',
    imageUrl: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-shorts-m.jpg',
  },
  {
    id: 'srv-dc-suit2p',
    categoryId: 'cat-1',
    name: 'Dry Clean — Men\'s Suit 2-Piece',
    slug: 'dry-clean-suit-2p',
    description: 'Executive blazer + trouser paired steam clean with suit hanger cover.',
    pricingModel: 'PER_ITEM',
    basePrice: 350,
    unit: 'Set',
    turnaroundHours: 48,
    popular: true,
    expressAvailable: true,
    image: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-suit-2p.jpg',
    imageUrl: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-suit-2p.jpg',
  },
  {
    id: 'srv-dc-suit3p',
    categoryId: 'cat-1',
    name: 'Dry Clean — Men\'s Suit 3-Piece',
    slug: 'dry-clean-suit-3p',
    description: 'Blazer + waistcoat + trouser complete luxury formal ensemble.',
    pricingModel: 'PER_ITEM',
    basePrice: 450,
    unit: 'Set',
    turnaroundHours: 48,
    popular: true,
    expressAvailable: true,
    image: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-suit-3p.jpg',
    imageUrl: 'https://laundry-storage-2026.s3.ap-south-1.amazonaws.com/garments/cloth-suit-3p.jpg',
  },
  // Standard laundry
  {
    id: 'srv-1',
    categoryId: 'cat-1',
    name: 'Wash & Fold (Standard)',
    slug: 'wash-and-fold',
    description: 'Everyday clothes washed, tumble dried, and neatly folded.',
    pricingModel: 'PER_KG',
    basePrice: 60,
    unit: 'KG',
    minOrderQuantity: 3,
    turnaroundHours: 24,
    popular: true,
    expressAvailable: true,
    image: '/images/service_wash_fold.jpg',
    imageUrl: '/images/service_wash_fold.jpg',
  },
  {
    id: 'srv-2',
    categoryId: 'cat-1',
    name: 'Wash & Steam Iron',
    slug: 'wash-and-iron',
    description: 'Hygiene wash + crisp steam press with hanger packaging.',
    pricingModel: 'PER_KG',
    basePrice: 85,
    unit: 'KG',
    minOrderQuantity: 3,
    turnaroundHours: 36,
    popular: true,
    expressAvailable: true,
    image: '/images/service_wash_iron.jpg',
    imageUrl: '/images/service_wash_iron.jpg',
  },
  {
    id: 'srv-6',
    categoryId: 'cat-1',
    name: 'Steam Ironing — Shirt / Pant',
    slug: 'steam-iron-regular',
    description: 'Industrial steam press for wrinkle-free finish.',
    pricingModel: 'PER_ITEM',
    basePrice: 20,
    unit: 'Item',
    turnaroundHours: 18,
    popular: true,
    image: '/images/service_steam_iron.jpg',
    imageUrl: '/images/service_steam_iron.jpg',
  },
  {
    id: 'srv-14',
    categoryId: 'cat-2',
    name: 'Bridal Lehenga / Heavy Gown',
    slug: 'bridal-lehenga-cleaning',
    description: 'Delicate stone hand-shielding dry clean with tissue wrap box.',
    pricingModel: 'PER_ITEM',
    basePrice: 650,
    unit: 'Set',
    turnaroundHours: 72,
    popular: true,
    image: '/images/service_dry_cleaning.jpg',
    imageUrl: '/images/service_dry_cleaning.jpg',
  },
  {
    id: 'srv-17',
    categoryId: 'cat-3',
    name: 'Heavy Blanket / Comforter / Quilt Dry Clean',
    slug: 'blanket-comforter-dry-clean',
    description: 'High-capacity drum sanitization, fluff restoration, and vacuum sealing.',
    pricingModel: 'PER_ITEM',
    basePrice: 260,
    unit: 'Item',
    turnaroundHours: 48,
    popular: true,
    image: '/images/service_wash_fold.jpg',
    imageUrl: '/images/service_wash_fold.jpg',
  },
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
          subCategory: r.sub_category || undefined,
          description: r.description,
          isActive: Boolean(r.is_active),
          sortOrder: r.sort_order,
          imageUrl: r.image_url || undefined,
        }));
      } else {
        this.clothTypes = [...INITIAL_CLOTH_TYPES];
        for (const item of this.clothTypes) {
          await pool.query(
            'INSERT INTO cloth_types (id, name, icon, category_tag, category_label, sub_category, description, is_active, sort_order, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), icon=VALUES(icon), category_tag=VALUES(category_tag), category_label=VALUES(category_label), sub_category=VALUES(sub_category), description=VALUES(description), is_active=VALUES(is_active), sort_order=VALUES(sort_order), image_url=VALUES(image_url)',
            [item.id, item.name, item.icon, item.categoryTag, item.categoryLabel, item.subCategory || null, item.description, item.isActive ? 1 : 0, item.sortOrder, item.imageUrl || null]
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
          serviceCode: r.service_code,
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
            'INSERT INTO service_masters (id, name, slug, service_code, icon, pricing_type, base_kg_price, min_order_kg, turnaround_hours, description, is_active, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), slug=VALUES(slug), service_code=VALUES(service_code), icon=VALUES(icon), pricing_type=VALUES(pricing_type), base_kg_price=VALUES(base_kg_price), min_order_kg=VALUES(min_order_kg), turnaround_hours=VALUES(turnaround_hours), description=VALUES(description), is_active=VALUES(is_active)',
            [sm.id, sm.name, sm.slug, sm.serviceCode || null, sm.icon, sm.pricingType, sm.baseKgPrice || null, sm.minOrderKg || null, sm.turnaroundHours, sm.description, sm.isActive ? 1 : 0, sm.imageUrl || null]
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
      subCategory: typeof data.subCategory === 'string' ? data.subCategory.trim() || undefined : undefined,
      description: data.description || '',
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

