import type { NextFunction, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

export interface AuthedRequest extends Request {
  userId?: string;
  accessToken?: string;
}

/**
 * Verifies the bearer token against Supabase and attaches the authenticated
 * user's id to the request. The identity is ALWAYS derived from the verified
 * token — request bodies are never trusted for user_id (see BACKEND SECURITY
 * in the product spec).
 */
export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;

  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  req.userId = data.user.id;
  req.accessToken = token;
  next();
}
