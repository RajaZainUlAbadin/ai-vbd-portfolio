import { logger } from '@/shared/logger/logger';
import { EmailPayload, EmailResult } from './base/EmailProvider';
import { EmailRegistry } from './EmailRegistry';
import { EmailTemplateService } from './EmailTemplateService';
import { LeadContact } from '@/modules/lead/lead-contact/lead-contact.schema';
import { OutreachMessage } from '@/modules/ai/model/aiAnalysis.interface';

export class EmailService {
  static async send(payload: EmailPayload): Promise<
    EmailResult & {
      provider: string;
    }
  > {
    try {
      // Later need to select from system variables,
      // as per Admin selection of preferred provider, and also based on usage limits.
      const provider = EmailRegistry.get('aws-ses');

      const result = await provider.sendEmail(payload);

      return {
        ...result,
        provider: provider.name,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Error in EmailService.send: ${msg}`);
      throw new Error(`Failed to send email: ${err}`);
    }
  }

  static async renderEmailHtml({
    contact,
    businessName,
    message,
  }: RenderEmailInput): Promise<string> {
    const recipientName = contact.name ?? contact.designation ?? 'there';

    return EmailTemplateService.outreach({
      recipientName,
      businessName: businessName,
      greeting: contact.name
        ? `Hi ${contact.name},`
        : `Hello ${businessName} Team,`,
      opening: message.opening,
      message: message.message,
      closing: message.closing,
      senderName: 'Raja Zain ul Abadin',
    });
  }
}

export interface RenderEmailInput {
  contact: LeadContact;
  businessName: string;
  message: OutreachMessage;
}
