import { OutreachRepository } from './outreach.repository';
import { EmailService } from '@/providers/communication/email/EmailService';
import { LeadStatus } from '../../lead/model/lead.status';
import { LeadsRepository } from '../../lead/leads.repository';
import { addDays } from '@/shared/utils/date.util';
import { OutreachMessageRepository } from '../outreach-message/outreachMessage.repository';
import { AIRepository } from '../../ai/ai.repository';
import {
  ContactStatus,
  ContactType,
} from '../../lead/lead-contact/lead-contact.types';
import { logger } from '@/shared/logger/logger';
import { removeJob } from '@/infrastructure/queues/core/removeJob';
import { followUpQueue } from '@/infrastructure/queues';
import { CreateOutreachMessageInput } from './types/CreateOutreachMessageInput';
import {
  DispatchMessageInput,
  DispatchMessageResult,
} from './types/dispatch-message';
import { LeadContact } from '@/modules/lead/lead-contact/lead-contact.schema';
import { LeadContactService } from '@/modules/lead/lead-contact/lead-contact.service';
import { AIService } from '@/modules/ai/ai.service';
import { ResponseType } from '@/providers/ai/types/AIResponse';
import { OutreachStatus } from './model/outreach.status';
import mongoose from 'mongoose';
import { IOutreach } from './model/outreach.interface';
import {
  PaginatedResult,
  PaginationParams,
} from '@/shared/types/pagination.interface';
import {
  OutreachSequenceStepDto,
  OutreachSequenceStepStatus,
} from '../dto/outreachSequenceStep.dto';
import { LeadsService } from '@/modules/lead/leads.service';
import { OutreachMessageStatus } from '../outreach-message/model/outreachMessage.status';
import { OutreachListQuery } from './dto/outreachListQuery.dto';
import { OutreachListItem } from './dto/outreachlistItem.dto';

export class OutreachService {
  static async sendOutreach(leadId: string, leadContactId?: string) {
    const lead = await LeadsRepository.findById(leadId);
    if (!lead) throw new Error('Lead not found');

    // Prevent duplication
    if (
      lead.status === LeadStatus.CONTACTED ||
      lead.status === LeadStatus.ENGAGED ||
      lead.status === LeadStatus.RESPONDED
    ) {
      throw new Error(
        `Lead ${lead.id} cannot receive initial outreach in status ${lead.status}.`,
      );
    }

    const analysis = await AIRepository.findLatestByLeadId(leadId);
    if (!analysis) {
      throw new Error('AI analysis not found');
    }

    if (!analysis.personalizedOutreach)
      throw new Error(`Lead Id ${leadId}: AI Analysis didn't found`);

    const leadContact = leadContactId
      ? (lead.contacts.find((contact) => contact.id === leadContactId) ?? null)
      : LeadContactService.getBestContact(lead.contacts, ContactType.EMAIL);

    if (!leadContact || !leadContact.id) throw new Error('Lead email missing');

    if (leadContact.type !== ContactType.EMAIL) {
      throw new Error('Selected contact is not an email contact');
    }

    if (leadContact.status !== ContactStatus.ACTIVE) {
      throw new Error(`Contact ${leadContact.value} is not active`);
    }

    const outreach = await OutreachRepository.create({
      leadId,
      leadContactId: leadContact.id,
      aiAnalysisId: analysis.id,
      provider: 'aws-ses',
      recipient: leadContact.value,
    });

    if (!outreach) throw new Error('Failed to create outreach record');

    const html = await EmailService.renderEmailHtml({
      contact: leadContact,
      businessName: lead.businessName,
      message: analysis.personalizedOutreach,
    });

    const subject =
      analysis.personalizedOutreach.subject ||
      'Digital analysis for your business';

    const outreachMessage = await this.createOutreachMessage({
      outreachId: outreach.id,
      direction: 'outbound',
      to: leadContact.value,
      subject: subject,
      message: html,
    });

    if (!outreachMessage) throw new Error('Outreach message creation failed');

    const dispatchResult = await this.dispatchMessage({
      recipient: leadContact.value,
      message: outreachMessage,
    });

    if (!dispatchResult.success) {
      return dispatchResult;
    }

    await OutreachRepository.touch(String(outreach.id));

    await LeadsRepository.update(leadId, {
      status: LeadStatus.CONTACTED,
      outreachCount: (lead.outreachCount || 0) + 1,
      outreachSequenceStep: 1,
      lastOutreachAt: new Date(),
      // nextFollowupAt: addMinutes(new Date(), 1),
      nextFollowupAt: addDays(new Date(), 3),
      currentOutreachId: outreach.id,
    });

    return dispatchResult;
  }

