import mongoose, { AnyBulkWriteOperation } from 'mongoose';

import { ILead } from './model/lead.interface';
import { LeadRecord } from './model/lead.model';
import { LeadStatus } from './model/lead.status';
import { LeadsRepository } from './leads.repository';

import { logger } from '@/shared/logger/logger';
import { OutreachRepository } from '../outreach/outreach/outreach.repository';
import { OutreachMessageRepository } from '../outreach/outreach-message/outreachMessage.repository';
import { LeadTimelineEvent } from './dto/LeadTimelineEvent.dto';
import { AIService } from '../ai/ai.service';
import { toBackendLeadStatus, toLeadDto } from './dto/lead.dto.mapper';
import { AiAnalysisDto } from '../ai/dto/aiAnalysis.dto';
import { OutreachService } from '../outreach/outreach/outreach.service';
import { GetLeadsParams } from './types/getLeadsParams.types';
import { Lead_website } from './dto/website.dto';
import { WebsiteLeadMapper } from './dto/website.dto.mapper';
import { EmailService } from '@/providers/communication/email/EmailService';
import { EmailTemplateService } from '@/providers/communication/email/EmailTemplateService';

export class LeadsService {
  static async bulkWrite(operations: AnyBulkWriteOperation<LeadRecord>[]) {
    return LeadsRepository.bulkWrite(operations);
  }

  static async createLead(data: ILead) {
    try {
      const existingLead = await LeadsRepository.findByDedupeHash(
        data.dedupeHash,
      );

      if (existingLead) {
        return {
          created: false,
          lead: existingLead,
        };
      }

      const lead = await LeadsRepository.create({
        ...data,
        status: LeadStatus.NEW,
      });

      return {
        created: true,
        lead,
      };
    } catch (error) {
      logger.error(`Error creating lead: ${error}`);
      throw error;
    }
  }

  static async getLeadById(leadId: string): Promise<ILead | null> {
    return LeadsRepository.findById(leadId);
  }

  static async getPendingFollowups() {
    return LeadsRepository.findPendingFollowups();
  }

  static async getAcquisitionExecutionId(
    leadId: string,
  ): Promise<string | null> {
    return LeadsRepository.getAcquisitionExecutionId(leadId);
  }

  // Status
  static async updateStatus(
    leadId: string,
    status: LeadStatus,
  ): Promise<ILead> {
    return LeadsRepository.updateStatus(leadId, status);
  }

  // Status transition: OUTREACHED -> RESPONDED
  static async markResponded(leadId: string) {
    const lead = await LeadsRepository.findById(leadId);
    if (!lead) return;

    await LeadsRepository.update(leadId, {
      status: LeadStatus.RESPONDED,
      score: (lead.score ?? 0) + 50,
      repliedAt: new Date(),
      lastEngagementAt: new Date(),
    });
  }

  static async countPendingOutreach(count?: number): Promise<number> {
    // const settings = await ApplicationSettingsService.getSettings();

    return LeadsRepository.countPipelineBacklog();
  }

