import { registerRepeatableJobs } from '@/infrastructure/queues/bootstrap/registerRepeatableJobs';
import { initializeQueueMonitoring } from '@/infrastructure/queues/bootstrap/queueMonitor';
import { connectMongo } from '@/infrastructure/database/mongo';

export const bootstrapApp = async () => {
  await connectMongo();
};

export const bootstrapWorkers = async () => {
  initializeQueueMonitoring();
  await registerRepeatableJobs();
};
