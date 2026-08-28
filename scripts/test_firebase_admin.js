const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

try {
  const app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });

  console.log('Firebase Admin initialized successfully!');

  getAuth(app).createCustomToken('test_uid_9948598350')
    .then((customToken) => {
      console.log('Successfully generated Firebase Custom Token:', customToken.substring(0, 30) + '...');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Firebase Admin Auth error:', err);
      process.exit(1);
    });
} catch (e) {
  console.error('Initialization error:', e);
  process.exit(1);
}
