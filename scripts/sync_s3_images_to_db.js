const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME || 'laundry-storage-2026';
const S3_REGION = process.env.AWS_REGION || 'ap-south-1';
const S3_BASE = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

const CLOTH_S3_IMAGES = [
  { id: 'cloth-shirt', s3: `${S3_BASE}/garments/shirt.jpg` },
  { id: 'cloth-tshirt', s3: `${S3_BASE}/garments/tshirt.jpg` },
  { id: 'cloth-jeans', s3: `${S3_BASE}/garments/jeans.jpg` },
  { id: 'cloth-trouser', s3: `${S3_BASE}/garments/trouser.svg` },
  { id: 'cloth-kurta-m', s3: `${S3_BASE}/garments/kurta.svg` },
  { id: 'cloth-blazer', s3: `${S3_BASE}/garments/blazer.svg` },
  { id: 'cloth-suit-2p', s3: `${S3_BASE}/garments/suit.jpg` },
  { id: 'cloth-sweater', s3: `${S3_BASE}/garments/sweater.svg` },
  { id: 'cloth-jacket', s3: `${S3_BASE}/garments/jacket.svg` },
  { id: 'cloth-saree-reg', s3: `${S3_BASE}/garments/saree_cotton.svg` },
  { id: 'cloth-saree-silk', s3: `${S3_BASE}/garments/saree.jpg` },
  { id: 'cloth-blouse', s3: `${S3_BASE}/garments/blouse.svg` },
  { id: 'cloth-kurti', s3: `${S3_BASE}/garments/kurti.jpg` },
  { id: 'cloth-salwar', s3: `${S3_BASE}/garments/salwar.svg` },
  { id: 'cloth-lehenga', s3: `${S3_BASE}/garments/lehenga.jpg` },
  { id: 'cloth-dress-w', s3: `${S3_BASE}/garments/gown.svg` },
  { id: 'cloth-kid-shirt', s3: `${S3_BASE}/garments/kid_shirt.svg` },
  { id: 'cloth-kid-pant', s3: `${S3_BASE}/garments/kid_pant.svg` },
  { id: 'cloth-kid-dress', s3: `${S3_BASE}/garments/kid_dress.svg` },
  { id: 'cloth-kid-uniform', s3: `${S3_BASE}/garments/uniform.svg` },
  { id: 'cloth-bedsheet-s', s3: `${S3_BASE}/garments/bedsheet.jpg` },
  { id: 'cloth-bedsheet-d', s3: `${S3_BASE}/garments/bedsheet.jpg` },
  { id: 'cloth-blanket', s3: `${S3_BASE}/garments/blanket.svg` },
  { id: 'cloth-comforter', s3: `${S3_BASE}/garments/comforter.svg` },
  { id: 'cloth-curtain', s3: `${S3_BASE}/garments/curtains.svg` },
  { id: 'cloth-towel', s3: `${S3_BASE}/garments/towel.svg` },
  { id: 'cloth-shoes-sneaker', s3: `${S3_BASE}/garments/sneakers.jpg` },
  { id: 'cloth-shoes-formal', s3: `${S3_BASE}/garments/formal_shoes.svg` },
  { id: 'cloth-bag-backpack', s3: `${S3_BASE}/garments/backpack.svg` },
  { id: 'cloth-bag-luxury', s3: `${S3_BASE}/garments/handbag.jpg` },
];

const SERVICE_MASTER_S3_IMAGES = [
  { id: 'srv-m-wash-fold', s3: `${S3_BASE}/services/service_wash_fold.jpg` },
  { id: 'srv-m-wash-iron', s3: `${S3_BASE}/services/service_wash_iron.jpg` },
  { id: 'srv-m-dry-clean', s3: `${S3_BASE}/services/service_dry_cleaning.jpg` },
  { id: 'srv-m-steam-iron', s3: `${S3_BASE}/services/service_steam_press.jpg` },
  { id: 'srv-m-express', s3: `${S3_BASE}/services/delivery_van_driver.jpg` },
  { id: 'srv-m-spa', s3: `${S3_BASE}/services/service_shoe_clean.jpg` },
];

