import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { supabaseForUser } from '../lib/supabaseAdmin.js';
import { ApiError } from '../middleware/errorHandler.js';

export const meRouter = Router();

meRouter.get('/api/me', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const client = supabaseForUser(req.accessToken!);
    const { data, error } = await client.from('profiles').select('*').eq('user_id', req.userId).single();

    if (error) throw new ApiError(500, 'Failed to load profile');

    res.json({ user_id: req.userId, profile: data });
  } catch (err) {
    next(err);
  }
});
