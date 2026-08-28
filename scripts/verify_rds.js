const mysql = require('mysql2/promise');

async function verifyCounts() {
  const conn = await mysql.createConnection({
    host: 'laundry.cls6amm8u5az.ap-south-2.rds.amazonaws.com',
    port: 3306,
    user: 'admin',
    password: 'Anjibabu2244',
    database: 'laundry',
    ssl: { rejectUnauthorized: false },
  });

  const tables = [
    'categories',
    'cloth_types',
    'service_masters',
    'service_price_matrix',
    'pricing_settings',
    'services',
    'coupons',
    'pincodes',
    'staff',
    'subscriptions',
  ];

  console.log('📊 AWS RDS MySQL Table Verification:');
  for (const table of tables) {
    const [rows] = await conn.query('SELECT COUNT(*) as count FROM ' + table);
    console.log(`  ✅ ${table}: ${rows[0].count} records populated`);
  }
  await conn.end();
}

verifyCounts().catch(console.error);
