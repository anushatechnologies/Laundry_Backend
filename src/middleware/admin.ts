import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';

function hasMatchingToken(candidate: string | undefined, expected: string): boolean {
  if (!candidate) return false;

  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  return candidateBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(candidateBuffer, expectedBuffer);
}

/**
 * Protects operations-only endpoints. The browser never receives this value:
 * the admin Next.js BFF forwards it from server-side environment variables.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const configuredToken = process.env.ADMIN_API_TOKEN?.trim();

  if (!configuredToken) {
    return res.status(503).json({
      success: false,
      error: 'Admin API is not configured. Set ADMIN_API_TOKEN on the backend and admin server.',
    });
  }

  const authorization = req.get('authorization');
  const bearerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
  const suppliedToken = req.get('x-admin-token') || bearerToken;

  if (!hasMatchingToken(suppliedToken, configuredToken)) {
    return res.status(401).json({ success: false, error: 'Administrator authorization is required.' });
  }

  return next();
}
