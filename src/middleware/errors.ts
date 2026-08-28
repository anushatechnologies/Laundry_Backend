import type { NextFunction, Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} was not found.` });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error('Unhandled API error:', error);
  return res.status(500).json({ success: false, error: 'An unexpected server error occurred.' });
}
