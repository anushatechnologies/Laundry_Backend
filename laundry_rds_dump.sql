-- =========================================================================
-- LaundryFresh AWS RDS MySQL Complete Database Dump & Seed Script
-- Generated at: 2026-08-28T09:33:09.703Z
-- =========================================================================

CREATE DATABASE IF NOT EXISTS `laundry` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `laundry`;

-- 1. Table: categories
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  icon VARCHAR(255),
  description TEXT,
  is_popular TINYINT(1) DEFAULT 0,
  color VARCHAR(50)
);
INSERT INTO categories (id, name, slug, icon, description, is_popular, color) VALUES ('cat-1', 'Men\'s Wear', 'mens-wear', '👔', 'Shirts, T-Shirts, Trousers, Suits, Blazers, Kurtas & Jackets.', 1, 'blue') ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO categories (id, name, slug, icon, description, is_popular, color) VALUES ('cat-2', 'Women\'s Wear', 'womens-wear', '👗', 'Sarees, Kurtis, Salwar Suits, Dresses, Gowns, Dupattas & Tops.', 1, 'pink') ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO categories (id, name, slug, icon, description, is_popular, color) VALUES ('cat-3', 'Premium & Bridal Wear', 'bridal-wear', '💍', 'Bridal Lehengas, Heavy Sarees, Gowns, Sherwanis & Designer Wear.', 1, 'purple') ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO categories (id, name, slug, icon, description, is_popular, color) VALUES ('cat-4', 'Kids Wear', 'kids-wear', '👶', 'Shirts, Frocks, Uniforms, Baby Rompers & Baby Blankets.', 0, 'amber') ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO categories (id, name, slug, icon, description, is_popular, color) VALUES ('cat-5', 'Home Textiles', 'home-textiles', '🛏️', 'Bedsheets, Blankets, Comforters, Curtains, Towels & Cushion Covers.', 1, 'teal') ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO categories (id, name, slug, icon, description, is_popular, color) VALUES ('cat-6', 'Special Deep Cleaning', 'special-cleaning', '🧹', 'Mattress, Carpet, Rug, Curtain & Sofa Cover Deep Treatment.', 0, 'indigo') ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO categories (id, name, slug, icon, description, is_popular, color) VALUES ('cat-7', 'Bulk / Per-KG Laundry', 'bulk-laundry', '🧺', 'Everyday clothes, towels, bedsheets weighed per KG.', 1, 'emerald') ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO categories (id, name, slug, icon, description, is_popular, color) VALUES ('cat-8', 'Baby Care Laundry', 'baby-care', '👶', 'Gentle sanitizing wash with extra rinse for sensitive baby skin.', 0, 'cyan') ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO categories (id, name, slug, icon, description, is_popular, color) VALUES ('cat-9', 'Wedding & Couture Care', 'wedding-care', '💍', 'Special handling, hand finish, stain treatment & bridal packaging.', 0, 'rose') ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
INSERT INTO categories (id, name, slug, icon, description, is_popular, color) VALUES ('cat-10', 'Corporate & Bulk Commercial', 'corporate-laundry', '🏢', 'Hotel linen, PG laundry, gym towels, uniforms & monthly contracts.', 0, 'slate') ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- 2. Table: cloth_types
CREATE TABLE IF NOT EXISTS cloth_types (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(255),
  category_tag VARCHAR(255),
  category_label VARCHAR(255),
  description TEXT,
  image_url TEXT,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0
);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-shirt', 'Shirt', '👔', 'MENS', 'Men\'s Clothing', 'Regular casual & formal shirts', NULL, 1, 1) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-tshirt', 'T-Shirt', '👕', 'MENS', 'Men\'s Clothing', 'Polo & round-neck t-shirts', NULL, 1, 2) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-jeans', 'Jeans / Denim', '👖', 'MENS', 'Men\'s Clothing', 'Heavy denim and cotton jeans', NULL, 1, 3) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-trouser', 'Formal Trouser / Chinos', '👖', 'MENS', 'Men\'s Clothing', 'Cotton trousers, chinos & pants', NULL, 1, 4) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-kurta-m', 'Kurta (Men)', '🥻', 'MENS', 'Men\'s Clothing', 'Cotton & festive silk kurtas', NULL, 1, 5) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-blazer', 'Blazer / Coat', '🧥', 'MENS', 'Men\'s Clothing', 'Single or double-breasted formal blazer', NULL, 1, 6) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-suit-2p', 'Suit 2-Piece', '👔', 'MENS', 'Men\'s Clothing', 'Blazer + Trouser combo set', NULL, 1, 7) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-sweater', 'Sweater / Pullover', '🧶', 'MENS', 'Men\'s Clothing', 'Woolen & blended sweaters', NULL, 1, 8) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-jacket', 'Winter Jacket', '🧥', 'MENS', 'Men\'s Clothing', 'Fleece, windcheater & padded jacket', NULL, 1, 9) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-saree-reg', 'Saree (Daily / Cotton)', '🥻', 'WOMENS', 'Women\'s Clothing', 'Cotton, chiffon, georgette daily sarees', NULL, 1, 10) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-saree-silk', 'Silk Saree (Kanchipuram / Zari)', '🥻', 'WOMENS', 'Women\'s Clothing', 'Pure silk, Banarasi & embroidered zari sarees', NULL, 1, 11) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-blouse', 'Blouse', '👚', 'WOMENS', 'Women\'s Clothing', 'Padded & designer embroidered blouses', NULL, 1, 12) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-kurti', 'Kurti / Tunic', '👚', 'WOMENS', 'Women\'s Clothing', 'Casual & partywear kurtis', NULL, 1, 13) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-salwar', 'Salwar Kameez / Suit Set', '👗', 'WOMENS', 'Women\'s Clothing', '3-Piece Top, Bottom & Dupatta set', NULL, 1, 14) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-lehenga', 'Bridal / Party Lehenga', '👰', 'WOMENS', 'Women\'s Clothing', 'Heavy flared lehenga with stone & zardozi work', NULL, 1, 15) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-dress-w', 'Dress / Western Gown', '👗', 'WOMENS', 'Women\'s Clothing', 'Maxi dress, evening gowns & party dresses', NULL, 1, 16) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-kid-shirt', 'Kids Shirt / Top', '👕', 'KIDS', 'Kids Clothing', 'Infant to teenage shirts and tops', NULL, 1, 17) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-kid-pant', 'Kids Pant / Shorts', '🩳', 'KIDS', 'Kids Clothing', 'Kids denim, track pants & shorts', NULL, 1, 18) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-kid-dress', 'Kids Frock / Dress', '👗', 'KIDS', 'Kids Clothing', 'Girls dresses and party frocks', NULL, 1, 19) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-kid-uniform', 'School Uniform Set', '🎒', 'KIDS', 'Kids Clothing', 'Shirt + Skirt/Trouser with tie and badge', NULL, 1, 20) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-bedsheet-s', 'Bedsheet (Single)', '🛏️', 'HOME_TEXTILES', 'Home & Bedding', 'Single bedsheet + 1 pillow cover', NULL, 1, 21) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-bedsheet-d', 'Bedsheet (Double / King)', '🛏️', 'HOME_TEXTILES', 'Home & Bedding', 'Double/King bedsheet + 2 pillow covers', NULL, 1, 22) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-blanket', 'Blanket / Quilt (Single)', '🛋️', 'HOME_TEXTILES', 'Home & Bedding', 'Medium weight single quilt or fleece blanket', NULL, 1, 23) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-comforter', 'Heavy Comforter / Rajai (Double)', '🛋️', 'HOME_TEXTILES', 'Home & Bedding', 'Heavy double winter comforter or duvet', NULL, 1, 24) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-curtain', 'Curtains (Per Panel)', '🪟', 'HOME_TEXTILES', 'Home & Bedding', 'Window and door curtains up to 9ft', NULL, 1, 25) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-towel', 'Bath Towel', '🛁', 'HOME_TEXTILES', 'Home & Bedding', 'Plush cotton bath towels and robes', NULL, 1, 26) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-shoes-sneaker', 'Sneakers / Sports Shoes', '👟', 'FOOTWEAR', 'Footwear', 'Mesh, knit & canvas running shoes', NULL, 1, 27) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-shoes-formal', 'Formal Leather Shoes', '👞', 'FOOTWEAR', 'Footwear', 'Leather conditioning, buff & polish', NULL, 1, 28) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-bag-backpack', 'Backpack / School Bag', '🎒', 'ACCESSORIES', 'Bags & Accessories', 'Canvas & polyester laptop backpacks', NULL, 1, 29) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);
INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES ('cloth-bag-luxury', 'Luxury Handbag', '👜', 'ACCESSORIES', 'Bags & Accessories', 'Designer leather and fabric handbags', NULL, 1, 30) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);

