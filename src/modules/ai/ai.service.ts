import { AIRegistry } from '@/providers/ai/AIRegistry';
import { AIRepository } from './ai.repository';
import { AIProviderName } from './types/aiProviderName';
import { AIAnalysisInput } from '@/providers/ai/types/AIAnalysis';
import { ScrapeRepository } from '../scraping/scrape.repository';
import { ScrapeResultDocument } from '../scraping/model/scrapeResult.model';
import { logger } from '@/shared/logger/logger';
import { CostLedgerService } from '../cost-ledger/cost-ledger.service';
import { IAIAnalysis, OutreachMessage } from './model/aiAnalysis.interface';
import { OutreachMessageRepository } from '../outreach/outreach-message/outreachMessage.repository';
import { ILead } from '../lead/model/lead.interface';
import { LeadsRepository } from '../lead/leads.repository';
import { AIProvider } from '@/providers/ai/base/AIProvider';
import { AIResponseInput, ResponseType } from '@/providers/ai/types/AIResponse';
import { IOutreach } from '../outreach/outreach/model/outreach.interface';
import { toAiAnalysisDto } from './dto/aiAnalysisDto.mapper';

export class AIService {
  private readonly providerName: AIProviderName;
  private readonly provider: AIProvider;

  constructor(providerName: AIProviderName = 'openai') {
    this.providerName = providerName;
    this.provider = AIRegistry.get(providerName);
  }

  async analyzeBusiness(leadId: string, scrapeResultId?: string) {
    const lead = await LeadsRepository.findById(leadId);
    if (!lead) {
      throw new Error('Lead not found');
    }

    let scrapeResult: ScrapeResultDocument | undefined = undefined;
    if (scrapeResultId) {
      // const fetched = await ScrapeRepository.findLatestByLeadId(leadId);
      const fetched = await ScrapeRepository.findById(scrapeResultId);
      scrapeResult = fetched ?? undefined;
    }

    const input = this.buildAnalysisInput(lead, scrapeResult);
    // console.log('analysis inpt: ', input);

    try {
      const { metadata, analysis } = await this.provider.analyzeBusiness(input);

      const ai_analysis = await AIRepository.create({
        ...analysis,
        leadId,
        scrapeResultId,
        provider: this.providerName,
        model: metadata.model,
      });

      // update lead contacts
      if (analysis.contacts.length) {
        await LeadsRepository.mergeContacts(leadId, analysis.contacts);
      }

      await CostLedgerService.recordAICost({
        leadId,
        amount: metadata.estimatedCostUsd,
        model: metadata.model,
        referenceId: analysis.id,
      });

      // Update lead contacts

      return { metadata, ai_analysis };
    } catch (error) {
      logger.error(`Error during AI analysis: ${error}`);
      return { analysis_input: input };
    }

    // return {
    //   leadId,9l
    //   scrapeResultId,
    //   ...input,
    // };
  }

  private buildAnalysisInput(
    lead: ILead,
    scrapeResult?: ScrapeResultDocument,
  ): AIAnalysisInput {
    // const contacts = mapContactInfoToLeadContact(
    //   scrapeResult?.contactInfo ?? {
    //     emails: [],
    //     phones: [],
    //   },
    // );

    return {
      leadId: lead.id,

      businessName: lead.businessName,
      website: lead.website,
      category: lead.categories.join(', '),

      address: lead.address,
      // contacts: lead?.contacts || [],
      // contacts,

      source: lead.provider,

      websiteAnalysis: scrapeResult
        ? {
            title: scrapeResult.title ?? undefined,
            technologies: scrapeResult.technologies || [],
            seo: scrapeResult.seo
              ? {
                  h1: scrapeResult.seo.h1,
                  metaTitle: scrapeResult.seo.metaTitle ?? undefined,
                  metaDescription:
                    scrapeResult.seo.metaDescription ?? undefined,
                }
              : undefined,

            performance: scrapeResult.performance
              ? {
                  loadTimeMs: scrapeResult.performance.loadTimeMs ?? undefined,
                }
              : undefined,
          }
        : undefined,
    };
  }

  async generateResponse(
    outreach: IOutreach,
    responseType: ResponseType = ResponseType.FOLLOW_UP,
  ): Promise<OutreachMessage> {
    let analysis: IAIAnalysis | null = null;
    if (outreach.aiAnalysisId)
      analysis = await AIRepository.findById(outreach.aiAnalysisId);

    // load previous messages
    const conversation =
      await OutreachMessageRepository.findMessagesByOutreachId(outreach.id);

    const input: AIResponseInput = {
      goal: responseType,

      sequence: {
        step: outreach.sequenceStep,
        maxSteps: 4,
      },

      analysis: analysis
        ? {
            businessName: analysis.businessName,
            businessSummary: analysis.businessSummary,
            qualification: analysis.qualification
              ? analysis.qualification.reason
              : '',
            primaryPainPoint: analysis.primaryPainPoint,
            painPoints: analysis.painPoints,
          }
        : null,

      messages: conversation
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((message) => ({
          direction: message.direction,
          subject: message.subject,
          message: message.message,
          createdAt: message.createdAt,
        })),
    };

    const { message, metadata } = await this.provider.generateResponse(input);

    await CostLedgerService.recordAICost({
      leadId: outreach.leadId,
      amount: metadata.estimatedCostUsd,
      model: metadata.model,
      referenceId: outreach.id,
    });

    return message;
  }

  static async latestByLeadId(leadId: string) {
    const analysis = await AIRepository.findLatestByLeadId(leadId);

    return analysis ? toAiAnalysisDto(analysis) : null;
  }
}
