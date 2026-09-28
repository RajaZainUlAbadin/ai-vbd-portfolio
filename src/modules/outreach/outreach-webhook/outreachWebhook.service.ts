import { S3Service } from '@/providers/communication/email/aws-ses/S3Service';
import { removeJob } from '@/infrastructure/queues/core/removeJob';
import { followUpQueue, responseQueue } from '@/infrastructure/queues';
import { LeadContactService } from '@/modules/lead/lead-contact/lead-contact.service';
import { WhatsappCallbackPayload } from '../outreach/types/whatsppCallbackPayload';

import { LeadsRepository } from '../../lead/leads.repository';
import { LeadStatus } from '../../lead/model/lead.status';
import { OutreachService } from '../outreach/outreach.service';
import { OutreachRepository } from '../outreach/outreach.repository';
import { OutreachMessageRepository } from '../outreach-message/outreachMessage.repository';
import { logger } from '@/shared/logger/logger';
import { EmailParser } from '@/providers/communication/email/helpers/emailParser';
import { LeadsService } from '@/modules/lead/leads.service';

type webhookEvent =
  | 'DELIVERED'
  | 'OPENED'
  | 'CLICKED'
  | 'RESPONDED'
  | 'BOUNCED'
  | 'COMPLAINT'
  | 'REJECTED'
  | 'RENDERING_FAILURE'
  | 'DELIVERY_DELAY';

export class OutreachWebhookService {
  // AWS-SNS
  static async confirmSnsSubscription(payload: any) {
    logger.info('SNS subscribed successfully.');
    logger.info(payload.SubscribeURL);

    const response = await fetch(payload.SubscribeURL);
    logger.info(`Confirmation status: ${response.status}`);
    //  await axios.get(payload.SubscribeURL);
  }

  static async handleSesNotification(payload: any) {
    const message = JSON.parse(payload.Message);
    const providerMessageId = message.mail.messageId;

    logger.info(
      {
        notificationType: message.notificationType,
        eventType: message.eventType,
        messageId: message.mail?.messageId,
      },
      'SES Event',
    );

    if (message.notificationType === 'Received') {
      await this.handleIncomingEmail(message);
      return;
    }

    switch (message.eventType) {
      //Send
      case 'Delivery':
        await this.processEvent(providerMessageId, 'DELIVERED');
        break;

      case 'Open':
        await this.processEvent(providerMessageId, 'OPENED');
        break;

      case 'Click':
        await this.processEvent(providerMessageId, 'CLICKED');
        break;

      case 'Bounce':
        await this.processEvent(providerMessageId, 'BOUNCED');
        break;

      case 'Complaint':
        await this.processEvent(providerMessageId, 'COMPLAINT');
        break;

      case 'Reject': {
        const context = await OutreachService.loadContext(providerMessageId);
        if (!context?.outreach) return;

        await OutreachService.handleOutreachRejected(
          context.outreach.id,
          context.message.id,
          message.reject,
        );

        break;
      }

      case 'Rendering Failure': {
        const context = await OutreachService.loadContext(providerMessageId);

        if (!context?.outreach) return;

        await OutreachService.handleRenderingFailure(
          context.outreach.id,
          context.message.id,
          message.failure,
        );

        break;
      }

      case 'DeliveryDelay': {
        const context = await OutreachService.loadContext(providerMessageId);

        if (!context?.outreach) return;

        await OutreachService.handleDeliveryDelayed(
          context.outreach.id,
          context.message.id,
          message.deliveryDelay,
        );

        break;
      }

      default:
        logger.warn(
          {
            eventType: message.eventType,
          },
          'Unhandled SES event',
        );
    }
  }

  private static async processEvent(
    providerMessageId: string,
    event: webhookEvent,
  ) {
    const context = await OutreachService.loadContext(providerMessageId);
    if (!context) return;

    const { message, outreach, lead } = context;

    switch (event) {
      case 'DELIVERED':
        this.handleDelivered(providerMessageId);
        break;

      case 'OPENED':
        this.handleOpened(providerMessageId);
        break;

      case 'CLICKED':
        await OutreachMessageRepository.markClicked(message.id);

        if (lead)
          await LeadsRepository.update(String(lead.id), {
            lastEngagementAt: new Date(),
          });

        break;

      case 'BOUNCED':
        if (outreach?.recipient) {
          await OutreachMessageRepository.markBounced(message.id);
          await OutreachRepository.markBounced(outreach.id);

          await LeadContactService.markContactBounced(
            String(outreach.leadId),
            outreach.recipient,
          );

          // Canceling follow-up jobs
          await removeJob(followUpQueue, outreach.id);
        }

        break;

      case 'COMPLAINT':
        if (!outreach) return;

        await OutreachMessageRepository.markComplained(message.id);

        await OutreachRepository.markUnsubscribed(outreach.id);

        if (outreach.recipient)
          await LeadContactService.markContactUnsubscribed(
            String(outreach.leadId),
            outreach.recipient,
          );

        // Canceling follow-up jobs
        await removeJob(followUpQueue, outreach.id);
        break;
    }
  }

