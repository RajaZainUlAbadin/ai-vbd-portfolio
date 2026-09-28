import { LeadsRepository } from '../lead/leads.repository';
import { OutreachRepository } from '../outreach/outreach/outreach.repository';
import { EmailService } from '@/providers/communication/email/EmailService';
import { LeadStatus } from '../lead/model/lead.status';
import { addDays } from '@/shared/utils/date.util';
import { logger } from '@/shared/logger/logger';
import { OutreachMessageRepository } from '../outreach/outreach-message/outreachMessage.repository';
import { ContactStatus } from '../lead/lead-contact/lead-contact.types';
import { AIService } from '../ai/ai.service';
import { OutreachMessage } from '../ai/model/aiAnalysis.interface';
import { EmailTemplateService } from '@/providers/communication/email/EmailTemplateService';
import { OutreachService } from '../outreach/outreach/outreach.service';

export class FollowupService {
  static async sendFollowup(leadId: string, recipient: string) {
    // Load Lead
    //     ↓
    // Validate Contact
    //     ↓
    // Load Outreach
    //     ↓
    // Generate AI Response
    //     ↓
    // Build Email
    //     ↓
    // createOutreachMessage()
    //     ↓
    // dispatchMessage()
    //     ↓
    // Update Lead / Outreach

    const lead = await LeadsRepository.findById(leadId);

    if (!lead) {
      throw new Error(`Lead not found ${leadId}`);
    }

    if (
      lead.status !== LeadStatus.CONVERTED &&
      lead.status !== LeadStatus.ENGAGED
    ) {
      throw new Error(`Lead ${lead.id} is not eligible for follow-up.`);
    }

    const nextStep = (lead.outreachSequenceStep || 1) + 1;

    if (nextStep > 4) {
      return;
    }

    const leadContact = await LeadsRepository.loadContactByEmail(recipient);
    if (!leadContact) {
      throw new Error(`Lead contact ${recipient} not found.`);
    }

    if (
      leadContact.status === ContactStatus.BOUNCED ||
      leadContact.status === ContactStatus.INVALID ||
      leadContact.status === ContactStatus.UNSUBSCRIBED
    ) {
      throw new Error(
        `Lead ${lead.id} | ${recipient} is not eligible for follow-up.`,
      );
    }

    // loading outreach
    const outreach = await OutreachRepository.findLatestByLeadId(leadId);
    if (!outreach) {
      throw new Error('No active outreach conversation found');
    }

    const aiService = new AIService();
    const followup = await aiService.generateResponse(outreach);

    const html = await EmailService.renderEmailHtml({
      contact: leadContact,
      businessName: lead.businessName,
      message: followup,
    });

    const outreachMessage = await OutreachService.createOutreachMessage({
      outreachId: outreach.id,
      direction: 'outbound',
      to: recipient,
      subject: followup.subject,
      message: html,
    });

    const dispatchResult = await OutreachService.dispatchMessage({
      recipient: recipient,
      message: outreachMessage,
    });

    if (!dispatchResult.success) {
      return dispatchResult;
    }

    await OutreachRepository.touch(outreach.id);

    const delayDays = this.getNextDelay(nextStep);

    await LeadsRepository.update(lead.id, {
      outreachCount: (lead.outreachCount || 0) + 1,
      outreachSequenceStep: nextStep,
      lastOutreachAt: new Date(),
      nextFollowupAt:
        delayDays === null ? null : addDays(new Date(), delayDays),
    });

    return dispatchResult;
  }

  private static getNextDelay(step: number) {
    const delays: Record<number, number | null> = {
      2: 7,
      3: 14,
      4: null,
    };

    return delays[step];
  }

  private static getFollowupMessage(step: number, businessName: string) {
    switch (step) {
      case 2:
        return `Just checking if you had a chance to review the digital improvement suggestions I shared for ${businessName}.`;

      case 3:
        return `Following up once more regarding the opportunities identified for ${businessName}.`;

      case 4:
        return `I'll assume this isn't a priority right now, but if you'd like to discuss the recommendations for ${businessName}, feel free to reply anytime.`;

      default:
        return '';
    }
  }
}