-- 3. Table: service_masters
CREATE TABLE IF NOT EXISTS service_masters (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  icon VARCHAR(255),
  pricing_type VARCHAR(255),
  base_kg_price DECIMAL(10, 2),
  min_order_kg DECIMAL(10, 2),
  turnaround_hours INT,
  description TEXT,
  is_active TINYINT(1) DEFAULT 1
);
INSERT INTO service_masters (id, name, slug, icon, pricing_type, base_kg_price, min_order_kg, turnaround_hours, description, is_active) VALUES ('srv-m-wash-fold', 'Wash & Fold', 'wash-and-fold', '🧺', 'PER_KG', 60, 3, 24, 'Hygienic wash, tumble dry, and neat compact fold.', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), base_kg_price=VALUES(base_kg_price);
INSERT INTO service_masters (id, name, slug, icon, pricing_type, base_kg_price, min_order_kg, turnaround_hours, description, is_active) VALUES ('srv-m-wash-iron', 'Wash & Steam Iron', 'wash-and-iron', '👔', 'PER_KG', 85, 3, 36, 'Eco-wash + industrial steam pressing on hangers.', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), base_kg_price=VALUES(base_kg_price);
INSERT INTO service_masters (id, name, slug, icon, pricing_type, base_kg_price, min_order_kg, turnaround_hours, description, is_active) VALUES ('srv-m-dry-clean', 'Dry Cleaning', 'dry-cleaning', '🧥', 'PER_ITEM', NULL, NULL, 48, 'Hydrocarbon solvent treatment with breathable garment cover.', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), base_kg_price=VALUES(base_kg_price);
INSERT INTO service_masters (id, name, slug, icon, pricing_type, base_kg_price, min_order_kg, turnaround_hours, description, is_active) VALUES ('srv-m-steam-iron', 'Steam Pressing Only', 'steam-iron', '♨️', 'PER_ITEM', NULL, NULL, 18, 'High-pressure wrinkle removal with shape restoration.', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), base_kg_price=VALUES(base_kg_price);
INSERT INTO service_masters (id, name, slug, icon, pricing_type, base_kg_price, min_order_kg, turnaround_hours, description, is_active) VALUES ('srv-m-express', 'Express Emergency Laundry', 'express-emergency', '⚡', 'PER_KG', 120, 3, 12, 'Dedicated machine slot with same-day return.', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), base_kg_price=VALUES(base_kg_price);
INSERT INTO service_masters (id, name, slug, icon, pricing_type, base_kg_price, min_order_kg, turnaround_hours, description, is_active) VALUES ('srv-m-spa', 'Deep Shoe & Leather Spa', 'shoe-spa', '✨', 'PER_ITEM', NULL, NULL, 48, 'Ultrasonic stain treatment and antibacterial ozone sanitization.', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), base_kg_price=VALUES(base_kg_price);

