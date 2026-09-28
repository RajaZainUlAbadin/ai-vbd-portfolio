import { Job } from 'bullmq';
import { createWorker } from '../core/createWorker';
import { QUEUE_NAMES } from '../constants/queueNames';
import { aiAnalysisQueue } from '@/infrastructure/queues';
import { QualificationService } from '@/modules/qualification/qualfication.service';
import { logger } from '@/shared/logger/logger';
import { qualificationConfig } from '@/modules/qualification/rules/qualification.config';
import { LeadQualificationPayload } from '../types/leadQualificationPayload';
import { BaseQueueJob } from '../types/baseQueueJob';
import { AiAnalysisPayload } from '../types/aiAnalysisPayload';
import { FailureLogger } from '@/shared/errors/failureLogger.service';
import { FailureCategory } from '@/shared/errors/failureCategory';
import { LeadsService } from '@/modules/lead/leads.service';
import { LeadStatus } from '@/modules/lead/model/lead.status';
import { ContactType } from '@/modules/lead/lead-contact/lead-contact.types';
import { DomainEvent } from '@/shared/events/domainEvents';

export const leadQualificationWorker = createWorker(
  QUEUE_NAMES.LEAD_QUALIFICATION,

  async (job: Job<BaseQueueJob<LeadQualificationPayload>>) => {
    const { context, data } = job.data;
    const { scrapeResultId, leadId, scrapeSkipped } = data;
    const { traceId } = context;

    try {
      const qualification = await QualificationService.qualifyLead({
        scrapeResultId,
        leadId,
        scrapeSkipped,
      });

      const lead = await LeadsService.getLeadById(leadId);

      if (!lead) {
        throw new Error('Lead not found');
      }

      // AI gating logic
      const hasUsableEmail = lead.contacts?.some(
        (contact) =>
          contact.type === ContactType.EMAIL && contact.confidence >= 50,
      );
      if (!hasUsableEmail) {
        logger.info({
          module: 'Lead Qualification',
          event: 'lead.email.contact.not.found',
          leadId: leadId,
          traceId: traceId,
          jobId: job.id,
          qualified: qualification?.qualified,
        });

        await LeadsService.updateStatus(leadId, LeadStatus.CONTACT_MISSING);
        return;
      }

      logger.info({
        module: 'Lead Qualification',
        event: 'lead.qualified',
        leadId: leadId,
        traceId: traceId,
        jobId: job.id,
        qualified: qualification?.qualified,
      });

      // if (qualification.score > qualificationConfig.minimumScore)
      await aiAnalysisQueue.add(DomainEvent.AI_ANALYSIS, {
        context,
        data: {
          leadId: String(qualification.leadId),
          scrapeResultId: String(qualification.scrapeResultId),
        } satisfies AiAnalysisPayload,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      await FailureLogger.log({
        context,
        leadId,
        stage: 'lead-qualification',
        category: FailureCategory.QUALIFICATION_ERROR,
        message: error instanceof Error ? error.message : String(error),
        error,
      });

      logger.error({
        module: 'lead-qualification',
        message: `Lead Qualification Error: ${err.message}`,
        event: 'lead-qualification.failed',
        traceId,
        jobId: job.id,
        queue: QUEUE_NAMES.LEAD_QUALIFICATION,
        leadId,
        error: err,
        stack: err.stack,
      });

      throw err;
    }
  },
);
