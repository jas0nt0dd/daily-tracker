import type { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/logger.js';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  const status = err instanceof ApiError ? err.status : 500;
  const message = err instanceof ApiError ? err.message : 'Internal server error';

  // Log full detail server-side only; never leak stack traces to the client.
  logger.error({ err, path: req.path, method: req.method }, 'request_error');

  res.status(status).json({ error: message });
}
