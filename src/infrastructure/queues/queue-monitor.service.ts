import { QueueEvents } from 'bullmq';

import { createMonitorConnection } from '@/infrastructure/redis/redis.client';
import { logger } from '@/shared/logger/logger';
import { queues } from '.';

export class QueueMonitorService {
  private readonly queueEvents: Map<string, QueueEvents> = new Map();

  registerQueue(queueName: string): void {
    if (this.queueEvents.has(queueName)) {
      return;
    }

    const queueEvents = new QueueEvents(queueName, {
      connection: createMonitorConnection(),
    });

    queueEvents.on('failed', ({ jobId, failedReason }) => {
      logger.error({
        event: 'queue.job.failed',
        queue: queueName,
        jobId,
        failedReason,
      });
    });

    // queueEvents.on('completed', ({ jobId }) => {
    //   logger.info({
    //     event: 'queue.job.completed',
    //     queue: queueName,
    //     jobId,
    //   });
    // });

    queueEvents.on('stalled', ({ jobId }) => {
      logger.warn({
        event: 'queue.job.stalled',
        queue: queueName,
        jobId,
      });
    });

    queueEvents.on('error', (error) => {
      logger.error({
        event: 'queue.monitor.error',
        queue: queueName,
        error,
      });
    });

    queueEvents.on('retries-exhausted', ({ jobId, attemptsMade }) => {
      logger.error({
        event: 'queue.job.retries_exhausted',
        queue: queueName,
        jobId,
        attemptsMade,
      });
    });

    this.queueEvents.set(queueName, queueEvents);

    logger.info({
      event: 'queue.monitor.started',
      queue: queueName,
    });
  }

  async close(): Promise<void> {
    await Promise.all(
      Array.from(this.queueEvents.values()).map((queueEvents) =>
        queueEvents.close(),
      ),
    );

    this.queueEvents.clear();

    logger.info({
      event: 'queue.monitor.closed',
    });
  }
}

export const queueMonitor = new QueueMonitorService();

export const initializeQueueMonitoring = () => {
  for (const queue of queues) {
    queueMonitor.registerQueue(queue.name);
  }
};
