import { Worker, Processor } from 'bullmq';
import { createWorkerConnection } from '@/infrastructure/redis/redis.client';
import { logger } from '@/shared/logger/logger';
import { WorkerHealthService } from './workerHealth.service';

export const createWorker = (queueName: string, processor: Processor) => {
  const worker = new Worker(queueName, processor, {
    connection: createWorkerConnection(),
    concurrency: 1,
    lockDuration: 300000, // 5 minutes
  });

  const heartbeat = async () => {
    try {
      await WorkerHealthService.heartbeat(queueName);
    } catch (error) {
      logger.error({
        event: 'worker.heartbeat.failed',
        queue: queueName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  worker.on('ready', async () => {
    await heartbeat();

    logger.info({
      queue: queueName,
      message: 'Worker ready',
    });
  });

  const heartbeatInterval = setInterval(heartbeat, 30000);
  heartbeat();

  worker.on('completed', (job) => {
    logger.info({
      queue: queueName,
      jobId: job.id,
      name: job.name,
      message: 'Job completed',
    });
  });

  worker.on('failed', (job, error) => {
    const traceId = job?.data?.context?.traceId;

    logger.error({
      event: 'worker.job.failed',
      traceId,
      queue: queueName,
      jobId: job?.id,
      jobName: job?.name,
      attemptsMade: job?.attemptsMade,
      maxAttempts: job?.opts?.attempts,
      error: error.message,
      message: 'Job failed',
    });
  });

  worker.on('error', (error) => {
    logger.error({
      queue: queueName,
      error: error.message,
      message: 'Worker crashed',
    });
  });

  // Clearing the interval on Worker close
  worker.on('closed', () => {
    clearInterval(heartbeatInterval);
  });

  return worker;
};
