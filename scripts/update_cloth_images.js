const mysql = require('mysql2/promise');

async function updateClothImages() {
  const c = await mysql.createConnection({host:'localhost',user:'root',password:'2395',database:'laundry',port:3306});
  
  // Add image_url to cloth_types if not present
  await c.query('ALTER TABLE cloth_types ADD COLUMN image_url TEXT NULL').catch(e => e.code === 'ER_DUP_FIELDNAME' ? null : Promise.reject(e));

  const clothImageMap = [
    { id: 'cloth-shirt', img: '/images/garments/shirt.jpg' },
    { id: 'cloth-tshirt', img: '/images/garments/tshirt.jpg' },
    { id: 'cloth-jeans', img: '/images/garments/jeans.jpg' },
    { id: 'cloth-trouser', img: '/images/garments/jeans.jpg' },
    { id: 'cloth-kurta-m', img: '/images/garments/kurti.jpg' },
    { id: 'cloth-blazer', img: '/images/garments/suit.jpg' },
    { id: 'cloth-suit-2p', img: '/images/garments/suit.jpg' },
    { id: 'cloth-sweater', img: '/images/garments/tshirt.jpg' },
    { id: 'cloth-jacket', img: '/images/garments/suit.jpg' },
    { id: 'cloth-saree-reg', img: '/images/garments/saree.jpg' },
    { id: 'cloth-saree-silk', img: '/images/garments/saree.jpg' },
    { id: 'cloth-blouse', img: '/images/garments/kurti.jpg' },
    { id: 'cloth-kurti', img: '/images/garments/kurti.jpg' },
    { id: 'cloth-salwar', img: '/images/garments/kurti.jpg' },
    { id: 'cloth-lehenga', img: '/images/garments/lehenga.jpg' },
    { id: 'cloth-dress-w', img: '/images/garments/lehenga.jpg' },
    { id: 'cloth-kid-shirt', img: '/images/garments/tshirt.jpg' },
    { id: 'cloth-kid-pant', img: '/images/garments/jeans.jpg' },
    { id: 'cloth-kid-dress', img: '/images/garments/kurti.jpg' },
    { id: 'cloth-kid-uniform', img: '/images/garments/shirt.jpg' },
    { id: 'cloth-bedsheet-s', img: '/images/garments/bedsheet.jpg' },
    { id: 'cloth-bedsheet-d', img: '/images/garments/bedsheet.jpg' },
    { id: 'cloth-blanket', img: '/images/garments/bedsheet.jpg' },
    { id: 'cloth-comforter', img: '/images/garments/bedsheet.jpg' },
    { id: 'cloth-curtain', img: '/images/service_home_textiles.jpg' },
    { id: 'cloth-towel', img: '/images/service_home_textiles.jpg' },
    { id: 'cloth-shoes-sneaker', img: '/images/garments/sneakers.jpg' },
    { id: 'cloth-shoes-formal', img: '/images/garments/sneakers.jpg' },
    { id: 'cloth-bag-backpack', img: '/images/garments/handbag.jpg' },
    { id: 'cloth-bag-luxury', img: '/images/garments/handbag.jpg' },
  ];

  for (const item of clothImageMap) {
    await c.query('UPDATE cloth_types SET image_url = ? WHERE id = ?', [item.img, item.id]);
    console.log(`Updated cloth ${item.id} -> ${item.img}`);
  }

  // Also update service_masters with real image_url column if not present
  await c.query('ALTER TABLE service_masters ADD COLUMN image_url TEXT NULL').catch(e => e.code === 'ER_DUP_FIELDNAME' ? null : Promise.reject(e));

  const serviceMasterImages = [
    { id: 'srv-m-wash-fold', img: '/images/service_wash_fold.jpg' },
    { id: 'srv-m-wash-iron', img: '/images/service_wash_iron.jpg' },
    { id: 'srv-m-dry-clean', img: '/images/service_dry_cleaning.jpg' },
    { id: 'srv-m-steam-iron', img: '/images/service_steam_press.jpg' },
    { id: 'srv-m-express', img: '/images/delivery_van_driver.jpg' },
    { id: 'srv-m-spa', img: '/images/service_shoe_clean.jpg' },
  ];

  for (const sm of serviceMasterImages) {
    await c.query('UPDATE service_masters SET image_url = ? WHERE id = ?', [sm.img, sm.id]);
    console.log(`Updated service master ${sm.id} -> ${sm.img}`);
  }

  console.log('All cloth and service master images updated in MySQL.');
  await c.end();
}

updateClothImages().catch(console.error);
