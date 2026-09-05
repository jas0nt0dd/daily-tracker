import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { supabaseForUser } from '../lib/supabaseAdmin.js';
import { bundleToCsv, buildExportBundle } from '../services/exportService.js';
import { ApiError } from '../middleware/errorHandler.js';

export const exportsRouter = Router();

const requestSchema = z.object({
  format: z.enum(['csv', 'json']),
});

// Synchronous, on-demand export. A user's full lifetime dataset is small
// enough (personal-use scale) that we don't need a background job queue for
// v1 — this generates and returns the file directly in one request.
exportsRouter.post('/api/exports', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, 'format must be "csv" or "json"');

    const client = supabaseForUser(req.accessToken!);
    const bundle = await buildExportBundle(client, req.userId!);

    if (parsed.data.format === 'json') {
      res.setHeader('Content-Disposition', 'attachment; filename="daily-life-os-export.json"');
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(bundle, null, 2));
    }

    res.setHeader('Content-Disposition', 'attachment; filename="daily-life-os-export.csv"');
    res.setHeader('Content-Type', 'text/csv');
    res.send(bundleToCsv(bundle));
  } catch (err) {
    next(err);
  }
});
