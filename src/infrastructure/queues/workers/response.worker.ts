import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../constants/queueNames';
import { createWorker } from '../core/createWorker';
import { responsePayload } from '../types/responsePayload';
import { logger } from '@/shared/logger/logger';
import { OutreachService } from '@/modules/outreach/outreach/outreach.service';

export const responseWorker = createWorker(
  QUEUE_NAMES.RESPONSE,
  async (job: Job<responsePayload>) => {
    const { messageId } = job.data;
    try {
      const result = await OutreachService.sendResponse(messageId);

      console.log('Outreach completed:', result.outreachMessage.id);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error({
        module: 'client message response ',
        event: 'response.failed',
        jobId: job.id,
        queue: QUEUE_NAMES.RESPONSE,
        messageId,
        error: err,
        stack: err.stack,
      });

      throw err;
      // Re-throw the error to ensure the job is marked as failed
    }
  },
);
