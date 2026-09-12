const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function check() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    connectTimeout: 8000
  });

  const [rows] = await c.query('SELECT id, name, category_tag, sub_category, image_url FROM cloth_types WHERE name LIKE "%Kurta%" OR name LIKE "%Dhoti%" OR name LIKE "%Mundu%"');
  console.log('KURTA / DHOTI IN RDS:', JSON.stringify(rows, null, 2));

  const [nullOrEmpty] = await c.query('SELECT id, name, category_tag, image_url FROM cloth_types WHERE image_url IS NULL OR image_url = ""');
  console.log('CLOTH TYPES WITH NULL OR EMPTY IMAGE IN RDS:', JSON.stringify(nullOrEmpty, null, 2));

  await c.end();
}
check().catch(console.error);
