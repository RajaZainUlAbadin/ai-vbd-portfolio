import {
  applicationExecutionQueue,
  followupSchedulerQueue as followupSchedulerQueue,
  scrapeMaintenanceQueue,
} from '@/infrastructure/queues';

export const registerRepeatableJobs = async () => {
  const executionPattern =
    process.env.NODE_ENV === 'production'
      ? { every: 1000 * 60 * 60, tz: 'Asia/Dubai' }
      : { every: 1000 * 60 * 5 }; // every 5 minutes in development

  await applicationExecutionQueue.add(
    'application-execution',
    {},
    {
      jobId: 'application-execution-heartbeats',
      repeat: executionPattern,
    },
  );

  await followupSchedulerQueue.add(
    'leads-followups',
    {},
    {
      repeat: {
        every: 1000 * 60 * 60, // 60 minutes
      },
      removeOnComplete: true,
      removeOnFail: 100,
    },
  );

  await scrapeMaintenanceQueue.add(
    'clean-html-fields',
    {},
    {
      jobId: 'scrape-maintenance-clean-html-fields',
      repeat: {
        pattern: '0 2 * * *', // daily 2 AM
      },
      removeOnComplete: true,
      removeOnFail: 50,
    },
  );
};
