import { Job } from 'bullmq';
import { createWorker } from '../core/createWorker';
import { QUEUE_NAMES } from '../constants/queueNames';
import { followUpQueue } from '@/infrastructure/queues';
import { LeadsService } from '@/modules/lead/leads.service';
import { PendingFollowup } from '@/modules/followup/types/pending-followup';
import { FollowupPayload } from '../types/followupPayload';
import { logger } from '@/shared/logger/logger';

export const followupSchedulerWorker = createWorker(
  QUEUE_NAMES.FOLLOWUP_SCHEDULER,

  async (_job: Job) => {
    try {
      const followups: PendingFollowup[] =
        await LeadsService.getPendingFollowups();

      for (const followup of followups) {
        const job = await followUpQueue.add(
          'send-followup',
          {
            leadId: followup.leadId,
            recipient: followup.recipient,
          } as FollowupPayload,
          {
            jobId: `followup-${followup.leadId}-${followup.recipient}-${Date.now()}`,
          },
        );
        logger.info(`Followup job added: ${job.id}`);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error({
        module: 'followup-scheduler',
        message: `Followup Scheduler Error: ${err.message}`,
        event: 'followup-scheduler.failed',
        queue: QUEUE_NAMES.FOLLOWUP_SCHEDULER,
        error: err,
        stack: err.stack,
      });

      throw err;
    }
  },
);
