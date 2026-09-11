const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function check() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [custs] = await conn.execute(
    'SELECT id, name, phone, email FROM customers WHERE phone LIKE ? OR phone LIKE ?',
    ['%9948598350%', '%9398634787%']
  );
  console.log('Customers found:', JSON.stringify(custs, null, 2));

  const [allRecentCustomers] = await conn.execute(
    'SELECT id, name, phone, email, created_at FROM customers ORDER BY created_at DESC LIMIT 6'
  );
  console.log('Most recent 6 customers:', JSON.stringify(allRecentCustomers, null, 2));

  const [refs] = await conn.execute('SELECT * FROM referrals ORDER BY created_at DESC LIMIT 10');
  console.log('Referrals table:', JSON.stringify(refs, null, 2));

  const [wallets] = await conn.execute(
    'SELECT * FROM wallets WHERE customer_id IN (SELECT id FROM customers WHERE phone LIKE ? OR phone LIKE ?)',
    ['%9948598350%', '%9398634787%']
  );
  console.log('Wallets:', JSON.stringify(wallets, null, 2));

  const [txs] = await conn.execute(
    'SELECT * FROM wallet_transactions WHERE customer_id IN (SELECT id FROM customers WHERE phone LIKE ? OR phone LIKE ?) ORDER BY created_at DESC',
    ['%9948598350%', '%9398634787%']
  );
  console.log('Transactions:', JSON.stringify(txs, null, 2));

  await conn.end();
}

check().catch(console.error);
