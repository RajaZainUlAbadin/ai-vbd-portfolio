import { Job } from 'bullmq';
import { createWorker } from '../core/createWorker';
import { QUEUE_NAMES } from '../constants/queueNames';
import { AIService } from '@/modules/ai/ai.service';
import { logger } from '@/shared/logger/logger';
import { BaseQueueJob } from '../types/baseQueueJob';
import { AiAnalysisPayload } from '../types/aiAnalysisPayload';
import { LeadsRepository } from '@/modules/lead/leads.repository';
import { LeadStatus } from '@/modules/lead/model/lead.status';
import { FailureLogger } from '@/shared/errors/failureLogger.service';
import { FailureCategory } from '@/shared/errors/failureCategory';

export const aiAnalysisWorker = createWorker(
  QUEUE_NAMES.AI_ANALYSIS,

  async (job: Job<BaseQueueJob<AiAnalysisPayload>>) => {
    const { context, data } = job.data;
    const { leadId, scrapeResultId } = data;
    const { traceId } = context;

    try {
      const aiService = new AIService();
      const result = await aiService.analyzeBusiness(leadId, scrapeResultId);

      logger.info({
        module: 'ai-analysis',
        event: 'ai-analysis.completed',
        traceId,
        jobId: job.id,
        queue: QUEUE_NAMES.AI_ANALYSIS,
        leadId,
        scrapeResultId,
        aiAnalysisResultId: result.ai_analysis?.id,
      });

      await LeadsRepository.updateStatus(leadId, LeadStatus.ANALYZED);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      await FailureLogger.log({
        context,
        leadId,
        stage: 'AI_ANALYSIS',
        category: FailureCategory.AI_ANALYSIS_ERROR,
        message: err.message,
        error,
      });

      logger.error({
        module: 'ai-analysis',
        message: `AI Analysis Error: ${err.message}`,
        event: 'ai-analysis.failed',
        traceId,
        jobId: job.id,
        queue: QUEUE_NAMES.AI_ANALYSIS,
        leadId: leadId,
        scrapeResultId: scrapeResultId,
        error: err,
        stack: err.stack,
      });

      throw err;
    }

    // App execution service would enqueue the outreach jobs
    // const analysis = result.ai_analysis;
    // if (analysis && analysis.contacts && analysis.contacts.length > 0) {
    //   await LeadRepository.updateStatus(leadId, LeadStatus.OUTREACH_PENDING);

    //   await outreachQueue.add('send-outreach', {
    //     context,
    //     data: {
    //       // aiAnalysisId: analysis.id,
    //       leadId: leadId,
    //     } satisfies OutreachPayload,
    //   });
    // } else {
    //   await LeadRepository.updateStatus(leadId, LeadStatus.CONTACT_MISSING);
    // }
  },
);
