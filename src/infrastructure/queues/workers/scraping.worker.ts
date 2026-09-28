import { Job } from 'bullmq';
import { createWorker } from '../core/createWorker';
import { QUEUE_NAMES } from '../constants/queueNames';
import { ScrapingService } from '@/modules/scraping/scraping.service';
import {
  aiAnalysisQueue,
  leadQualificationQueue,
} from '@/infrastructure/queues';
import { logger } from '@/shared/logger/logger';
import { LeadWebsiteValidator } from '@/modules/lead/utils/leadWebsiteValidator';
import { ScrapingPayload } from '../types/scrapingPayload';
import { BaseQueueJob } from '../types/baseQueueJob';
import { LeadQualificationPayload } from '../types/leadQualificationPayload';
import { FailureLogger } from '@/shared/errors/failureLogger.service';
import { FailureCategory } from '@/shared/errors/failureCategory';
import { DomainEvent } from '@/shared/events/domainEvents';

export const scrapingWorker = createWorker(
  QUEUE_NAMES.SCRAPING,

  async (job: Job<BaseQueueJob<ScrapingPayload>>) => {
    const { context, data } = job.data;
    const { leadId, website } = data;
    const { traceId } = context;

    if (!website || LeadWebsiteValidator.isInvalidWebsite(website)) {
      await leadQualificationQueue.add(DomainEvent.LEAD_QUALIFICATION_STARTED, {
        context,
        data: {
          leadId,
          scrapeSkipped: true,
        } satisfies LeadQualificationPayload,
      });

      return;
    }

    logger.info({
      module: 'scraping',
      message: 'Scraping started',
      event: 'scraping.started',
      traceId,
      jobId: job.id,
      queue: QUEUE_NAMES.SCRAPING,
      leadId,
      website,
    });

    try {
      const scrapeResult = await ScrapingService.scrapeWebsite(leadId, website);

      logger.info({
        module: 'scraping',
        message: 'Scraping completed',
        event: 'scraping.completed',
        traceId,
        jobId: job.id,
        queue: QUEUE_NAMES.SCRAPING,
        leadId,
        website,
      });

      await leadQualificationQueue.add(DomainEvent.LEAD_QUALIFICATION_STARTED, {
        context,
        data: {
          leadId: leadId,
          scrapeSkipped: false,
          scrapeResultId: scrapeResult.scrapeResultId,
        } satisfies LeadQualificationPayload,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      await FailureLogger.log({
        context,
        leadId,
        stage: 'SCRAPING',
        category: FailureCategory.SCRAPE_ERROR,
        message: error instanceof Error ? error.message : String(error),
        error,
      });

      logger.error({
        module: 'scraping',
        message: `Scraping Error: ${err.message}`,
        event: 'scraping.failed',
        traceId,
        jobId: job.id,
        queue: QUEUE_NAMES.SCRAPING,
        leadId,
        website,
        error: err,
        stack: err.stack,
      });

      throw err;
      // Re-throw the error to let BullMQ handle retries and failures
    }
  },
);
