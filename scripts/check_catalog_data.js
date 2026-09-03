// Quick catalog data verification script
// Run: node scripts/check_catalog_data.js

const { db } = require('../dist/lib/db');

console.log('\n=== CATALOG DATA VERIFICATION ===\n');

try {
  const catalog = db.getFullCatalog();
  const serviceMasters = db.getServiceMasters();

  console.log('📊 Overall Statistics:');
  console.log(`   Total Cloth Types: ${catalog.clothTypes.length}`);
  console.log(`   Total Service Masters: ${serviceMasters.length}`);
  console.log(`   Total Price Matrix Entries: ${catalog.priceMatrix.length}`);

  // Check Men's items
  const mensItems = catalog.clothTypes.filter(c => 
    c.categoryTag && c.categoryTag.toUpperCase().includes('MEN')
  );
  console.log(`\n👔 Men's Category:`);
  console.log(`   Men's Items: ${mensItems.length}`);
  if (mensItems.length > 0) {
    console.log(`   Sample: ${mensItems.slice(0, 3).map(m => m.name).join(', ')}`);
  }

  // Check service masters
  console.log(`\n🧺 Service Masters:`);
  serviceMasters.forEach(sm => {
    console.log(`   - ${sm.name} (${sm.serviceCode})`);
  });

  // Check Wash & Iron service
  const washIronService = serviceMasters.find(s => s.serviceCode === 'WASH_IRON');
  if (washIronService) {
    console.log(`\n💧 Wash & Iron Service Found:`);
    console.log(`   ID: ${washIronService.id}`);
    console.log(`   Name: ${washIronService.name}`);

    // Check Men's items with Wash & Iron pricing
    const mensWithWashIron = catalog.priceMatrix.filter(pm => 
      pm.serviceId === washIronService.id && 
      mensItems.some(m => m.id === pm.clothTypeId)
    );

    console.log(`   Men's items with Wash & Iron pricing: ${mensWithWashIron.length}`);

    if (mensWithWashIron.length > 0) {
      console.log(`\n   Sample Prices:`);
      mensWithWashIron.slice(0, 5).forEach(pm => {
        const cloth = mensItems.find(m => m.id === pm.clothTypeId);
        console.log(`   - ${cloth.name}: ₹${pm.price}`);
      });
    } else {
      console.log(`\n   ❌ NO MEN'S ITEMS HAVE WASH & IRON PRICING!`);
      console.log(`   This is why "Wash & Fold" shows 0 items.`);
    }
  } else {
    console.log(`\n   ❌ WASH & IRON SERVICE NOT FOUND!`);
    console.log(`   Service codes available: ${serviceMasters.map(s => s.serviceCode).join(', ')}`);
  }

  // Check Press service
  const pressService = serviceMasters.find(s => s.serviceCode === 'PRESS');
  if (pressService) {
    const mensWithPress = catalog.priceMatrix.filter(pm => 
      pm.serviceId === pressService.id && 
      mensItems.some(m => m.id === pm.clothTypeId)
    );
    console.log(`\n🔥 Press Service:`);
    console.log(`   Men's items with Press pricing: ${mensWithPress.length}`);
  }

  // Check Dry Clean service
  const dryCleanService = serviceMasters.find(s => s.serviceCode === 'DRY_CLEAN');
  if (dryCleanService) {
    const mensWithDryClean = catalog.priceMatrix.filter(pm => 
      pm.serviceId === dryCleanService.id && 
      mensItems.some(m => m.id === pm.clothTypeId)
    );
    console.log(`\n🧼 Dry Clean Service:`);
    console.log(`   Men's items with Dry Clean pricing: ${mensWithDryClean.length}`);
  }

  // Category breakdown
  console.log(`\n📂 Category Breakdown:`);
  const categoryCount = {};
  catalog.clothTypes.forEach(c => {
    const cat = c.categoryTag || 'UNKNOWN';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  Object.entries(categoryCount).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} items`);
  });

  // Check for items WITHOUT any pricing
  const itemsWithoutPricing = catalog.clothTypes.filter(cloth => {
    return !catalog.priceMatrix.some(pm => pm.clothTypeId === cloth.id);
  });
  
  if (itemsWithoutPricing.length > 0) {
    console.log(`\n⚠️  WARNING: ${itemsWithoutPricing.length} items have NO pricing at all:`);
    itemsWithoutPricing.slice(0, 5).forEach(item => {
      console.log(`   - ${item.name} (${item.categoryTag})`);
    });
  }

  console.log(`\n=== END OF VERIFICATION ===\n`);

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
