import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { db } from '../src/lib/db';

dotenv.config();

const RDS_CONFIG = {
  host: process.env.DB_HOST || 'laundry.cls6amm8u5az.ap-south-2.rds.amazonaws.com',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'Anjibabu2244',
  database: process.env.DB_NAME || 'laundry',
};

function escapeSql(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

export async function generateSqlDump(): Promise<string> {
  let sql = '-- =========================================================================\n';
  sql += '-- LaundryFresh AWS RDS MySQL Complete Database Dump & Seed Script\n';
  sql += `-- Generated at: ${new Date().toISOString()}\n`;
  sql += '-- =========================================================================\n\n';
  sql += 'CREATE DATABASE IF NOT EXISTS `laundry` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n';
  sql += 'USE `laundry`;\n\n';

  // 1. Categories
  sql += '-- 1. Table: categories\n';
  sql += `CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  icon VARCHAR(255),
  description TEXT,
  is_popular TINYINT(1) DEFAULT 0,
  color VARCHAR(50)
);\n`;

  const categories = db.getCategories() || [];
  for (const c of categories) {
    sql += `INSERT INTO categories (id, name, slug, icon, description, is_popular, color) VALUES (${escapeSql(c.id)}, ${escapeSql(c.name)}, ${escapeSql(c.slug)}, ${escapeSql(c.icon)}, ${escapeSql(c.description)}, ${c.isPopular ? 1 : 0}, ${escapeSql(c.color)}) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);\n`;
  }
  sql += '\n';

  // 2. Cloth Types
  sql += '-- 2. Table: cloth_types\n';
  sql += `CREATE TABLE IF NOT EXISTS cloth_types (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(255),
  category_tag VARCHAR(255),
  category_label VARCHAR(255),
  description TEXT,
  image_url TEXT,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0
);\n`;

  const clothTypes = db.getClothTypes() || [];
  for (const c of clothTypes) {
    sql += `INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, image_url, is_active, sort_order) VALUES (${escapeSql(c.id)}, ${escapeSql(c.name)}, ${escapeSql(c.icon)}, ${escapeSql(c.categoryTag)}, ${escapeSql(c.categoryLabel)}, ${escapeSql(c.description)}, ${escapeSql(c.imageUrl)}, ${c.isActive ? 1 : 0}, ${c.sortOrder || 0}) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url);\n`;
  }
  sql += '\n';

  // 3. Service Masters
  sql += '-- 3. Table: service_masters\n';
  sql += `CREATE TABLE IF NOT EXISTS service_masters (
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
);\n`;

  const serviceMasters = db.getServiceMasters() || [];
  for (const s of serviceMasters) {
    sql += `INSERT INTO service_masters (id, name, slug, icon, pricing_type, base_kg_price, min_order_kg, turnaround_hours, description, is_active) VALUES (${escapeSql(s.id)}, ${escapeSql(s.name)}, ${escapeSql(s.slug)}, ${escapeSql(s.icon)}, ${escapeSql(s.pricingType)}, ${s.baseKgPrice || 'NULL'}, ${s.minOrderKg || 'NULL'}, ${s.turnaroundHours || 24}, ${escapeSql(s.description)}, ${s.isActive ? 1 : 0}) ON DUPLICATE KEY UPDATE name=VALUES(name), base_kg_price=VALUES(base_kg_price);\n`;
  }
  sql += '\n';

  // 4. Service Price Matrix
  sql += '-- 4. Table: service_price_matrix\n';
  sql += `CREATE TABLE IF NOT EXISTS service_price_matrix (
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
);\n`;

  const priceMatrix = db.getPriceMatrix() || [];
  for (const p of priceMatrix) {
    sql += `INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES (${escapeSql(p.id)}, ${escapeSql(p.clothTypeId)}, ${escapeSql(p.clothName)}, ${escapeSql(p.clothIcon)}, ${escapeSql(p.categoryTag)}, ${escapeSql(p.serviceId)}, ${escapeSql(p.serviceName)}, ${p.price}, ${p.expressPrice || 'NULL'}, ${p.turnaroundHours || 24}, ${p.isActive ? 1 : 0}) ON DUPLICATE KEY UPDATE price=VALUES(price), express_price=VALUES(express_price);\n`;
  }
  sql += '\n';

  // 5. Pricing Settings
  sql += '-- 5. Table: pricing_settings\n';
  sql += `CREATE TABLE IF NOT EXISTS pricing_settings (
  id INT PRIMARY KEY,
  tax_percentage DECIMAL(5, 2),
  min_order_value DECIMAL(10, 2),
  free_delivery_threshold DECIMAL(10, 2),
  standard_delivery_fee DECIMAL(10, 2),
  express_delivery_fee DECIMAL(10, 2),
  extra_kg_price DECIMAL(10, 2)
);\n`;

  const ps = db.getPricingSettings() || { taxPercentage: 18, minOrderValue: 200, freeDeliveryThreshold: 499, standardDeliveryFee: 49, expressDeliveryFee: 99, extraKgPrice: 60 };
  sql += `INSERT INTO pricing_settings (id, tax_percentage, min_order_value, free_delivery_threshold, standard_delivery_fee, express_delivery_fee, extra_kg_price) VALUES (1, ${ps.taxPercentage}, ${ps.minOrderValue}, ${ps.freeDeliveryThreshold}, ${ps.standardDeliveryFee}, ${ps.expressDeliveryFee}, ${ps.extraKgPrice}) ON DUPLICATE KEY UPDATE tax_percentage=VALUES(tax_percentage), free_delivery_threshold=VALUES(free_delivery_threshold);\n\n`;

  // 6. Services
  sql += '-- 6. Table: services\n';
  sql += `CREATE TABLE IF NOT EXISTS services (
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
);\n`;

  const services = db.getServices() || [];
  for (const s of services) {
    sql += `INSERT INTO services (id, category_id, name, slug, description, pricing_model, base_price, unit, min_order_quantity, turnaround_hours, popular, express_available) VALUES (${escapeSql(s.id)}, ${escapeSql(s.categoryId)}, ${escapeSql(s.name)}, ${escapeSql(s.slug)}, ${escapeSql(s.description)}, ${escapeSql(s.pricingModel)}, ${s.basePrice}, ${escapeSql(s.unit)}, ${s.minOrderQuantity || 'NULL'}, ${s.turnaroundHours || 24}, ${s.popular ? 1 : 0}, ${s.expressAvailable ? 1 : 0}) ON DUPLICATE KEY UPDATE base_price=VALUES(base_price);\n`;
  }
  sql += '\n';

  // 7. Coupons
  sql += '-- 7. Table: coupons\n';
  sql += `CREATE TABLE IF NOT EXISTS coupons (
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
);\n`;

  const coupons = db.getCoupons() || [];
  for (const c of coupons) {
    sql += `INSERT INTO coupons (id, code, title, description, discount_type, discount_value, min_order_value, max_discount_cap, first_order_only, expiry_date, usage_count, is_active) VALUES (${escapeSql(c.id)}, ${escapeSql(c.code)}, ${escapeSql(c.title)}, ${escapeSql(c.description)}, ${escapeSql(c.discountType)}, ${c.discountValue}, ${c.minOrderValue}, ${c.maxDiscountCap || 'NULL'}, ${c.firstOrderOnly ? 1 : 0}, ${escapeSql(c.expiryDate)}, ${c.usageCount || 0}, ${c.isActive ? 1 : 0}) ON DUPLICATE KEY UPDATE code=VALUES(code);\n`;
  }
  sql += '\n';

  // 8. Pincodes
  sql += '-- 8. Table: pincodes\n';
  sql += `CREATE TABLE IF NOT EXISTS pincodes (
  pincode VARCHAR(20) PRIMARY KEY,
  area_name VARCHAR(255),
  city VARCHAR(255),
  is_serviceable TINYINT(1) DEFAULT 1,
  standard_fee DECIMAL(10, 2),
  min_free_order_value DECIMAL(10, 2),
  express_available TINYINT(1) DEFAULT 1,
  average_turnaround_hours INT
);\n`;

  const pincodes = db.getPincodes() || [];
  for (const p of pincodes) {
    sql += `INSERT INTO pincodes (pincode, area_name, city, is_serviceable, standard_fee, min_free_order_value, express_available, average_turnaround_hours) VALUES (${escapeSql(p.pincode)}, ${escapeSql(p.areaName)}, ${escapeSql(p.city)}, ${p.isServiceable ? 1 : 0}, ${p.standardFee}, ${p.minFreeOrderValue}, ${p.expressAvailable ? 1 : 0}, ${p.averageTurnaroundHours || 24}) ON DUPLICATE KEY UPDATE area_name=VALUES(area_name);\n`;
  }
  sql += '\n';

  // 9. Staff
  sql += '-- 9. Table: staff\n';
  sql += `CREATE TABLE IF NOT EXISTS staff (
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
);\n`;

  const staff = db.getStaff() || [];
  for (const s of staff) {
    sql += `INSERT INTO staff (id, name, email, phone, role, assigned_facility, assigned_zone, is_active, rating, orders_processed) VALUES (${escapeSql(s.id)}, ${escapeSql(s.name)}, ${escapeSql(s.email)}, ${escapeSql(s.phone)}, ${escapeSql(s.role)}, ${escapeSql(s.assignedFacility)}, ${escapeSql(s.assignedZone)}, ${s.isActive ? 1 : 0}, ${s.rating || 'NULL'}, ${s.ordersProcessed || 0}) ON DUPLICATE KEY UPDATE name=VALUES(name);\n`;
  }
  sql += '\n';

  // 10. Subscriptions
  sql += '-- 10. Table: subscriptions\n';
  sql += `CREATE TABLE IF NOT EXISTS subscriptions (
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
);\n`;

  const subs = db.getSubscriptionPlans() || [];
  for (const s of subs) {
    sql += `INSERT INTO subscriptions (id, name, slug, duration_months, price, original_price, validity_days, included_kg, free_pickup_delivery, priority_service, max_family_members, features, popular, is_active) VALUES (${escapeSql(s.id)}, ${escapeSql(s.name)}, ${escapeSql(s.slug)}, ${s.durationMonths || 1}, ${s.price}, ${s.originalPrice || 'NULL'}, ${s.validityDays || 30}, ${s.includedKg || 20}, ${s.freePickupDelivery ? 1 : 0}, ${s.priorityService ? 1 : 0}, ${s.maxFamilyMembers || 1}, ${escapeSql(JSON.stringify(s.features || []))}, ${s.popular ? 1 : 0}, ${s.isActive ? 1 : 0}) ON DUPLICATE KEY UPDATE name=VALUES(name);\n`;
  }
  sql += '\n';

  // 11. Orders
  sql += '-- 11. Table: orders\n';
  sql += `CREATE TABLE IF NOT EXISTS orders (
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
);\n\n`;

  return sql;
}

export async function migrateToAwsRds() {
  console.log('---------------------------------------------------------');
  console.log('🚀 LaundryFresh AWS RDS MySQL Migration');
  console.log(`Endpoint: ${RDS_CONFIG.host}:${RDS_CONFIG.port}`);
  console.log(`User: ${RDS_CONFIG.user}`);
  console.log(`Database: ${RDS_CONFIG.database}`);
  console.log('---------------------------------------------------------');

  const sqlDump = await generateSqlDump();
  const dumpPath = path.join(__dirname, '..', 'laundry_rds_dump.sql');
  fs.writeFileSync(dumpPath, sqlDump, 'utf8');
  console.log(`💾 SQL dump saved to: ${dumpPath} (${(sqlDump.length / 1024).toFixed(1)} KB)`);

  try {
    console.log('Attempting live TCP connection to AWS RDS MySQL...');
    const rootConn = await mysql.createConnection({
      host: RDS_CONFIG.host,
      port: RDS_CONFIG.port,
      user: RDS_CONFIG.user,
      password: RDS_CONFIG.password,
      connectTimeout: 8000,
      multipleStatements: true,
      ssl: { rejectUnauthorized: false },
    });

    console.log('✅ Connected to AWS RDS MySQL instance successfully!');
    console.log('Executing database schema and seed insertion statements...');
    await rootConn.query(sqlDump);
    console.log('🎉 All tables and initial catalog data have been pushed to AWS RDS MySQL!');
    await rootConn.end();
  } catch (err: any) {
    console.warn('⚠️ Direct connection note:', err.message);
  }
}

if (require.main === module) {
  migrateToAwsRds().then(() => process.exit(0)).catch((err) => {
    console.error('Migration error:', err);
    process.exit(1);
  });
}
