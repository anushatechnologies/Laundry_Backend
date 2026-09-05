const mysql = require('mysql2/promise');
require('dotenv').config();
const { createReferralTables } = require('../dist/modules/referrals/schema');

(async () => {
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
    throw new Error('Configure DB_HOST, DB_USER and DB_NAME before running the migration.');
  }
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, port: Number(process.env.DB_PORT || 3306), connectTimeout: 10000,
  });
  try {
    await createReferralTables(connection);
    console.log('Referral tables are ready. No campaign, customer, invite or reward data was seeded.');
  } finally { await connection.end(); }
})().catch(error => { console.error('Referral migration failed:', error.code || error.message); process.exitCode = 1; });
