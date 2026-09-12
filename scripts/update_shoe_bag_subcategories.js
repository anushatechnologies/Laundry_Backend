const mysql = require('mysql2/promise');

async function updateSubcategories() {
  const conn = await mysql.createConnection({
    host: 'laundry.cls6amm8u5az.ap-south-2.rds.amazonaws.com',
    port: 3306,
    user: 'admin',
    password: 'Anjibabu2244',
    database: 'laundry',
    ssl: { rejectUnauthorized: false },
  });

  console.log('🔄 Updating sub_category for Footwear & Accessories in MySQL...');

  const updates = [
    { id: 'cloth-shoes-formal', subCategory: 'Formal Shoes' },
    { id: 'cloth-shoes-sneaker', subCategory: 'Sneakers' },
    { id: 'cloth-shoes-suede', subCategory: 'Sports Shoes' },
    { id: 'cloth-bag-backpack', subCategory: 'Backpacks' },
    { id: 'cloth-bag-luxury', subCategory: 'Handbags' },
    { id: 'cloth-helmet', subCategory: 'Belts & Wallets' },
    { id: 'cloth-trolley-cabin', subCategory: 'Luggage & Trolley' },
    { id: 'cloth-trolley-large', subCategory: 'Luggage & Trolley' },
  ];

  for (const item of updates) {
    const [res] = await conn.execute(
      'UPDATE cloth_types SET sub_category = ? WHERE id = ?',
      [item.subCategory, item.id]
    );
    console.log(`  ✅ Updated ${item.id} -> sub_category: ${item.subCategory} (affected: ${res.affectedRows})`);
  }

  // Also verify subcategories table has 'Luggage & Trolley' for ACCESSORIES
  const [subcatCheck] = await conn.execute(
    "SELECT id FROM subcategories WHERE category_tag = 'ACCESSORIES' AND name = 'Luggage & Trolley'"
  );
  if (subcatCheck.length === 0) {
    await conn.execute(
      "INSERT INTO subcategories (id, category_tag, name, image_url, is_active, sort_order) VALUES ('sub-a-4', 'ACCESSORIES', 'Luggage & Trolley', 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=400&q=80', 1, 4)"
    );
    console.log("  ✅ Added 'Luggage & Trolley' to subcategories table");
  }

  // Print summary
  const [rows] = await conn.query(
    "SELECT id, name, category_tag, sub_category FROM cloth_types WHERE category_tag IN ('FOOTWEAR', 'ACCESSORIES')"
  );
  console.log('\n📊 Updated Cloth Types:');
  console.table(rows);

  await conn.end();
  console.log('🎉 Done updating MySQL subcategories!');
}

updateSubcategories().catch(console.error);
