import mysql, { type Pool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.DB_HOST?.trim();
const dbUser = process.env.DB_USER?.trim();
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME?.trim();
const dbPort = Number(process.env.DB_PORT || 3306);

export let pool: Pool | undefined;
export let isDbConnected = false;

type InitialData = {
  categories: any[];
  clothTypes: any[];
  serviceMasters: any[];
  priceMatrix: any[];
  pricingSettings: any;
  services: any[];
  orders: any[];
  coupons: any[];
  pincodes: any[];
  staff: any[];
};

function connectionOptions(includeDatabase = false) {
  if (!dbHost || !dbUser || !dbName) return null;

  return {
    host: dbHost,
    user: dbUser,
    port: Number.isFinite(dbPort) ? dbPort : 3306,
    ...(dbPassword !== undefined ? { password: dbPassword } : {}),
    ...(includeDatabase ? { database: dbName } : {}),
  };
}

/**
 * MySQL is optional in local development. When no explicit database settings
 * are supplied, the API uses its in-memory repository rather than guessing or
 * embedding credentials.
 */
export async function initDb(initialData: InitialData) {
  const rootOptions = connectionOptions(false);
  const databaseOptions = connectionOptions(true);

  if (!rootOptions || !databaseOptions) {
    console.warn('MySQL is not configured; using the in-memory repository.');
    return;
  }

  try {
    const rootConnection = await mysql.createConnection(rootOptions);
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await rootConnection.end();

    pool = mysql.createPool({
      ...databaseOptions,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
    });

    const connection = await pool.getConnection();
    connection.release();
    isDbConnected = true;

    await createTables();
    await seedTablesIfEmpty(initialData);
    console.log(`Connected to MySQL database "${dbName}" on ${dbHost}:${databaseOptions.port}`);
  } catch (error) {
    isDbConnected = false;
    if (pool) await pool.end().catch(() => undefined);
    pool = undefined;
    console.error('MySQL initialization failed; using the in-memory repository.', error);
  }
}

async function createTables() {
  const database = pool;
  if (!database) return;

  await database.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL,
      icon VARCHAR(255), description TEXT, is_popular TINYINT(1) DEFAULT 0, color VARCHAR(50)
    )
  `);
  await database.query(`
    CREATE TABLE IF NOT EXISTS cloth_types (
      id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL, icon VARCHAR(255),
      category_tag VARCHAR(255), category_label VARCHAR(255), description TEXT,
      image_url TEXT, is_active TINYINT(1) DEFAULT 1, sort_order INT DEFAULT 0
    )
  `);
  await database.query(`
    CREATE TABLE IF NOT EXISTS service_masters (
      id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL,
      icon VARCHAR(255), pricing_type VARCHAR(255), base_kg_price DECIMAL(10, 2),
      min_order_kg DECIMAL(10, 2), turnaround_hours INT, description TEXT, is_active TINYINT(1) DEFAULT 1
    )
  `);
  await database.query(`
    CREATE TABLE IF NOT EXISTS service_price_matrix (
      id VARCHAR(255) PRIMARY KEY, cloth_type_id VARCHAR(255), cloth_name VARCHAR(255),
      cloth_icon VARCHAR(255), category_tag VARCHAR(255), service_id VARCHAR(255),
      service_name VARCHAR(255), price DECIMAL(10, 2), express_price DECIMAL(10, 2),
      turnaround_hours INT, is_active TINYINT(1) DEFAULT 1
    )
  `);
  await database.query(`
    CREATE TABLE IF NOT EXISTS pricing_settings (
      id INT PRIMARY KEY, tax_percentage DECIMAL(5, 2), min_order_value DECIMAL(10, 2),
      free_delivery_threshold DECIMAL(10, 2), standard_delivery_fee DECIMAL(10, 2),
      express_delivery_fee DECIMAL(10, 2), extra_kg_price DECIMAL(10, 2)
    )
  `);
  await database.query(`
    CREATE TABLE IF NOT EXISTS services (
      id VARCHAR(255) PRIMARY KEY, category_id VARCHAR(255), name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL, description TEXT, pricing_model VARCHAR(255),
      base_price DECIMAL(10, 2), unit VARCHAR(255), min_order_quantity DECIMAL(10, 2),
      turnaround_hours INT, popular TINYINT(1) DEFAULT 0, express_available TINYINT(1) DEFAULT 0
    )
  `);
  await database.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(255) PRIMARY KEY, customer_id VARCHAR(255), customer_name VARCHAR(255),
      customer_phone VARCHAR(255), address JSON, items JSON, pricing_model_summary VARCHAR(255),
      express_tier VARCHAR(255), pickup_slot JSON, delivery_slot JSON, pickup_otp VARCHAR(50),
      delivery_otp VARCHAR(50), bag_tag_code VARCHAR(100), current_status VARCHAR(100),
      status_history JSON, is_weighed TINYINT(1) DEFAULT 0, actual_weight_kg DECIMAL(10, 2),
      item_total DECIMAL(10, 2), discount_amount DECIMAL(10, 2), coupon_code VARCHAR(100),
      pickup_delivery_fee DECIMAL(10, 2), express_fee DECIMAL(10, 2), tax_amount DECIMAL(10, 2),
      total_amount DECIMAL(10, 2), payment_method VARCHAR(100), payment_status VARCHAR(100),
      payment_transaction_id VARCHAR(255), payment_gateway_order_id VARCHAR(255),
      created_at VARCHAR(100), updated_at VARCHAR(100)
    )
  `);
  await database.query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id VARCHAR(255) PRIMARY KEY, code VARCHAR(100) NOT NULL UNIQUE, title VARCHAR(255),
      description TEXT, discount_type VARCHAR(50), discount_value DECIMAL(10, 2),
      min_order_value DECIMAL(10, 2), max_discount_cap DECIMAL(10, 2),
      first_order_only TINYINT(1) DEFAULT 0, expiry_date VARCHAR(50), usage_count INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1
    )
  `);
  await database.query(`
    CREATE TABLE IF NOT EXISTS pincodes (
      pincode VARCHAR(20) PRIMARY KEY, area_name VARCHAR(255), city VARCHAR(255),
      is_serviceable TINYINT(1) DEFAULT 1, standard_fee DECIMAL(10, 2),
      min_free_order_value DECIMAL(10, 2), express_available TINYINT(1) DEFAULT 1,
      average_turnaround_hours INT
    )
  `);
  await database.query(`
    CREATE TABLE IF NOT EXISTS staff (
      id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), phone VARCHAR(100),
      role VARCHAR(100), assigned_facility VARCHAR(255), assigned_zone VARCHAR(255),
      is_active TINYINT(1) DEFAULT 1, rating DECIMAL(3, 2), orders_processed INT DEFAULT 0
    )
  `);
  await database.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), slug VARCHAR(255),
      duration_months INT, price DECIMAL(10, 2), original_price DECIMAL(10, 2),
      validity_days INT, included_kg DECIMAL(10, 2), free_pickup_delivery TINYINT(1) DEFAULT 1,
      priority_service TINYINT(1) DEFAULT 0, max_family_members INT DEFAULT 1,
      features JSON, popular TINYINT(1) DEFAULT 0, is_active TINYINT(1) DEFAULT 1
    )
  `);

  // Column upgrade migrations
  const alterMigrations: [string, string][] = [
    ['categories', 'ADD COLUMN color VARCHAR(50) NULL'],
    ['cloth_types', 'ADD COLUMN image_url TEXT NULL'],
    ['orders', 'ADD COLUMN payment_transaction_id VARCHAR(255) NULL'],
    ['orders', 'ADD COLUMN payment_gateway_order_id VARCHAR(255) NULL'],
  ];

  for (const [table, columnDef] of alterMigrations) {
    await database.query(`ALTER TABLE ${table} ${columnDef}`).catch((error: { code?: string }) => {
      if (error.code !== 'ER_DUP_FIELDNAME') console.warn(`Migration notice for ${table}:`, error.code);
    });
  }
}