-- 4. Table: service_price_matrix
CREATE TABLE IF NOT EXISTS service_price_matrix (
  id VARCHAR(255) PRIMARY KEY,
  cloth_type_id VARCHAR(255),
  cloth_name VARCHAR(255),
  cloth_icon VARCHAR(255),
  category_tag VARCHAR(255),
  service_id VARCHAR(255),
  service_name VARCHAR(255),
  price DECIMAL(10, 2),
  express_price DECIMAL(10, 2),
  turnaround_hours INT,
  is_active TINYINT(1) DEFAULT 1
);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-shirt-wf', 'cloth-shirt', 'Shirt', '👔', 'MENS', 'srv-m-wash-fold', 'Wash & Fold', 30, 50, 24, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-shirt-wi', 'cloth-shirt', 'Shirt', '👔', 'MENS', 'srv-m-wash-iron', 'Wash & Steam Iron', 45, 65, 36, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-shirt-dc', 'cloth-shirt', 'Shirt', '👔', 'MENS', 'srv-m-dry-clean', 'Dry Cleaning', 80, 120, 48, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-shirt-si', 'cloth-shirt', 'Shirt', '👔', 'MENS', 'srv-m-steam-iron', 'Steam Pressing Only', 20, 35, 18, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-tshirt-wf', 'cloth-tshirt', 'T-Shirt', '👕', 'MENS', 'srv-m-wash-fold', 'Wash & Fold', 25, 45, 24, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-tshirt-wi', 'cloth-tshirt', 'T-Shirt', '👕', 'MENS', 'srv-m-wash-iron', 'Wash & Steam Iron', 35, 55, 36, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-tshirt-dc', 'cloth-tshirt', 'T-Shirt', '👕', 'MENS', 'srv-m-dry-clean', 'Dry Cleaning', 60, 90, 48, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-tshirt-si', 'cloth-tshirt', 'T-Shirt', '👕', 'MENS', 'srv-m-steam-iron', 'Steam Pressing Only', 15, 25, 18, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-jeans-wf', 'cloth-jeans', 'Jeans / Denim', '👖', 'MENS', 'srv-m-wash-fold', 'Wash & Fold', 35, 55, 24, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-jeans-wi', 'cloth-jeans', 'Jeans / Denim', '👖', 'MENS', 'srv-m-wash-iron', 'Wash & Steam Iron', 50, 70, 36, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-jeans-dc', 'cloth-jeans', 'Jeans / Denim', '👖', 'MENS', 'srv-m-dry-clean', 'Dry Cleaning', 90, 130, 48, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-jeans-si', 'cloth-jeans', 'Jeans / Denim', '👖', 'MENS', 'srv-m-steam-iron', 'Steam Pressing Only', 25, 40, 18, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-trouser-wi', 'cloth-trouser', 'Formal Trouser / Chinos', '👖', 'MENS', 'srv-m-wash-iron', 'Wash & Steam Iron', 50, 70, 36, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-trouser-dc', 'cloth-trouser', 'Formal Trouser / Chinos', '👖', 'MENS', 'srv-m-dry-clean', 'Dry Cleaning', 90, 130, 48, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-trouser-si', 'cloth-trouser', 'Formal Trouser / Chinos', '👖', 'MENS', 'srv-m-steam-iron', 'Steam Pressing Only', 20, 35, 18, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-blazer-dc', 'cloth-blazer', 'Blazer / Coat', '🧥', 'MENS', 'srv-m-dry-clean', 'Dry Cleaning', 220, 320, 48, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-blazer-si', 'cloth-blazer', 'Blazer / Coat', '🧥', 'MENS', 'srv-m-steam-iron', 'Steam Pressing Only', 90, 140, 24, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-suit-dc', 'cloth-suit-2p', 'Suit 2-Piece', '👔', 'MENS', 'srv-m-dry-clean', 'Dry Cleaning', 350, 480, 48, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-suit-si', 'cloth-suit-2p', 'Suit 2-Piece', '👔', 'MENS', 'srv-m-steam-iron', 'Steam Pressing Only', 140, 200, 24, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-saree-reg-wi', 'cloth-saree-reg', 'Saree (Daily / Cotton)', '🥻', 'WOMENS', 'srv-m-wash-iron', 'Wash & Steam Iron', 90, 140, 36, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-saree-reg-dc', 'cloth-saree-reg', 'Saree (Daily / Cotton)', '🥻', 'WOMENS', 'srv-m-dry-clean', 'Dry Cleaning', 150, 220, 48, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-saree-reg-si', 'cloth-saree-reg', 'Saree (Daily / Cotton)', '🥻', 'WOMENS', 'srv-m-steam-iron', 'Steam Pressing Only', 60, 90, 24, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-saree-silk-dc', 'cloth-saree-silk', 'Silk Saree (Kanchipuram / Zari)', '🥻', 'WOMENS', 'srv-m-dry-clean', 'Dry Cleaning', 220, 320, 48, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-saree-silk-si', 'cloth-saree-silk', 'Silk Saree (Kanchipuram / Zari)', '🥻', 'WOMENS', 'srv-m-steam-iron', 'Steam Pressing Only', 80, 120, 24, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-lehenga-dc', 'cloth-lehenga', 'Bridal / Party Lehenga', '👰', 'WOMENS', 'srv-m-dry-clean', 'Dry Cleaning', 650, 900, 72, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-lehenga-si', 'cloth-lehenga', 'Bridal / Party Lehenga', '👰', 'WOMENS', 'srv-m-steam-iron', 'Steam Pressing Only', 250, 350, 36, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-kurti-wf', 'cloth-kurti', 'Kurti / Tunic', '👚', 'WOMENS', 'srv-m-wash-fold', 'Wash & Fold', 30, 50, 24, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-kurti-wi', 'cloth-kurti', 'Kurti / Tunic', '👚', 'WOMENS', 'srv-m-wash-iron', 'Wash & Steam Iron', 45, 65, 36, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-kurti-dc', 'cloth-kurti', 'Kurti / Tunic', '👚', 'WOMENS', 'srv-m-dry-clean', 'Dry Cleaning', 80, 120, 48, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-kurti-si', 'cloth-kurti', 'Kurti / Tunic', '👚', 'WOMENS', 'srv-m-steam-iron', 'Steam Pressing Only', 20, 35, 18, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-bedsheet-d-wi', 'cloth-bedsheet-d', 'Bedsheet (Double / King)', '🛏️', 'HOME_TEXTILES', 'srv-m-wash-iron', 'Wash & Steam Iron', 120, 180, 36, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-bedsheet-d-dc', 'cloth-bedsheet-d', 'Bedsheet (Double / King)', '🛏️', 'HOME_TEXTILES', 'srv-m-dry-clean', 'Dry Cleaning', 160, 240, 48, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-blanket-wf', 'cloth-blanket', 'Blanket / Quilt (Single)', '🛋️', 'HOME_TEXTILES', 'srv-m-wash-fold', 'Wash & Fold', 180, 260, 36, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-blanket-dc', 'cloth-blanket', 'Blanket / Quilt (Single)', '🛋️', 'HOME_TEXTILES', 'srv-m-dry-clean', 'Dry Cleaning', 240, 340, 48, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-comforter-dc', 'cloth-comforter', 'Heavy Comforter / Rajai (Double)', '🛋️', 'HOME_TEXTILES', 'srv-m-dry-clean', 'Dry Cleaning', 320, 450, 48, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-sneakers-spa', 'cloth-shoes-sneaker', 'Sneakers / Sports Shoes', '👟', 'FOOTWEAR', 'srv-m-spa', 'Deep Shoe & Leather Spa', 250, 350, 48, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-backpack-spa', 'cloth-bag-backpack', 'Backpack / School Bag', '🎒', 'ACCESSORIES', 'srv-m-spa', 'Deep Shoe & Leather Spa', 180, 260, 48, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);
INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES ('pr-handbag-spa', 'cloth-bag-luxury', 'Luxury Handbag', '👜', 'ACCESSORIES', 'srv-m-spa', 'Deep Shoe & Leather Spa', 490, 690, 72, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);

