import path from 'path';
import fs from 'fs';
import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

let _app: App | null = null;

export function getFirebaseAdmin(): App {
  if (_app) return _app;
  if (getApps().length) { _app = getApp(); return _app; }

  // Check for raw JSON string in environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      _app = initializeApp({
        credential: cert(serviceAccount),
      });
      return _app;
    } catch (e) {
      console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', e);
    }
  }

  const serviceKeyPath = path.resolve(__dirname, '../../serviceAccountKey.json');
  if (fs.existsSync(serviceKeyPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceKeyPath, 'utf8'));
      _app = initializeApp({
        credential: cert(serviceAccount),
      });
      return _app;
    } catch (e) {
      console.warn('Failed to load serviceAccountKey.json:', e);
    }
  }

  const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');

  _app = initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  return _app;
}

/** Pre-built auth instance */
export function getFirebaseAuth(): Auth {
  getFirebaseAdmin(); // ensure app is initialised
  return getAuth();
}
