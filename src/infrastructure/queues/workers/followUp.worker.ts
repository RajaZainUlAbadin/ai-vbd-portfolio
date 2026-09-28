import { Job } from 'bullmq';
import { createWorker } from '../core/createWorker';
import { QUEUE_NAMES } from '../constants/queueNames';
import { FollowupService } from '@/modules/followup/followup.service';
import { BaseQueueJob } from '../types/baseQueueJob';
import { FollowupPayload } from '../types/followupPayload';
import { logger } from '@/shared/logger/logger';
import { FailureLogger } from '@/shared/errors/failureLogger.service';
import { FailureCategory } from '@/shared/errors/failureCategory';

export const followupWorker = createWorker(
  QUEUE_NAMES.FOLLOW_UP,
  async (job: Job<FollowupPayload>) => {
    const { leadId, recipient } = job.data;
    try {
      // const { context, data } = job.data;
      await FollowupService.sendFollowup(leadId, recipient);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      await FailureLogger.log({
        context: {
          acquisitionExecutionId: '',
          traceId: '',
          createdAt: new Date(),
        },
        leadId,
        stage: 'FOLLOWUP',
        category: FailureCategory.FOLLOWUP_ERROR,
        message: err.message,
        error,
      });

      logger.error({
        module: 'followup',
        message: `Followup Error: ${err.message}`,
        event: 'followup.failed',
        jobId: job.id,
        queue: QUEUE_NAMES.FOLLOW_UP,
        leadId,
        recipient,
        error: err,
        stack: err.stack,
      });

      throw err;
    }
  },
);