-- 5. Table: pricing_settings
CREATE TABLE IF NOT EXISTS pricing_settings (
  id INT PRIMARY KEY,
  tax_percentage DECIMAL(5, 2),
  min_order_value DECIMAL(10, 2),
  free_delivery_threshold DECIMAL(10, 2),
  standard_delivery_fee DECIMAL(10, 2),
  express_delivery_fee DECIMAL(10, 2),
  extra_kg_price DECIMAL(10, 2)
);
INSERT INTO pricing_settings (id, tax_percentage, min_order_value, free_delivery_threshold, standard_delivery_fee, express_delivery_fee, extra_kg_price) VALUES (1, 5, 299, 499, 30, 80, 40) ON DUPLICATE KEY UPDATE tax_percentage=VALUES(tax_percentage), free_delivery_threshold=VALUES(free_delivery_threshold);

-- 6. Table: services
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(255) PRIMARY KEY,
  category_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  pricing_model VARCHAR(255),
  base_price DECIMAL(10, 2),
  unit VARCHAR(255),
  min_order_quantity DECIMAL(10, 2),
  turnaround_hours INT,
  popular TINYINT(1) DEFAULT 0,
  express_available TINYINT(1) DEFAULT 0
);
INSERT INTO services (id, category_id, name, slug, description, pricing_model, base_price, unit, min_order_quantity, turnaround_hours, popular, express_available) VALUES ('srv-1', 'cat-1', 'Wash & Fold (Standard)', 'wash-and-fold', 'Everyday clothes washed, tumble dried, and neatly folded.', 'PER_KG', 60, 'KG', 3, 24, 1, 1) ON DUPLICATE KEY UPDATE base_price=VALUES(base_price);
INSERT INTO services (id, category_id, name, slug, description, pricing_model, base_price, unit, min_order_quantity, turnaround_hours, popular, express_available) VALUES ('srv-2', 'cat-1', 'Wash & Steam Iron', 'wash-and-iron', 'Hygiene wash + crisp steam press with hanger packaging.', 'PER_KG', 85, 'KG', 3, 36, 1, 1) ON DUPLICATE KEY UPDATE base_price=VALUES(base_price);
INSERT INTO services (id, category_id, name, slug, description, pricing_model, base_price, unit, min_order_quantity, turnaround_hours, popular, express_available) VALUES ('srv-6', 'cat-2', 'Steam Ironing — Shirt / Pant', 'steam-iron-regular', 'Industrial steam press for wrinkle-free finish.', 'PER_ITEM', 15, 'Item', NULL, 18, 1, 0) ON DUPLICATE KEY UPDATE base_price=VALUES(base_price);
INSERT INTO services (id, category_id, name, slug, description, pricing_model, base_price, unit, min_order_quantity, turnaround_hours, popular, express_available) VALUES ('srv-10', 'cat-3', 'Dry Clean — Formal Shirt / Top', 'dry-clean-shirt', 'Collar stain scrub, hydrocarbon solvent clean.', 'PER_ITEM', 80, 'Item', NULL, 48, 1, 0) ON DUPLICATE KEY UPDATE base_price=VALUES(base_price);
INSERT INTO services (id, category_id, name, slug, description, pricing_model, base_price, unit, min_order_quantity, turnaround_hours, popular, express_available) VALUES ('srv-11', 'cat-3', 'Dry Clean — 2-Piece Suit / Blazer', 'dry-clean-suit', 'Multi-stage gentle dry clean with breathable cover.', 'PER_ITEM', 280, 'Item', NULL, 48, 1, 0) ON DUPLICATE KEY UPDATE base_price=VALUES(base_price);
INSERT INTO services (id, category_id, name, slug, description, pricing_model, base_price, unit, min_order_quantity, turnaround_hours, popular, express_available) VALUES ('srv-14', 'cat-4', 'Bridal Lehenga / Heavy Gown', 'bridal-lehenga-cleaning', 'Delicate stone hand-shielding dry clean with tissue wrap box.', 'PER_ITEM', 650, 'Set', NULL, 72, 1, 0) ON DUPLICATE KEY UPDATE base_price=VALUES(base_price);

