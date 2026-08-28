/**
 * Customer JWT token utilities
 *
 * Access token  : 15 minutes
 * Refresh token : 30 days
 *
 * Both are signed with separate secrets so a leaked refresh token
 * cannot be used to forge access tokens and vice-versa.
 */
import jwt from 'jsonwebtoken';

function getAccessSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) throw new Error('JWT_SECRET is not configured.');
  return secret;
}

function getRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET?.trim();
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not configured.');
  return secret;
}

export interface CustomerTokenPayload {
  uid:   string;   // Firebase UID
  customerId?: string;
  phone: string;
  name:  string;
  email: string;
  role:  'CUSTOMER';
}

/** Generate access token (15 min) */
export function signAccessToken(payload: CustomerTokenPayload): string {
  return jwt.sign(payload, getAccessSecret(), { expiresIn: '15m' });
}

/** Generate refresh token (30 days) */
export function signRefreshToken(uid: string, customerId?: string): string {
  return jwt.sign({ uid, customerId, role: 'CUSTOMER' }, getRefreshSecret(), { expiresIn: '30d' });
}

/** Verify access token — throws if invalid/expired */
export function verifyAccessToken(token: string): CustomerTokenPayload {
  return jwt.verify(token, getAccessSecret()) as CustomerTokenPayload;
}

/** Verify refresh token — returns { uid } or throws */
export function verifyRefreshToken(token: string): { uid: string; customerId?: string } {
  return jwt.verify(token, getRefreshSecret()) as { uid: string; customerId?: string };
}
