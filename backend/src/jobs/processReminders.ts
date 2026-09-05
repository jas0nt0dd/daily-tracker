import { enqueueDueReminders, processPendingNotificationJobs } from '../services/notificationService.js';
import { logger } from '../lib/logger.js';

async function main() {
  const enqueueResult = await enqueueDueReminders();
  const processResult = await processPendingNotificationJobs();
  logger.info({ ...enqueueResult, ...processResult }, 'process_reminders_run_complete');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error({ err }, 'process_reminders_run_failed');
    process.exit(1);
  });