  static async handleDelivered(providerMessageId: string) {
    const context = await OutreachService.loadContext(providerMessageId);
    if (!context) return;

    const { message, outreach, lead } = context;

    await OutreachMessageRepository.markDelivered(message.id);

    if (outreach) {
      await OutreachRepository.touch(outreach.id);
    }
  }

  static async handleOpened(providerMessageId: string) {
    const context = await OutreachService.loadContext(providerMessageId);
    if (!context) return;

    const { message, outreach, lead } = context;

    await OutreachMessageRepository.markOpened(message.id);

    if (lead) {
      await LeadsRepository.update(String(lead.id), {
        status: LeadStatus.ENGAGED,
        score: (lead.score ?? 0) + 10,
        lastEngagementAt: new Date(),
      });
    }
  }

  static async handleIncomingEmail(notification: any) {
    // const providerMessageId = notification.mail.messageId ?? null;

    const payload = notification.receipt.action;

    const rawEmail = await S3Service.getEmail(
      payload.bucket,
      payload.objectKey,
      payload.region ?? process.env.AWS_REGION,
    );

    const parsed = await EmailParser.parse(rawEmail);

    if (!parsed.messageId) {
      logger.warn('Inbound email missing Message-ID');
      return;
    }

    const externalMessageId = parsed.messageId;

    // Duplication check for SNS retires
    const existing =
      await OutreachMessageRepository.findByExternalMessageId(
        externalMessageId,
      );
    if (existing) {
      logger.info('Inbound message already processed');
      return;
    }

    let parentMessage = parsed.inReplyTo
      ? await OutreachMessageRepository.findByExternalMessageId(
          parsed.inReplyTo,
        )
      : null;

    if (!parentMessage && parsed.references.length > 0) {
      parentMessage =
        await OutreachMessageRepository.findLatestByExternalMessageIds(
          parsed.references,
        );
    }
    if (!parentMessage) {
      logger.warn('Inbound email without parent');
      return;
    }

    const outreach = await OutreachRepository.findById(
      parentMessage.outreachId,
    );
    if (!outreach) {
      throw new Error(
        `No active outreach conversation found. Id: ${parentMessage.outreachId}`,
      );
    }

    const inboundMessage = await OutreachService.createOutreachMessage({
      outreachId: parentMessage.outreachId,
      direction: 'inbound',

      from: parsed.from ?? '',
      to: parsed.to.join(', '),

      subject: parsed.subject,
      message: parsed.text,

      parentMessageId: parentMessage.id,
      providerMessageId: externalMessageId,

      externalMessageId,
      inReplyTo: parsed.inReplyTo ?? '',
    });

    await OutreachRepository.markResponded(inboundMessage.outreachId);
    await LeadsService.markResponded(outreach.leadId);

    await responseQueue.add('generate-response', {
      outreachMessageId: inboundMessage.id,
    });
  }

  static async handleIncomingEmailFromLambda(payload: any) {
    const notification = {
      mail: {
        messageId: null,
      },

      receipt: {
        action: {
          ...payload,
          objectKey: payload.key,
        },
      },
    };

    return this.handleIncomingEmail(notification);
  }

  // WhatsApp
  static async handleWhatsappCallback(payload: WhatsappCallbackPayload) {
    switch (payload.type) {
      case 'status':
        return this.handleWhatsappStatus(payload.raw);

      case 'message':
        return this.handleWhatsappMessage(payload);

      default:
        return;
    }
  }

  private static async handleWhatsappStatus(raw: any) {
    const value = raw.entry?.[0]?.changes?.[0]?.value;

    const statusEvent = value?.statuses?.[0];

    if (!statusEvent) {
      return;
    }

    const providerMessageId = statusEvent.id;
    const status = statusEvent.status;

    const message =
      await OutreachMessageRepository.findByProviderMessageId(
        providerMessageId,
      );
    if (!message) {
      return;
    }

    switch (status) {
      case 'sent':
        await OutreachMessageRepository.markSent(
          message.id,
          'whatsapp',
          providerMessageId,
        );
        break;

      case 'delivered':
        await OutreachMessageRepository.markDelivered(message.id);
        break;

      case 'read':
        await OutreachMessageRepository.markOpened(message.id);
        break;
    }

    // await message.save();
    await OutreachMessageRepository.update(message.id, message);
  }

  private static async handleWhatsappMessage(payload: WhatsappCallbackPayload) {
    const lead = await LeadsRepository.findOne({
      phone: payload.from,
    });
    if (!lead) {
      return;
    }

    const outreach = await OutreachRepository.findLatestByLeadId(
      String(lead.id),
    );
    if (!outreach) {
      return;
    }

    await OutreachService.createOutreachMessage({
      outreachId: outreach.id,
      direction: 'inbound',
      // subject: payload.subject ?? '',
      message: payload.text ?? '',

      // need to fill later with watsapp webhooks
      from: payload.from ?? '',
      to: outreach.recipient ?? '',
    });

    await OutreachRepository.markResponded(outreach.id);

    logger.info(`WhatsApp reply received from ${payload.from}`);
  }
}
