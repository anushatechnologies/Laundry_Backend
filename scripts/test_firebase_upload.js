const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`,
  });
}

async function testFirebaseUpload() {
  console.log(`Connecting to Firebase Storage bucket: ${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`);
  try {
    const bucket = getStorage().bucket();
    const testFile = bucket.file('garments/shirt.jpg');
    const localShirt = path.join(__dirname, '../../frontend-web/public/images/garments/shirt.jpg');
    
    if (fs.existsSync(localShirt)) {
      const buffer = fs.readFileSync(localShirt);
      await testFile.save(buffer, {
        contentType: 'image/jpeg',
        public: true,
        metadata: {
          cacheControl: 'public, max-age=31536000',
        },
      });
      await testFile.makePublic().catch(() => null);
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/garments/shirt.jpg`;
      console.log(`>>> Uploaded successfully to Cloud Storage! Public URL: ${publicUrl}`);
      return publicUrl;
    }
  } catch (err) {
    console.error('Firebase storage upload error:', err.message);

    // Try fallback bucket name: project_id.appspot.com
    try {
      console.log(`Trying fallback bucket: ${process.env.FIREBASE_PROJECT_ID}.appspot.com...`);
      const bucket2 = getStorage().bucket(`${process.env.FIREBASE_PROJECT_ID}.appspot.com`);
      const testFile2 = bucket2.file('garments/shirt.jpg');
      const localShirt = path.join(__dirname, '../../frontend-web/public/images/garments/shirt.jpg');
      const buffer = fs.readFileSync(localShirt);
      await testFile2.save(buffer, {
        contentType: 'image/jpeg',
        public: true,
      });
      await testFile2.makePublic().catch(() => null);
      const publicUrl = `https://storage.googleapis.com/${bucket2.name}/garments/shirt.jpg`;
      console.log(`>>> Uploaded successfully to fallback Cloud Storage! Public URL: ${publicUrl}`);
      return publicUrl;
    } catch (err2) {
      console.error('Fallback bucket error:', err2.message);
    }
  }
}

testFirebaseUpload();