-- 7. Table: coupons
CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(255) PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255),
  description TEXT,
  discount_type VARCHAR(50),
  discount_value DECIMAL(10, 2),
  min_order_value DECIMAL(10, 2),
  max_discount_cap DECIMAL(10, 2),
  first_order_only TINYINT(1) DEFAULT 0,
  expiry_date VARCHAR(50),
  usage_count INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1
);
INSERT INTO coupons (id, code, title, description, discount_type, discount_value, min_order_value, max_discount_cap, first_order_only, expiry_date, usage_count, is_active) VALUES ('cp-1', 'WELCOME100', 'Flat ₹100 Off First Order', 'Flat ₹100 discount above ₹299', 'FLAT', 100, 299, NULL, 1, '2026-12-31', 1420, 1) ON DUPLICATE KEY UPDATE code=VALUES(code);
INSERT INTO coupons (id, code, title, description, discount_type, discount_value, min_order_value, max_discount_cap, first_order_only, expiry_date, usage_count, is_active) VALUES ('cp-2', 'WEEKEND20', '20% Weekend Savings', 'Save 20% up to ₹150', 'PERCENTAGE', 20, 350, 150, 0, '2026-12-31', 654, 1) ON DUPLICATE KEY UPDATE code=VALUES(code);
INSERT INTO coupons (id, code, title, description, discount_type, discount_value, min_order_value, max_discount_cap, first_order_only, expiry_date, usage_count, is_active) VALUES ('cp-promo-1', 'BUY5GET3', 'Buy 5kg Get 3kg FREE', 'Order 5kg or more laundry and get 3kg absolutely free! Perfect for weekly family loads.', 'PERCENTAGE', 37.5, 500, 300, 0, '2027-03-31', 0, 1) ON DUPLICATE KEY UPDATE code=VALUES(code);
INSERT INTO coupons (id, code, title, description, discount_type, discount_value, min_order_value, max_discount_cap, first_order_only, expiry_date, usage_count, is_active) VALUES ('cp-promo-2', 'WASH10GET2', 'Wash 10kg Get 2kg FREE', 'Order 10kg wash service and get 2kg free! Save up to ₹200 on bulk orders.', 'PERCENTAGE', 16.7, 1000, 200, 0, '2027-03-31', 0, 1) ON DUPLICATE KEY UPDATE code=VALUES(code);
INSERT INTO coupons (id, code, title, description, discount_type, discount_value, min_order_value, max_discount_cap, first_order_only, expiry_date, usage_count, is_active) VALUES ('cp-promo-3', 'DRYCLEAN30', '30% Off Dry Cleaning', 'Get 30% off on all dry cleaning services. Valid on suits, sarees, and formal wear.', 'PERCENTAGE', 30, 400, 250, 0, '2027-03-31', 0, 1) ON DUPLICATE KEY UPDATE code=VALUES(code);
INSERT INTO coupons (id, code, title, description, discount_type, discount_value, min_order_value, max_discount_cap, first_order_only, expiry_date, usage_count, is_active) VALUES ('cp-promo-4', 'EXPRESS50', '₹50 Off Express Service', 'Flat ₹50 discount on 2-hour express delivery. For urgent laundry needs.', 'FLAT', 50, 300, NULL, 0, '2027-03-31', 0, 1) ON DUPLICATE KEY UPDATE code=VALUES(code);

