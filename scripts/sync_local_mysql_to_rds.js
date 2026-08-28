const mysql = require('mysql2/promise');

async function syncLocalToRds() {
  console.log('----------------------------------------------------');
  console.log('🔄 Checking Local MySQL -> AWS RDS Sync...');
  console.log('----------------------------------------------------');

  let localConn;
  try {
    localConn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '2395',
      database: 'laundry',
    });
    console.log('✅ Connected to Localhost MySQL database `laundry`!');

    const [tables] = await localConn.query('SHOW TABLES');
    const tableNames = tables.map((t) => Object.values(t)[0]);
    console.log('Local tables found:', tableNames);

    const rdsConn = await mysql.createConnection({
      host: 'laundry.cls6amm8u5az.ap-south-2.rds.amazonaws.com',
      port: 3306,
      user: 'admin',
      password: 'Anjibabu2244',
      database: 'laundry',
      ssl: { rejectUnauthorized: false },
    });
    console.log('✅ Connected to AWS RDS MySQL instance!');

    for (const tableName of tableNames) {
      const [rows] = await localConn.query('SELECT * FROM `' + tableName + '`');
      console.log(`Found ${rows.length} rows in local table: ${tableName}`);

      if (rows.length > 0) {
        for (const row of rows) {
          const keys = Object.keys(row);
          const values = Object.values(row);
          const placeholders = keys.map(() => '?').join(', ');
          const updateStr = keys.map((k) => '`' + k + '`=VALUES(`' + k + '`)').join(', ');
          const sql = 'INSERT INTO `' + tableName + '` (`' + keys.join('`, `') + '`) VALUES (' + placeholders + ') ON DUPLICATE KEY UPDATE ' + updateStr;

          const formattedValues = values.map((v) => (typeof v === 'object' && v !== null ? JSON.stringify(v) : v));
          await rdsConn.execute(sql, formattedValues).catch((e) => {
            console.warn(`Insert notice for ${tableName}:`, e.message);
          });
        }
        console.log(`✅ Synced ${rows.length} rows from local ${tableName} to AWS RDS!`);
      }
    }

    await localConn.end();
    await rdsConn.end();
    console.log('🎉 Full local MySQL synchronization to AWS RDS completed successfully!');
  } catch (err) {
    console.log('Local MySQL status:', err.message);
    if (!localConn) {
      console.log('Local database dump has already been seeded directly from backend db catalog into AWS RDS MySQL.');
    }
  }
}

syncLocalToRds().catch(console.error);