  static async createOutreachMessage({
    outreachId,
    direction = 'outbound',
    to,
    subject,
    message,
  }: CreateOutreachMessageInput) {
    const lastMessage =
      await OutreachMessageRepository.findLatestByOutreachId(outreachId);

    const channel = lastMessage?.channel ?? 'email';
    const provider = lastMessage?.provider ?? 'aws-ses';

    return OutreachMessageRepository.create({
      outreachId: outreachId,
      channel,
      direction,
      provider,
      from: 'SYSTEM',
      to,
      subject,
      message,
    });
  }

  static async dispatchMessage({
    recipient,
    message,
  }: DispatchMessageInput): Promise<DispatchMessageResult> {
    const response: DispatchMessageResult = {
      success: false,
      outreachMessage: message,
    };

    try {
      const providerResult = await EmailService.send({
        to: recipient,
        subject: message.subject || 'Digital analysis for your business',
        html: message.message || '',
      });

      const updatedMessage = await OutreachMessageRepository.markSent(
        message.id,
        providerResult.provider,
        providerResult.providerMessageId,
      );

      response.success = true;
      response.outreachMessage = updatedMessage!;
      response.provider = providerResult.provider;
      response.providerMessageId = providerResult.providerMessageId;
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      const updatedMessage = await OutreachMessageRepository.markFailed(
        message.id,
        errorMessage,
      );

      response.success = false;
      response.outreachMessage = updatedMessage!;
      response.error = errorMessage;
      response.provider = message.provider;
      logger.error(
        `Failed to dispatch outreach message ${message.id}: ${errorMessage}`,
      );
    }
    return response;
  }

  // Load context
  static async loadContext(providerMessageId: string) {
    const message =
      await OutreachMessageRepository.findByProviderMessageId(
        providerMessageId,
      );

    if (!message) return null;

    const outreach = await OutreachRepository.findById(
      String(message.outreachId),
    );

    if (!outreach)
      return {
        message,
        outreach: null,
        lead: null,
      };

    const lead = await LeadsRepository.findById(String(outreach.leadId));

    return {
      message,
      outreach,
      lead,
    };
  }

  static async sendResponse(
    inboundMessageId: string,
  ): Promise<DispatchMessageResult> {
    // Loading context
    const inbound = await OutreachMessageRepository.findById(inboundMessageId);
    if (!inbound) throw new Error('Inbound message not found');

    const outreach = await OutreachRepository.findById(inbound.outreachId);
    if (!outreach) throw new Error('Outreach not found');

    const lead = await LeadsRepository.findById(outreach.leadId);
    if (!lead) {
      throw new Error(`Lead not found ${outreach.leadId}`);
    }

    let leadContact: LeadContact | null =
      lead.contacts.find((c) => c.id === outreach.leadContactId) ?? null;

    if (!leadContact && outreach.recipient) {
      leadContact = await LeadsRepository.loadContactByEmail(
        outreach.recipient,
      );
    }
    if (!leadContact) {
      throw new Error(`Lead contact ${outreach.recipient} not found.`);
    }

    // AI response request
    const aiService = new AIService();
    const aiResponse = await aiService.generateResponse(
      outreach,
      ResponseType.REPLY,
    );

    const html = await EmailService.renderEmailHtml({
      contact: leadContact,
      businessName: lead.businessName,
      message: aiResponse,
    });

    const responseMessage = await OutreachService.createOutreachMessage({
      outreachId: outreach.id,
      parentMessageId: inbound.id,
      direction: 'outbound',
      to: leadContact.value,
      subject: aiResponse.subject,
      message: html,
    });

    const dispatchResult = await OutreachService.dispatchMessage({
      recipient: leadContact.value,
      message: responseMessage,
    });

    if (!dispatchResult.success) {
      return dispatchResult;
    }

    await OutreachRepository.touch(outreach.id);
    await OutreachRepository.markResponded(outreach.id);
    await OutreachMessageRepository.markResponded(inbound.id);

    return dispatchResult;
  }