  // Dashboard APIs
  static async getLeads(params: GetLeadsParams = {}) {
    if (params.status) {
      params = {
        ...params,
        status: toBackendLeadStatus(params.status as any) as
          | LeadStatus
          | LeadStatus[]
          | undefined,
      };
    }
    const result = await LeadsRepository.getLeads(params);

    return {
      items: result.items.map((lead) => toLeadDto(lead)),

      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  static async getLead_dashboardObject(leadId: string) {
    const lead = await this.getLeadById(leadId);
    return lead ? toLeadDto(lead) : null;
  }

  static async getLeadWithTimeline(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid lead ID');
    }

    const lead = await LeadsRepository.findById(id);

    if (!lead) {
      throw new Error('Lead not found');
    }

    // const [aiAnalysis, outreaches] = await Promise.all([
    //   AIRepository.findLatestByLeadId(id),
    //   OutreachRepository.findAllByLeadId(id),
    // ]);

    const outreaches = await OutreachRepository.findAllByLeadId(id);

    const timeline: LeadTimelineEvent[] = [
      {
        type: 'LEAD_CREATED',
        title: 'Lead acquired',
        description: `Lead acquired from ${lead.provider}`,
        timestamp: lead.createdAt,
      },
    ];

    if (outreaches && outreaches.length > 0) {
      const outreachIds = outreaches.map((outreach) => outreach.id);

      for (const outreach of outreaches) {
        timeline.push({
          type: 'OUTREACH_CREATED',
          title: 'Outreach conversation started',
          description: `Sequence step ${outreach.sequenceStep}`,
          timestamp: outreach.createdAt,
          metadata: {
            outreachId: outreach.id,
          },
        });
      }

      const messages =
        await OutreachMessageRepository.findByOutreachIds(outreachIds);

      for (const message of messages) {
        const isInbound = message.direction === 'inbound';

        timeline.push({
          type: isInbound ? 'MESSAGE_RECEIVED' : 'MESSAGE_SENT',
          title: isInbound ? 'Client replied' : 'Message sent',
          description: message.subject ?? '',
          timestamp: message.sentAt ?? message.createdAt,

          metadata: {
            outreachId: message.outreachId.toString(),
            messageId: message.id,
            channel: message.channel,
          },
        });
      }
    }

    timeline.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return timeline;
    // return {
    //   lead,
    //   aiAnalysis,
    //   outreaches,
    //   timeline,
    // };
  }

  static async generateAIAnalysis(id: string) {
    // can generate a fresh Scrapping as well. then
    // analyzeBusiness(id, scrapId)

    const aiService = new AIService();
    const analysis = await aiService.analyzeBusiness(id);
    return analysis.ai_analysis;
  }

  static async getOutreachSequence(id: string) {
    return OutreachService.getOutreachSequenceByLeadId(id);
  }

  static async getAIAnalysis(leadId: string): Promise<AiAnalysisDto> {
    const analysis = await AIService.latestByLeadId(leadId);

    if (!analysis) throw new Error("AI_Analysis doesn't exist");

    return analysis;
  }

  static async getScrapeResult(leadId: string): Promise<AiAnalysisDto> {
    const scrapping = await AIService.latestByLeadId(leadId);

    if (!scrapping) throw new Error("Scrape results don't exist");

    return scrapping;
  }

  static async processLeadFromWebsite(payload: Lead_website) {
    const leadPayload = WebsiteLeadMapper.toILead(payload);

    const lead = await LeadsRepository.upsert(leadPayload as ILead);

    try {
      const emailTemplate = EmailTemplateService.fetchTemplate(payload);

      const emailResult = await EmailService.send({
        to: payload.email,

        subject: emailTemplate.subject,

        html: emailTemplate.html,

        from: 'Team | Nestra Technologies <hello@nestratech.com>',
      });

      return {
        leadId: lead.id,

        emailSent: emailResult.success,
      };
    } catch (error) {
      logger.error(
        {
          error,
          leadId: lead.id,
          source: payload.source,
        },
        'Lead created but confirmation email failed.',
      );

      return {
        leadId: lead.id,
        emailSent: false,
      };
    }
  }

  // static async migrateLeadContacts() {
  //   const cursor = LeadsRepository.cursor();

  //   let totalLeads = 0;
  //   let migrated = 0;
  //   let contactsCreated = 0;
  //   let skipped = 0;

  //   for await (const lead of cursor) {
  //     totalLeads++;

  //     const contacts = [];

  //     /**
  //      * Legacy Email
  //      */
  //     if (lead.email?.trim()) {
  //       contacts.push({
  //         type: ContactType.EMAIL,
  //         value: lead.email.trim().toLowerCase(),

  //         source: ContactSource.PROVIDER,

  //         status: ContactStatus.ACTIVE,

  //         confidence: 100,

  //         verified: false,

  //         isPrimary: true,
  //       });
  //     }

  //     /**
  //      * Legacy Phone
  //      */
  //     if (lead.phone?.trim()) {
  //       contacts.push({
  //         type: ContactType.PHONE,
  //         value: lead.phone.trim(),

  //         source: ContactSource.PROVIDER,

  //         status: ContactStatus.ACTIVE,

  //         confidence: 100,

  //         verified: false,

  //         isPrimary: contacts.length === 0,
  //       });
  //     }

  //     /**
  //      * Remove duplicates
  //      */

  //     const uniqueContacts = contacts.filter(
  //       (contact, index, self) =>
  //         index ===
  //         self.findIndex(
  //           (c) =>
  //             c.type === contact.type &&
  //             c.value.toLowerCase() === contact.value.toLowerCase(),
  //         ),
  //     );

  //     await LeadsRepository.updateContacts(lead._id.toString(), uniqueContacts);

  //     migrated++;
  //     contactsCreated += uniqueContacts.length;

  //     if (!uniqueContacts.length) {
  //       skipped++;
  //     }
  //   }

  //   return {
  //     success: true,
  //     totalLeads,
  //     migrated,
  //     contactsCreated,
  //     skippedWithoutContacts: skipped,
  //   };
  // }
}
