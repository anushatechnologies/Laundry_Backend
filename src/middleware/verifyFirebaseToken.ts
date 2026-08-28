/**
 * verifyFirebaseToken middleware
 *
 * Reads the `Authorization: Bearer <idToken>` header,
 * verifies it with Firebase Admin SDK, and attaches the
 * decoded token to `req.firebaseUser`.
 *
 * Usage in a route:
 *   router.post('/register', verifyFirebaseToken, handler)
 */
import type { Request, Response, NextFunction } from 'express';
import { getFirebaseAuth } from '../lib/firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

// Extend Express Request so TypeScript knows about firebaseUser
declare global {
  namespace Express {
    interface Request {
      firebaseUser?: DecodedIdToken;
    }
  }
}


export async function verifyFirebaseToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization ?? '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ success: false, message: 'Missing Firebase ID token.' });
    return;
  }

  try {
    const decoded      = await getFirebaseAuth().verifyIdToken(token);
    req.firebaseUser   = decoded;
    next();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Token verification failed';
    res.status(401).json({ success: false, message: `Unauthorised: ${msg}` });
  }
}
