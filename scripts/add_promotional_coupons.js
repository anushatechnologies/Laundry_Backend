/**
 * Migration Script: Add Promotional Coupons
 * Adds "Buy 5kg Get 3kg FREE" and other promotional offers
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const promotionalCoupons = [
  {
    id: 'cp-promo-1',
    code: 'BUY5GET3',
    title: 'Buy 5kg Get 3kg FREE',
    description: 'Order 5kg or more laundry and get 3kg absolutely free! Perfect for weekly family loads.',
    discount_type: 'PERCENTAGE',
    discount_value: 37.5,
    min_order_value: 500,
    max_discount_cap: 300,
    first_order_only: 0,
    expiry_date: '2027-03-31',
    usage_count: 0,
    is_active: 1,
  },
  {
    id: 'cp-promo-2',
    code: 'WASH10GET2',
    title: 'Wash 10kg Get 2kg FREE',
    description: 'Order 10kg wash service and get 2kg free! Save up to ₹200 on bulk orders.',
    discount_type: 'PERCENTAGE',
    discount_value: 16.7,
    min_order_value: 1000,
    max_discount_cap: 200,
    first_order_only: 0,
    expiry_date: '2027-03-31',
    usage_count: 0,
    is_active: 1,
  },
  {
    id: 'cp-promo-3',
    code: 'DRYCLEAN30',
    title: '30% Off Dry Cleaning',
    description: 'Get 30% off on all dry cleaning services. Valid on suits, sarees, and formal wear.',
    discount_type: 'PERCENTAGE',
    discount_value: 30,
    min_order_value: 400,
    max_discount_cap: 250,
    first_order_only: 0,
    expiry_date: '2027-03-31',
    usage_count: 0,
    is_active: 1,
  },
  {
    id: 'cp-promo-4',
    code: 'EXPRESS50',
    title: '₹50 Off Express Service',
    description: 'Flat ₹50 discount on 2-hour express delivery. For urgent laundry needs.',
    discount_type: 'FLAT',
    discount_value: 50,
    min_order_value: 300,
    max_discount_cap: null,
    first_order_only: 0,
    expiry_date: '2027-03-31',
    usage_count: 0,
    is_active: 1,
  },
];

async function addPromotionalCoupons() {
  let connection;

  try {
    console.log('🔌 Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'laundry',
    });

    console.log('✅ Connected to database\n');

    for (const coupon of promotionalCoupons) {
      console.log(`📝 Adding coupon: ${coupon.code} - ${coupon.title}`);

      const query = `
        INSERT INTO coupons (
          id, code, title, description,
          discount_type, discount_value,
          min_order_value, max_discount_cap,
          first_order_only, expiry_date,
          usage_count, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          description = VALUES(description),
          discount_type = VALUES(discount_type),
          discount_value = VALUES(discount_value),
          min_order_value = VALUES(min_order_value),
          max_discount_cap = VALUES(max_discount_cap),
          first_order_only = VALUES(first_order_only),
          expiry_date = VALUES(expiry_date),
          is_active = VALUES(is_active)
      `;

      const values = [
        coupon.id,
        coupon.code,
        coupon.title,
        coupon.description,
        coupon.discount_type,
        coupon.discount_value,
        coupon.min_order_value,
        coupon.max_discount_cap,
        coupon.first_order_only,
        coupon.expiry_date,
        coupon.usage_count,
        coupon.is_active,
      ];

      await connection.execute(query, values);
      console.log(`   ✅ Added/Updated: ${coupon.code}\n`);
    }

    // Verify
    console.log('🔍 Verifying promotional coupons...\n');
    const [rows] = await connection.execute(
      'SELECT code, title, discount_type, discount_value, is_active FROM coupons WHERE id LIKE "cp-promo-%"'
    );

    console.log('📊 Current Promotional Coupons:');
    console.table(rows);

    console.log('\n✅ Promotional coupons added successfully!');
    console.log('🎉 Customers can now use: BUY5GET3, WASH10GET2, DRYCLEAN30, EXPRESS50');

  } catch (error) {
    console.error('❌ Error adding promotional coupons:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the migration
addPromotionalCoupons()
  .then(() => {
    console.log('\n✨ Migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
