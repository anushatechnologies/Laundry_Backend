const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  const [tsRows] = await conn.execute(
    'SELECT id, name, category_tag FROM cloth_types WHERE id LIKE "cloth-1788%" ORDER BY id ASC'
  );
  console.log(`Found ${tsRows.length} timestamp cloth_types to update...`);

  await conn.beginTransaction();
  try {
    let updatedCount = 0;
    for (const row of tsRows) {
      const [matches] = await conn.execute(
        'SELECT DISTINCT cloth_type_id FROM service_price_matrix WHERE LOWER(TRIM(cloth_name)) = LOWER(TRIM(?))',
        [row.name]
      );

      if (matches.length > 0) {
        const targetId = matches[0].cloth_type_id;
        await conn.execute(
          'UPDATE cloth_types SET id = ? WHERE id = ?',
          [targetId, row.id]
        );
        console.log(`Updated: ${row.id} -> ${targetId} (${row.name})`);
        updatedCount++;
      } else {
        console.warn(`Skipping (no match): ${row.name}`);
      }
    }

    await conn.commit();
    console.log(`\nSuccessfully committed ${updatedCount} updates!`);
  } catch (err) {
    await conn.rollback();
    console.error('Failed and rolled back:', err);
  }

  // Verify
  const [remaining] = await conn.execute('SELECT count(*) as cnt FROM cloth_types WHERE id LIKE "cloth-1788%"');
  console.log(`Remaining timestamp IDs in cloth_types: ${remaining[0].cnt}`);

  const [totalCt] = await conn.execute('SELECT count(*) as cnt FROM cloth_types');
  console.log(`Total cloth_types now: ${totalCt[0].cnt}`);

  await conn.end();
}

main().catch(console.error);
