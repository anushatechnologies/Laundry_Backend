const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function check() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [customers] = await connection.execute(
    'SELECT id, name, phone, email FROM customers WHERE name LIKE ? OR phone LIKE ?',
    ['%Venkatarao%', '%Venkat%']
  );
  console.log('Customers found:', customers);

  if (customers.length > 0) {
    for (const c of customers) {
      const [subs] = await connection.execute(
        'SELECT * FROM customer_subscriptions WHERE customer_id = ?',
        [c.id]
      );
      console.log(`Subscriptions for customer ${c.name} (${c.id}):`, subs);

      const [orders] = await connection.execute(
        'SELECT id, customer_name, total_amount, payment_method, payment_status, current_status, created_at FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 5',
        [c.id]
      );
      console.log(`Recent orders for ${c.name}:`, orders);
    }
  }

  const [audit] = await connection.execute(
    'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10'
  );
  console.log('Recent audit logs:', audit);

  await connection.end();
}

check().catch(console.error);
