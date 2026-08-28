const mysql = require('mysql2/promise');

async function migrate() {
  const c = await mysql.createConnection({host:'localhost',user:'root',password:'2395',database:'laundry',port:3306});
  
  const alterations = [
    "ALTER TABLE services ADD COLUMN image_url TEXT NULL",
    "ALTER TABLE categories ADD COLUMN image_url TEXT NULL",
    "ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255) NULL",
    "ALTER TABLE staff ADD COLUMN password_hash VARCHAR(255) NULL",
    "ALTER TABLE staff ADD COLUMN hub_id VARCHAR(255) NULL",
    "ALTER TABLE staff ADD COLUMN last_login TIMESTAMP NULL",
  ];

  for (const sql of alterations) {
    try { await c.query(sql); console.log('OK:', sql.split('ADD COLUMN')[1]?.trim() || sql); }
    catch(e) { if (e.code === 'ER_DUP_FIELDNAME') console.log('SKIP (exists):', sql); else console.error('ERR:', e.message); }
  }

  const creates = [
    `CREATE TABLE IF NOT EXISTS hubs (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      city VARCHAR(255),
      address TEXT,
      phone VARCHAR(50),
      manager_name VARCHAR(255),
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS customers (
      id VARCHAR(255) PRIMARY KEY,
      firebase_uid VARCHAR(255) UNIQUE,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(255),
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(255) PRIMARY KEY,
      actor_id VARCHAR(255),
      actor_email VARCHAR(255),
      actor_role VARCHAR(100),
      action VARCHAR(255),
      resource_type VARCHAR(100),
      resource_id VARCHAR(255),
      payload_before JSON,
      payload_after JSON,
      ip_address VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  for (const sql of creates) {
    try { await c.query(sql); console.log('CREATED table:', sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1]); }
    catch(e) { console.error('CREATE ERR:', e.message); }
  }

  console.log('\nAll migrations done.');
  await c.end();
}

migrate();
