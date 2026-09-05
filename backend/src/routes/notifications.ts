import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { enqueueDueReminders, processPendingNotificationJobs } from '../services/notificationService.js';
import { env } from '../config/env.js';
import { ApiError } from '../middleware/errorHandler.js';

export const notificationsRouter = Router();
export const jobsRouter = Router();

// Lets the signed-in user send themselves an immediate test notification,
// bypassing the schedule (but still subject to their enabled/disabled prefs).
notificationsRouter.post('/api/notifications/test', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('notification_jobs').insert({
      user_id: req.userId,
      type: 'task_due',
      title: 'Test notification',
      body: 'This is a test notification from Daily Life OS.',
      scheduled_for: new Date().toISOString(),
    });
    if (error) throw new ApiError(500, 'Failed to queue test notification');

    const result = await processPendingNotificationJobs();
    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
});

// Invoked by a scheduler (Render Cron Job) every 5-15 minutes. Protected by a
// shared secret rather than end-user auth, since no browser session exists.
jobsRouter.post('/api/jobs/process-reminders', async (req, res, next) => {
  try {
    const secret = req.headers['x-cron-secret'];
    if (secret !== env.CRON_SECRET) {
      throw new ApiError(401, 'Invalid cron secret');
    }

    const enqueueResult = await enqueueDueReminders();
    const processResult = await processPendingNotificationJobs();

    res.json({ ok: true, ...enqueueResult, ...processResult });
  } catch (err) {
    next(err);
  }
});
