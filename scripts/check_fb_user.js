const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../backend/.env') });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey
  })
});

async function run() {
  try {
    const user = await admin.auth().getUserByPhoneNumber('+919948598350');
    console.log('USER_EXISTS:', user.uid, user.phoneNumber);
  } catch (e) {
    console.log('USER_NOT_FOUND:', e.code || e.message);
  }

  try {
    const user2 = await admin.auth().getUserByPhoneNumber('+918019672244');
    console.log('USER2_EXISTS:', user2.uid, user2.phoneNumber);
  } catch (e) {
    console.log('USER2_NOT_FOUND:', e.code || e.message);
  }
}

run();
