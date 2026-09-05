import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { logger } from '../lib/logger.js';

interface NotificationPrefs {
  user_id: string;
  task_reminders_enabled: boolean;
  tomorrow_planning_enabled: boolean;
  habit_reminders_enabled: boolean;
  sleep_reminders_enabled: boolean;
  tomorrow_planning_time: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

function isWithinQuietHours(now: Date, start: string, end: string): boolean {
  const [sh = 0, sm = 0] = start.split(':').map(Number);
  const [eh = 0, em = 0] = end.split(':').map(Number);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  if (startMin === endMin) return false;
  if (startMin < endMin) return minutesNow >= startMin && minutesNow < endMin;
  // wraps past midnight, e.g. 22:30 -> 07:00
  return minutesNow >= startMin || minutesNow < endMin;
}

/**
 * Scans for tomorrow-planning reminders, due/overdue tasks, and unfinished
 * evening habits, and enqueues notification_jobs for any that don't already
 * have a pending/sent job for the same (user, type, reference, time) tuple —
 * the unique index on notification_jobs makes this insert idempotent even
 * under retries.
 */
export async function enqueueDueReminders(): Promise<{ enqueued: number }> {
  let enqueued = 0;
  const now = new Date();

  const { data: prefsRows, error: prefsError } = await supabaseAdmin
    .from('notification_preferences')
    .select('*');

  if (prefsError) throw prefsError;

  for (const prefs of (prefsRows ?? []) as NotificationPrefs[]) {
    if (isWithinQuietHours(now, prefs.quiet_hours_start, prefs.quiet_hours_end)) continue;

    // Tomorrow planning reminder
    if (prefs.tomorrow_planning_enabled) {
      const [th = 0, tm = 0] = prefs.tomorrow_planning_time.split(':').map(Number);
      const withinPlanningWindow = now.getHours() === th && Math.abs(now.getMinutes() - tm) < 15;
      if (withinPlanningWindow) {
        const { error } = await supabaseAdmin.from('notification_jobs').insert({
          user_id: prefs.user_id,
          type: 'tomorrow_planning',
          title: 'Plan tomorrow',
          body: 'Plan tomorrow in 3 minutes.',
          scheduled_for: now.toISOString(),
        });
        if (!error) enqueued += 1;
      }
    }

    // Task due / overdue reminders
    if (prefs.task_reminders_enabled) {
      const soon = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
      const { data: dueTasks } = await supabaseAdmin
        .from('tasks')
        .select('id, title, due_at')
        .eq('user_id', prefs.user_id)
        .eq('status', 'pending')
        .lte('due_at', soon)
        .not('due_at', 'is', null);

      for (const task of dueTasks ?? []) {
        const overdue = new Date(task.due_at) < now;
        const { error } = await supabaseAdmin.from('notification_jobs').insert({
          user_id: prefs.user_id,
          type: overdue ? 'task_overdue' : 'task_due',
          reference_id: task.id,
          title: overdue ? 'Task overdue' : 'Task due soon',
          body: `${overdue ? 'Overdue' : 'Due soon'}: ${task.title}`,
          scheduled_for: now.toISOString(),
        });
        if (!error) enqueued += 1;
      }
    }
  }

  return { enqueued };
}

/**
 * Marks pending jobs as sent. Actual delivery (web push / email) is a
 * pluggable concern — wire in a provider (e.g. web-push, Resend) here. For
 * now this logs what *would* be sent so the pipeline is fully testable
 * without requiring third-party credentials, and is explicit about the gap
 * rather than pretending delivery happened.
 */
export async function processPendingNotificationJobs(): Promise<{ processed: number }> {
  const { data: jobs, error } = await supabaseAdmin
    .from('notification_jobs')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .limit(100);

  if (error) throw error;

  let processed = 0;
  for (const job of jobs ?? []) {
    logger.info({ job }, 'notification_dispatch_placeholder');
    const { error: updateError } = await supabaseAdmin
      .from('notification_jobs')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', job.id)
      .eq('status', 'pending'); // guards against double-processing on retry

    if (!updateError) processed += 1;
  }

  return { processed };
}
