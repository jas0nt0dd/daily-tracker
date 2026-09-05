import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { supabaseForUser } from '../lib/supabaseAdmin.js';
import { getMonthlyInsights, getWeeklyInsights } from '../services/insightsService.js';

export const insightsRouter = Router();

insightsRouter.get('/api/insights/weekly', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const client = supabaseForUser(req.accessToken!);
    const result = await getWeeklyInsights(client, req.userId!);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

insightsRouter.get('/api/insights/monthly', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const month = typeof req.query.month === 'string' ? req.query.month : new Date().toISOString().slice(0, 7) + '-01';
    const client = supabaseForUser(req.accessToken!);
    const result = await getMonthlyInsights(client, req.userId!, month);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
