import { logger } from '@/shared/logger/logger';
import { queues } from '..';

export async function resetAllQueuesForDevelopment(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('resetAllQueuesForDevelopment() cannot run in production');
  }

  for (const queue of queues) {

    await queue.obliterate({
      force: true,
    });
    logger.info(`[BullMQ] Obliterated queue: ${queue.name}`);
  }
}
