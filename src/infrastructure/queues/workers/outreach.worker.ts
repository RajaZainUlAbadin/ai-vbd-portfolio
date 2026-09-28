import { Job } from 'bullmq';
import { createWorker } from '../core/createWorker';
import { QUEUE_NAMES } from '../constants/queueNames';
import { OutreachService } from '@/modules/outreach/outreach/outreach.service';
import { BaseQueueJob } from '../types/baseQueueJob';
import { OutreachPayload } from '../types/outreachPayload';
import { logger } from '@/shared/logger/logger';
import { FailureLogger } from '@/shared/errors/failureLogger.service';
import { FailureCategory } from '@/shared/errors/failureCategory';

export const outreachWorker = createWorker(
  QUEUE_NAMES.OUTREACH,

  async (job: Job<BaseQueueJob<OutreachPayload>>) => {
    const { context, data } = job.data;
    const { leadId } = data;

    try {
      const result = await OutreachService.sendOutreach(leadId);
      console.log('Outreach completed:', result.outreachMessage.id);

      logger.info({
        module: 'Outreach',
        event: 'outreach.completed',
        traceId: context.traceId,
        jobId: job.id,
        queue: QUEUE_NAMES.OUTREACH,
        leadId,
        provider: result.provider,
        providerMessageId: result.providerMessageId,
        acquisitionExecutionId: '',
        campaignId: '',
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      await FailureLogger.log({
        context,
        leadId,
        stage: 'OUTREACH',
        category: FailureCategory.OUTREACH_ERROR,
        message: error instanceof Error ? error.message : String(error),
        error,
      });

      logger.error({
        module: 'outreach',
        message: `Outreach Error: ${err.message}`,
        event: 'outreach.failed',
        traceId: context.traceId,
        jobId: job.id,
        queue: QUEUE_NAMES.OUTREACH,
        leadId,
        error: err,
        stack: err.stack,
      });

      throw err;
    }
  },
);
