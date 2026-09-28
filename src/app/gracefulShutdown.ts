import mongoose from 'mongoose';
import { logger } from '@/shared/logger/logger';
import { healthRedis } from '@/infrastructure/redis/redis.client';
import { browserManager } from '@/infrastructure/browser/browserManager';
import { queues } from '@/infrastructure/queues';
import { workers } from '@/infrastructure/queues/workers';
import { queueMonitor } from '@/infrastructure/queues/queue-monitor.service';

let shuttingDown = false;

export const registerShutdown = (server: any) => {
  const shutdown = async (signal: string) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    logger.info({
      signal,
      message: 'Shutting down gracefully...',
    });

    const forceShutdown = setTimeout(() => {
      logger.error('Forced shutdown');
      process.exit(1);
    }, 10_000);

    try {
      // 1. Stop accepting new HTTP requests
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });

      // 2. Stop workers and wait for active jobs to finish
      await Promise.all(workers.map((worker) => worker.close()));

      // 3. Stop QueueEvents / monitoring connections
      await queueMonitor.close();

      // 4. Close BullMQ queues
      await Promise.all(queues.map((queue) => queue.close()));

      // 5. Close application-owned Redis connection
      await healthRedis.quit();

      // 6. Close MongoDB
      await mongoose.disconnect();

      // 7. Close browser
      await browserManager.close();

      clearTimeout(forceShutdown);

      logger.info('Shutdown complete');

      process.exit(0);
    } catch (error) {
      clearTimeout(forceShutdown);

      logger.error(
        {
          error: error instanceof Error ? error.message : String(error),
        },
        'Graceful shutdown failed',
      );

      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};
