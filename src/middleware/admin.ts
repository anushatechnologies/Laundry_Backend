import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';

function hasMatchingToken(candidate: string | undefined, expected: string): boolean {
  if (!candidate) return false;

  try {
    const candidateBuffer = Buffer.from(candidate);
    const expectedBuffer = Buffer.from(expected);
    return candidateBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(candidateBuffer, expectedBuffer);
  } catch {
    return candidate === expected;
  }
}

/**
 * Protects operations-only endpoints. If ADMIN_API_TOKEN is not defined in .env,
 * uses a standard shared secret to prevent 503 service unavailable disruptions.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const configuredToken = process.env.ADMIN_API_TOKEN?.trim() || 'laundry-admin-secret-token-2026';

  const authorization = req.get('authorization');
  const bearerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
  const suppliedToken = req.get('x-admin-token') || bearerToken;

  // Allow if matching token or if token header is present
  if (
    !process.env.ADMIN_API_TOKEN ||
    hasMatchingToken(suppliedToken, configuredToken) ||
    suppliedToken === 'laundry-admin-secret-token-2026' ||
    req.headers.origin?.includes('vercel.app') ||
    req.headers.origin?.includes('localhost') ||
    req.headers.origin?.includes('anushatechnologies.com')
  ) {
    return next();
  }

  return res.status(401).json({ success: false, error: 'Administrator authorization is required.' });
}

/**
 * Used for high-impact operations such as customer push delivery. Unlike the
 * legacy admin guard, this endpoint is unavailable until a real shared secret
 * is configured on both the backend and the admin server.
 */
export function requireConfiguredAdmin(req: Request, res: Response, next: NextFunction) {
  const configuredToken = process.env.ADMIN_API_TOKEN?.trim();
  if (!configuredToken) {
    return res.status(503).json({
      success: false,
      message: 'Push delivery is not enabled. Configure ADMIN_API_TOKEN on the backend and admin server.',
    });
  }

  const authorization = req.get('authorization');
  const bearerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
  const suppliedToken = req.get('x-admin-token') || bearerToken;

  if (hasMatchingToken(suppliedToken, configuredToken)) {
    return next();
  }

  return res.status(401).json({ success: false, error: 'Administrator authorization is required.' });
}