const SERVICES_S3_IMAGES = [
  { id: 'srv-wash-fold', s3: `${S3_BASE}/services/service_wash_fold.jpg` },
  { id: 'srv-wash-iron', s3: `${S3_BASE}/services/service_wash_iron.jpg` },
  { id: 'srv-dry-clean', s3: `${S3_BASE}/services/service_dry_cleaning.jpg` },
  { id: 'srv-steam-iron', s3: `${S3_BASE}/services/service_steam_press.jpg` },
  { id: 'srv-home-textiles', s3: `${S3_BASE}/services/service_home_textiles.jpg` },
  { id: 'srv-shoe-clean', s3: `${S3_BASE}/services/service_shoe_clean.jpg` },
  { id: 'srv-leather-care', s3: `${S3_BASE}/services/service_shoe_clean.jpg` },
  { id: 'srv-curtain-wash', s3: `${S3_BASE}/services/service_home_textiles.jpg` },
  { id: 'srv-express-wash', s3: `${S3_BASE}/services/delivery_van_driver.jpg` },
  { id: 'srv-sanitization', s3: `${S3_BASE}/services/service_wash_fold.jpg` },
  { id: 'srv-pet-hair', s3: `${S3_BASE}/services/service_wash_fold.jpg` },
  { id: 'srv-stain-removal', s3: `${S3_BASE}/services/service_dry_cleaning.jpg` },
];

const CATEGORIES_S3_IMAGES = [
  { id: 'cat-mens-wear', s3: `${S3_BASE}/garments/shirt.jpg` },
  { id: 'cat-womens-wear', s3: `${S3_BASE}/garments/saree.jpg` },
  { id: 'cat-kids-wear', s3: `${S3_BASE}/garments/kid_dress.svg` },
  { id: 'cat-home-textiles', s3: `${S3_BASE}/garments/bedsheet.jpg` },
  { id: 'cat-footwear-leather', s3: `${S3_BASE}/garments/sneakers.jpg` },
  { id: 'cat-dry-cleaning', s3: `${S3_BASE}/services/service_dry_cleaning.jpg` },
  { id: 'cat-steam-ironing', s3: `${S3_BASE}/services/service_steam_press.jpg` },
  { id: 'cat-express-service', s3: `${S3_BASE}/services/delivery_van_driver.jpg` },
  { id: 'cat-winter-wear', s3: `${S3_BASE}/garments/jacket.svg` },
  { id: 'cat-wedding-couture', s3: `${S3_BASE}/garments/lehenga.jpg` },
  { id: 'cat-curtain-cleaning', s3: `${S3_BASE}/garments/curtains.svg` },
  { id: 'cat-subscription-plans', s3: `${S3_BASE}/services/promo_gift_box.jpg` },
  { id: 'cat-commercial-b2b', s3: `${S3_BASE}/services/hero_washing_machine.jpg` },
  { id: 'cat-accessories', s3: `${S3_BASE}/garments/handbag.jpg` },
];

async function updateAllS3UrlsInDatabase() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '2395',
    database: process.env.DB_NAME || 'laundry',
    port: Number(process.env.DB_PORT) || 3306,
  });

  console.log(`Updating all database image URLs to AWS S3 bucket: ${S3_BASE}...`);

  for (const item of CLOTH_S3_IMAGES) {
    await c.query('UPDATE cloth_types SET image_url = ? WHERE id = ?', [item.s3, item.id]);
  }
  console.log(`[OK] Updated ${CLOTH_S3_IMAGES.length} cloth_types to unique AWS S3 URLs`);

  for (const item of SERVICE_MASTER_S3_IMAGES) {
    await c.query('UPDATE service_masters SET image_url = ? WHERE id = ?', [item.s3, item.id]);
  }
  console.log(`[OK] Updated ${SERVICE_MASTER_S3_IMAGES.length} service_masters to AWS S3 URLs`);

  for (const item of SERVICES_S3_IMAGES) {
    await c.query('UPDATE services SET image_url = ? WHERE id = ?', [item.s3, item.id]);
  }
  console.log(`[OK] Updated ${SERVICES_S3_IMAGES.length} services to AWS S3 URLs`);

  for (const item of CATEGORIES_S3_IMAGES) {
    await c.query('UPDATE categories SET image_url = ? WHERE id = ?', [item.s3, item.id]);
  }
  console.log(`[OK] Updated ${CATEGORIES_S3_IMAGES.length} categories to AWS S3 URLs`);

  await c.end();
}

updateAllS3UrlsInDatabase().catch(console.error);
