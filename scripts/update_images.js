const mysql = require('mysql2/promise');

async function updateImages() {
  const c = await mysql.createConnection({host:'localhost',user:'root',password:'2395',database:'laundry',port:3306});
  
  const serviceImages = [
    { id: 'srv-1', img: '/images/service_wash_fold.jpg' },
    { id: 'srv-2', img: '/images/service_wash_iron.jpg' },
    { id: 'srv-6', img: '/images/service_steam_press.jpg' },
    { id: 'srv-10', img: '/images/service_dry_cleaning.jpg' },
    { id: 'srv-11', img: '/images/service_dry_cleaning.jpg' },
    { id: 'srv-14', img: '/images/service_dry_cleaning.jpg' },
  ];

  for (const s of serviceImages) {
    await c.query('UPDATE services SET image_url = ? WHERE id = ?', [s.img, s.id]);
    console.log(`Updated service ${s.id} -> ${s.img}`);
  }

  const categoryImages = [
    { id: 'cat-1', img: '/images/service_wash_fold.jpg' },
    { id: 'cat-2', img: '/images/service_steam_press.jpg' },
    { id: 'cat-3', img: '/images/service_dry_cleaning.jpg' },
    { id: 'cat-4', img: '/images/service_dry_cleaning.jpg' },
    { id: 'cat-5', img: '/images/service_home_textiles.jpg' },
    { id: 'cat-6', img: '/images/service_shoe_clean.jpg' },
    { id: 'cat-7', img: '/images/service_shoe_clean.jpg' },
    { id: 'cat-8', img: '/images/service_wash_fold.jpg' },
    { id: 'cat-9', img: '/images/delivery_van_driver.jpg' },
  ];

  for (const cat of categoryImages) {
    await c.query('UPDATE categories SET image_url = ? WHERE id = ?', [cat.img, cat.id]);
    console.log(`Updated category ${cat.id} -> ${cat.img}`);
  }

  console.log('Images updated in MySQL successfully.');
  await c.end();
}

updateImages().catch(console.error);
