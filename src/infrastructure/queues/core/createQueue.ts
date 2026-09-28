import { Queue } from 'bullmq';
import { createQueueConnection } from '@/infrastructure/redis/redis.client';

export const createQueue = (queueName: string) => {
  return new Queue(queueName, {
    connection: createQueueConnection(),

    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },

      removeOnComplete: 100,
      removeOnFail: 500,
    },
  });
};
