const dns = require('dns');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const RDS_HOST = 'laundry.cls6amm8u5az.ap-south-2.rds.amazonaws.com';
const dumpPath = path.join(__dirname, '..', 'laundry_rds_dump.sql');
const sqlDump = fs.readFileSync(dumpPath, 'utf8');

async function waitForPublicAndMigrate() {
  console.log('----------------------------------------------------');
  console.log('🔄 Checking AWS RDS network state and connecting...');
  console.log('Target:', RDS_HOST);
  console.log('----------------------------------------------------');

  for (let attempt = 1; attempt <= 20; attempt++) {
    const ip = await new Promise((resolve) => {
      dns.lookup(RDS_HOST, { all: false }, (err, address) => {
        if (err) resolve(null);
        else resolve(address);
      });
    });

    console.log(`[Attempt ${attempt}/20] Resolved IP: ${ip || 'resolving...'}`);

    try {
      const conn = await mysql.createConnection({
        host: RDS_HOST,
        port: 3306,
        user: 'admin',
        password: 'Anjibabu2244',
        connectTimeout: 6000,
        multipleStatements: true,
        ssl: { rejectUnauthorized: false },
      });

      console.log('🎉 SUCCESS! Connected directly to AWS RDS MySQL!');
      console.log('📦 Executing database migration & seeding tables...');
      await conn.query(sqlDump);
      console.log('✨ All tables and catalog data successfully populated into AWS RDS MySQL!');

      const [tables] = await conn.query('SHOW TABLES IN laundry');
      console.log('📊 Verified Tables in RDS `laundry` database:');
      tables.forEach((t) => console.log('  - ' + Object.values(t)[0]));

      await conn.end();
      return true;
    } catch (err) {
      console.log(`⏳ Waiting for AWS RDS modification / network propagation (${err.message})...`);
      await new Promise((r) => setTimeout(r, 6000));
    }
  }

  console.log('AWS is still applying the modification. Please allow another 30 seconds.');
  return false;
}

waitForPublicAndMigrate();