-- 8. Table: pincodes
CREATE TABLE IF NOT EXISTS pincodes (
  pincode VARCHAR(20) PRIMARY KEY,
  area_name VARCHAR(255),
  city VARCHAR(255),
  is_serviceable TINYINT(1) DEFAULT 1,
  standard_fee DECIMAL(10, 2),
  min_free_order_value DECIMAL(10, 2),
  express_available TINYINT(1) DEFAULT 1,
  average_turnaround_hours INT
);
INSERT INTO pincodes (pincode, area_name, city, is_serviceable, standard_fee, min_free_order_value, express_available, average_turnaround_hours) VALUES ('560001', 'MG Road / CBD', 'Bengaluru', 1, 40, 399, 1, 24) ON DUPLICATE KEY UPDATE area_name=VALUES(area_name);
INSERT INTO pincodes (pincode, area_name, city, is_serviceable, standard_fee, min_free_order_value, express_available, average_turnaround_hours) VALUES ('560034', 'Koramangala 4th-8th Block', 'Bengaluru', 1, 40, 399, 1, 24) ON DUPLICATE KEY UPDATE area_name=VALUES(area_name);
INSERT INTO pincodes (pincode, area_name, city, is_serviceable, standard_fee, min_free_order_value, express_available, average_turnaround_hours) VALUES ('560102', 'HSR Layout Sector 1-7', 'Bengaluru', 1, 40, 399, 1, 24) ON DUPLICATE KEY UPDATE area_name=VALUES(area_name);
INSERT INTO pincodes (pincode, area_name, city, is_serviceable, standard_fee, min_free_order_value, express_available, average_turnaround_hours) VALUES ('560103', 'Bellandur / ORR', 'Bengaluru', 1, 50, 499, 1, 24) ON DUPLICATE KEY UPDATE area_name=VALUES(area_name);

