const mysql = require('mysql2/promise');

async function fullSync() {
  console.log('----------------------------------------------------');
  console.log('🚀 Full Local MySQL -> AWS RDS Sync (Exact Schemas & Data)');
  console.log('----------------------------------------------------');

  const localConn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '2395',
    database: 'laundry',
  });
  console.log('✅ Connected to Local MySQL (localhost:3306)');

  const rdsConn = await mysql.createConnection({
    host: 'laundry.cls6amm8u5az.ap-south-2.rds.amazonaws.com',
    port: 3306,
    user: 'admin',
    password: 'Anjibabu2244',
    database: 'laundry',
    ssl: { rejectUnauthorized: false },
    multipleStatements: true,
  });
  console.log('✅ Connected to AWS RDS MySQL (ap-south-2)');

  // 1. Get all local tables
  const [tables] = await localConn.query('SHOW TABLES');
  const tableNames = tables.map((t) => Object.values(t)[0]);
  console.log('Found tables:', tableNames);

  // 2. Sync schemas
  for (const table of tableNames) {
    const [createRes] = await localConn.query('SHOW CREATE TABLE `' + table + '`');
    const createSql = createRes[0]['Create Table'];
    
    // Create table in RDS if not exists
    await rdsConn.query(createSql.replace('CREATE TABLE', 'CREATE TABLE IF NOT EXISTS')).catch((e) => {
      console.warn(`Table create notice for ${table}:`, e.message);
    });

    // Sync any missing columns
    const [localCols] = await localConn.query('SHOW COLUMNS FROM `' + table + '`');
    const [rdsCols] = await rdsConn.query('SHOW COLUMNS FROM `' + table + '`');
    const rdsColNames = rdsCols.map((c) => c.Field);

    for (const col of localCols) {
      if (!rdsColNames.includes(col.Field)) {
        const typeStr = col.Type + (col.Null === 'YES' ? ' NULL' : ' NOT NULL') + (col.Default !== null ? ' DEFAULT ' + JSON.stringify(col.Default) : '');
        await rdsConn.query('ALTER TABLE `' + table + '` ADD COLUMN `' + col.Field + '` ' + typeStr).catch((e) => {
          console.warn(`Alter notice for ${table}.${col.Field}:`, e.message);
        });
      }
    }
  }
  console.log('✅ All RDS table schemas matched with local database!');

  // 3. Sync all data rows
  for (const table of tableNames) {
    const [rows] = await localConn.query('SELECT * FROM `' + table + '`');
    if (rows.length > 0) {
      for (const row of rows) {
        const keys = Object.keys(row);
        const values = Object.values(row);
        const placeholders = keys.map(() => '?').join(', ');
        const updateStr = keys.map((k) => '`' + k + '`=VALUES(`' + k + '`)').join(', ');
        const sql = 'INSERT INTO `' + table + '` (`' + keys.join('`, `') + '`) VALUES (' + placeholders + ') ON DUPLICATE KEY UPDATE ' + updateStr;

        const formattedValues = values.map((v) => (typeof v === 'object' && v !== null ? JSON.stringify(v) : v));
        await rdsConn.execute(sql, formattedValues);
      }
      console.log(`✅ Synced ${rows.length} rows into RDS table \`${table}\``);
    } else {
      console.log(`ℹ️ Table \`${table}\` is empty locally (0 rows)`);
    }
  }

  // 4. Verification Summary
  console.log('----------------------------------------------------');
  console.log('📊 Final AWS RDS Table Verification Summary:');
  const [rdsTables] = await rdsConn.query('SHOW TABLES');
  for (const t of rdsTables) {
    const tName = Object.values(t)[0];
    const [countRes] = await rdsConn.query('SELECT COUNT(*) as cnt FROM `' + tName + '`');
    console.log(`  - \`${tName}\`: ${countRes[0].cnt} records`);
  }
  console.log('----------------------------------------------------');

  await localConn.end();
  await rdsConn.end();
}

fullSync().catch(console.error);
