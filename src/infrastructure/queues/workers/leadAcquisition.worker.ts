import { Job } from 'bullmq';
import { createWorker } from '../core/createWorker';
import { QUEUE_NAMES } from '../constants/queueNames';
import { AcquisitionService } from '@/modules/acquisition/acquisition.service';
import { LeadAcquisitionPayload } from '../types/leadAcquisitionPayload';
import { BaseQueueJob } from '../types/baseQueueJob';
import { FailureLogger } from '@/shared/errors/failureLogger.service';
import { FailureCategory } from '@/shared/errors/failureCategory';
import { logger } from '@/shared/logger/logger';
import { ApplicationExecutionService } from '@/modules/application-settings/applicationExecution.service';
import { ProviderUnavailableError } from '@/modules/acquisition/acquisition-provider/errors/provider-unavailable.error';

//   LeadAcquisitionWorker
//  ├── Find/Create AcquisitionSearch
//  ├── Execute Provider Search
//  ├── Update Search Metrics
//  ├── AcquisitionService.processResults()
//  │        └── Create AcquisitionBatch
//  └── Continue Pipeline

// AcquisitionSearch
//     = Search Request History
// AcquisitionBatch
//     = Actual Results Returned
// AcquisitionIdentity
//     = Dedupe Layer
// Lead
//     = Unique Business

export const leadAcquisitionWorker = createWorker(
  QUEUE_NAMES.LEAD_ACQUISITION,

  async (job: Job<BaseQueueJob<LeadAcquisitionPayload>>) => {
    const { context, data } = job.data;

    const { provider, query, location } = data;

    logger.info({
      module: 'lead-acquisition-worker',
      event: 'lead-acquisition.started',
      message: 'Lead acquisition job started',
      jobId: job.id,
      provider,
      query,
      location,
      traceId: context.traceId,
    });

    try {
      const result = await AcquisitionService.acquire({
        context,
        provider,
        query,
        location,
      });

      for (const lead of result.newLeads) {
        const leadContext = {
          ...context,
          leadId: lead.id,
        };
        await ApplicationExecutionService.dispatchLeadForProcessing(
          lead,
          leadContext,
        );
      }

      logger.info({
        module: 'lead-acquisition-worker',
        event: 'lead-acquisition.completed',
        message: 'Lead acquisition job completed',
        jobId: job.id,
        provider,
        traceId: context.traceId,
      });
    } catch (error) {
      if (error instanceof ProviderUnavailableError) {
        logger.info({
          module: 'lead-acquisition-worker',
          event: 'lead-acquisition.skipped',
          message: `Provider ${provider} is currently unavailable`,
          provider,
          jobId: job.id,
          traceId: context.traceId,
        });

        return;
      }

      const err = error instanceof Error ? error : new Error(String(error));

      await FailureLogger.log({
        context,
        stage: 'lead-acquisition',
        category: FailureCategory.PROVIDER_ERROR,
        message: err.message,
        error,
      });

      logger.error({
        module: 'lead-acquisition-worker',
        event: 'lead-acquisition.failed',
        message: `Lead Acquisition Error: ${err.message}`,
        jobId: job.id,
        provider,
        traceId: context.traceId,
        queue: QUEUE_NAMES.LEAD_ACQUISITION,
        error: err,
        stack: err.stack,
      });

      throw err;
    }
  },
);