-- 9. Table: staff
CREATE TABLE IF NOT EXISTS staff (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(100),
  role VARCHAR(100),
  assigned_facility VARCHAR(255),
  assigned_zone VARCHAR(255),
  is_active TINYINT(1) DEFAULT 1,
  rating DECIMAL(3, 2),
  orders_processed INT DEFAULT 0
);
INSERT INTO staff (id, name, email, phone, role, assigned_facility, assigned_zone, is_active, rating, orders_processed) VALUES ('stf-1', 'Rajesh Kumar', 'rajesh.admin@laundryfresh.com', '+91 98765 43210', 'SUPER_ADMIN', 'Central Hub - Koramangala', NULL, 1, NULL, 0) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO staff (id, name, email, phone, role, assigned_facility, assigned_zone, is_active, rating, orders_processed) VALUES ('stf-4', 'Vikram Singh (Pickup Agent)', 'vikram.rider@laundryfresh.com', '+91 98450 11223', 'PICKUP_AGENT', NULL, 'HSR & Koramangala Zone', 1, 4.9, 320) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO staff (id, name, email, phone, role, assigned_facility, assigned_zone, is_active, rating, orders_processed) VALUES ('stf-5', 'Suresh Patil (Delivery Agent)', 'suresh.rider@laundryfresh.com', '+91 98450 44556', 'DELIVERY_AGENT', NULL, 'Indiranagar & CBD Zone', 1, 4.85, 275) ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 10. Table: subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  slug VARCHAR(255),
  duration_months INT,
  price DECIMAL(10, 2),
  original_price DECIMAL(10, 2),
  validity_days INT,
  included_kg DECIMAL(10, 2),
  free_pickup_delivery TINYINT(1) DEFAULT 1,
  priority_service TINYINT(1) DEFAULT 0,
  max_family_members INT DEFAULT 1,
  features JSON,
  popular TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1
);
INSERT INTO subscriptions (id, name, slug, duration_months, price, original_price, validity_days, included_kg, free_pickup_delivery, priority_service, max_family_members, features, popular, is_active) VALUES ('sub-basic-1m', 'Basic Plan (1 Month)', 'basic-1m', 1, 999, 1299, 30, 20, 1, 0, 1, '["20 KG Wash & Fold / Wash & Iron per month","Free Doorstep Pickup & Delivery","Turnaround in 36 Hours","Rollover unused KG (up to 5 KG)","Standard eco-detergents & softeners"]', 0, 1) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO subscriptions (id, name, slug, duration_months, price, original_price, validity_days, included_kg, free_pickup_delivery, priority_service, max_family_members, features, popular, is_active) VALUES ('sub-premium-1m', 'Premium Plan (1 Month)', 'premium-1m', 1, 1999, 2499, 30, 50, 1, 1, 2, '["50 KG Wash & Fold / Steam Iron per month","Free Priority Pickup & Delivery","Fast 24-Hour Express Turnaround","Rollover unused KG (up to 15 KG)","1 Free Blazer/Saree Dry Clean / month","Antibacterial sanitization wash"]', 1, 1) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO subscriptions (id, name, slug, duration_months, price, original_price, validity_days, included_kg, free_pickup_delivery, priority_service, max_family_members, features, popular, is_active) VALUES ('sub-family-3m', 'Quarterly Family Saver (3 Months)', 'family-3m', 3, 4999, 6999, 90, 150, 1, 1, 4, '["150 KG Total Allowance (50 KG / Month)","Save ₹2,000 on quarterly commitment","VIP Priority Slots & 12h Emergency Express","Free pickup & delivery up to 24 visits","3 Free Dry Clean vouchers included","Dedicated Customer Support Concierge"]', 1, 1) ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO subscriptions (id, name, slug, duration_months, price, original_price, validity_days, included_kg, free_pickup_delivery, priority_service, max_family_members, features, popular, is_active) VALUES ('sub-annual-12m', 'Annual Ultimate Care (12 Months)', 'annual-12m', 12, 14999, 23999, 365, 600, 1, 1, 5, '["600 KG Total Allowance (50 KG / Month)","Save ₹9,000 with Annual Plan","Unlimited KG rollover across full year","Free Shoe & Handbag Spa included","10 Free Heavy Blanket Dry Clean vouchers","Dedicated Household Manager"]', 0, 1) ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 11. Table: orders
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  customer_id VARCHAR(255),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(255),
  address JSON,
  items JSON,
  pricing_model_summary VARCHAR(255),
  express_tier VARCHAR(255),
  pickup_slot JSON,
  delivery_slot JSON,
  pickup_otp VARCHAR(50),
  delivery_otp VARCHAR(50),
  bag_tag_code VARCHAR(100),
  current_status VARCHAR(100),
  status_history JSON,
  is_weighed TINYINT(1) DEFAULT 0,
  actual_weight_kg DECIMAL(10, 2),
  item_total DECIMAL(10, 2),
  discount_amount DECIMAL(10, 2),
  coupon_code VARCHAR(100),
  pickup_delivery_fee DECIMAL(10, 2),
  express_fee DECIMAL(10, 2),
  tax_amount DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  payment_method VARCHAR(100),
  payment_status VARCHAR(100),
  payment_transaction_id VARCHAR(255),
  payment_gateway_order_id VARCHAR(255),
  created_at VARCHAR(100),
  updated_at VARCHAR(100)
);

