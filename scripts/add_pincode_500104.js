const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
  });

  const sql = `
    INSERT INTO pincodes (pincode, area_name, city, is_serviceable, standard_fee, min_free_order_value, express_available, average_turnaround_hours)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      area_name = VALUES(area_name),
      city = VALUES(city),
      is_serviceable = VALUES(is_serviceable),
      standard_fee = VALUES(standard_fee),
      min_free_order_value = VALUES(min_free_order_value),
      express_available = VALUES(express_available),
      average_turnaround_hours = VALUES(average_turnaround_hours)
  `;

  await conn.query(sql, [
    '500104',
    'Siri Sampada Arcade 1 / Khajaguda / Gachibowli',
    'Hyderabad',
    1,
    30.00,
    499.00,
    1,
    24,
  ]);

  const [rows] = await conn.query('SELECT * FROM pincodes WHERE pincode = ?', ['500104']);
  console.log('SUCCESS: Pincode 500104 in MySQL:', rows);
  await conn.end();
}

main().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