  static async handleOutreachRejected(
    outreachId: string,
    outreachMessageId: string,
    reason?: string,
  ) {
    logger.info(`Outreach message rejected: MessageId: ${outreachMessageId}`);
    await OutreachRepository.markFailed(outreachId);
    await OutreachMessageRepository.markFailed(
      outreachMessageId,
      reason ?? 'Email rejected by SES',
    );
    await removeJob(followUpQueue, outreachId);
  }

  static async handleRenderingFailure(
    outreachId: string,
    outreachMessageId: string,
    reason?: string,
  ) {
    logger.info(
      `Outreach message rendering failure: MessageId: ${outreachMessageId}`,
    );
    await OutreachMessageRepository.markFailed(
      outreachMessageId,
      reason ?? 'SES rendering failure',
    );
    await removeJob(followUpQueue, outreachId);
  }

  static async handleDeliveryDelayed(
    outreachId: string,
    outreachMessageId: string,
    reason: string,
  ) {
    logger.info(`Outreach message delayed: MessageId: ${outreachMessageId}`);

    await OutreachMessageRepository.markFailed(outreachMessageId, reason);

    // await removeJob(followUpQueue, outreachId);
  }

  //Dashboard APIs
  static async getOutreaches(
    options: OutreachListQuery = {},
  ): Promise<PaginatedResult<OutreachListItem>> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));

    const items = await OutreachRepository.getOutreachList(options);

    const total = items.length;
    const start = (page - 1) * limit;

    return {
      // items: items.slice(start, start + limit),
      items,
      total,
      page,
      limit,
    };
  }

  static async getStats(): Promise<OutreachStats> {
    return OutreachRepository.getStats();
  }

  static async getOutreachDetail(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid outreach ID');
    }

    const outreach = await OutreachRepository.findById(id);

    if (!outreach) {
      throw new Error('Outreach conversation not found');
    }

    const message = await OutreachMessageRepository.findLatestByOutreachId(id);

    return {
      ...outreach,
      message,
    };
  }

  // Helpers
  static async getOutreachSequenceByLeadId(
    leadId: string,
  ): Promise<OutreachSequenceStepDto[]> {
    await LeadsService.getLeadById(leadId);

    const outreach = await OutreachRepository.findLatestByLeadId(leadId);

    if (!outreach) {
      return [];
    }

    const messages = await OutreachMessageRepository.findMessagesByOutreachId(
      outreach.id,
    );

    return messages.map((message, index) => ({
      step: this.getSequenceStepLabel(index),

      status: this.mapMessageStatus(message.status),

      at: message.sentAt ?? message.deliveredAt ?? message.createdAt ?? null,
    }));
  }

  private static getSequenceStepLabel(messageIndex: number): string {
    if (messageIndex === 0) {
      return 'Initial Outreach';
    }

    return `Follow-up ${messageIndex}`;
  }

  private static mapMessageStatus(
    status: OutreachMessageStatus,
  ): OutreachSequenceStepStatus {
    switch (status) {
      case OutreachMessageStatus.PENDING:
        return 'scheduled';

      case OutreachMessageStatus.SENT:
        return 'sent';

      case OutreachMessageStatus.DELIVERED:
        return 'delivered';

      case OutreachMessageStatus.OPENED:
      case OutreachMessageStatus.CLICKED:
        return 'opened';

      case OutreachMessageStatus.RESPONDED:
        return 'replied';

      case OutreachMessageStatus.FAILED:
      case OutreachMessageStatus.BOUNCED:
      case OutreachMessageStatus.COMPLAINED:
        return 'failed';

      default:
        return 'draft';
    }
  }
}