async function tableIsEmpty(tableName: string) {
  const database = pool;
  if (!database) return false;
  const [rows] = await database.query(`SELECT COUNT(*) AS count FROM ${tableName}`) as any;
  return Number(rows[0]?.count || 0) === 0;
}

async function seedTablesIfEmpty(data: InitialData) {
  const database = pool;
  if (!database) return;

  if (await tableIsEmpty('categories')) {
    for (const item of data.categories) {
      await database.query('INSERT INTO categories (id, name, slug, icon, description, is_popular) VALUES (?, ?, ?, ?, ?, ?)', [item.id, item.name, item.slug, item.icon, item.description, item.isPopular ? 1 : 0]);
    }
  }
  if (await tableIsEmpty('cloth_types')) {
    for (const item of data.clothTypes) {
      await database.query('INSERT INTO cloth_types (id, name, icon, category_tag, category_label, description, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [item.id, item.name, item.icon, item.categoryTag, item.categoryLabel, item.description, item.isActive ? 1 : 0, item.sortOrder || 0]);
    }
  }
  if (await tableIsEmpty('service_masters')) {
    for (const item of data.serviceMasters) {
      await database.query('INSERT INTO service_masters (id, name, slug, icon, pricing_type, base_kg_price, min_order_kg, turnaround_hours, description, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [item.id, item.name, item.slug, item.icon, item.pricingType, item.baseKgPrice || null, item.minOrderKg || null, item.turnaroundHours, item.description, item.isActive ? 1 : 0]);
    }
  }
  if (await tableIsEmpty('service_price_matrix')) {
    for (const item of data.priceMatrix) {
      await database.query('INSERT INTO service_price_matrix (id, cloth_type_id, cloth_name, cloth_icon, category_tag, service_id, service_name, price, express_price, turnaround_hours, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [item.id, item.clothTypeId, item.clothName, item.clothIcon, item.categoryTag, item.serviceId, item.serviceName, item.price, item.expressPrice || null, item.turnaroundHours, item.isActive ? 1 : 0]);
    }
  }
  if (await tableIsEmpty('pricing_settings')) {
    const settings = data.pricingSettings;
    await database.query('INSERT INTO pricing_settings (id, tax_percentage, min_order_value, free_delivery_threshold, standard_delivery_fee, express_delivery_fee, extra_kg_price) VALUES (1, ?, ?, ?, ?, ?, ?)', [settings.taxPercentage, settings.minOrderValue, settings.freeDeliveryThreshold, settings.standardDeliveryFee, settings.expressDeliveryFee, settings.extraKgPrice]);
  }
  if (await tableIsEmpty('services')) {
    for (const item of data.services) {
      await database.query('INSERT INTO services (id, category_id, name, slug, description, pricing_model, base_price, unit, min_order_quantity, turnaround_hours, popular, express_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [item.id, item.categoryId, item.name, item.slug, item.description, item.pricingModel, item.basePrice, item.unit, item.minOrderQuantity || null, item.turnaroundHours, item.popular ? 1 : 0, item.expressAvailable ? 1 : 0]);
    }
  }
  if (await tableIsEmpty('coupons')) {
    for (const item of data.coupons) {
      await database.query('INSERT INTO coupons (id, code, title, description, discount_type, discount_value, min_order_value, max_discount_cap, first_order_only, expiry_date, usage_count, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [item.id, item.code, item.title, item.description, item.discountType, item.discountValue, item.minOrderValue, item.maxDiscountCap || null, item.firstOrderOnly ? 1 : 0, item.expiryDate, item.usageCount || 0, item.isActive ? 1 : 0]);
    }
  }
  if (await tableIsEmpty('pincodes')) {
    for (const item of data.pincodes) {
      await database.query('INSERT INTO pincodes (pincode, area_name, city, is_serviceable, standard_fee, min_free_order_value, express_available, average_turnaround_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [item.pincode, item.areaName, item.city, item.isServiceable ? 1 : 0, item.standardFee, item.minFreeOrderValue, item.expressAvailable ? 1 : 0, item.averageTurnaroundHours]);
    }
  }
  if (await tableIsEmpty('staff')) {
    for (const item of data.staff) {
      await database.query('INSERT INTO staff (id, name, email, phone, role, assigned_facility, assigned_zone, is_active, rating, orders_processed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [item.id, item.name, item.email, item.phone, item.role, item.assignedFacility || null, item.assignedZone || null, item.isActive ? 1 : 0, item.rating || null, item.ordersProcessed || 0]);
    }
  }
  if (await tableIsEmpty('orders')) {
    for (const item of data.orders) {
      await database.query(
        'INSERT INTO orders (id, customer_id, customer_name, customer_phone, address, items, pricing_model_summary, express_tier, pickup_slot, delivery_slot, pickup_otp, delivery_otp, bag_tag_code, current_status, status_history, is_weighed, actual_weight_kg, item_total, discount_amount, coupon_code, pickup_delivery_fee, express_fee, tax_amount, total_amount, payment_method, payment_status, payment_transaction_id, payment_gateway_order_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [item.id, item.customerId, item.customerName, item.customerPhone, JSON.stringify(item.address), JSON.stringify(item.items), item.pricingModelSummary, item.expressTier, JSON.stringify(item.pickupSlot), JSON.stringify(item.deliverySlot), item.pickupOtp, item.deliveryOtp, item.bagTagCode, item.currentStatus, JSON.stringify(item.statusHistory), item.isWeighed ? 1 : 0, item.actualWeightKg || null, item.itemTotal, item.discountAmount, item.couponCode || null, item.pickupDeliveryFee, item.expressFee, item.taxAmount, item.totalAmount, item.paymentMethod, item.paymentStatus, item.paymentTransactionId || null, item.paymentGatewayOrderId || null, item.createdAt, item.updatedAt]
      );
    }
  }
}
