import { Request, Response } from 'express';
import { OutreachWebhookService } from './outreachWebhook.service';
import { logger } from '@/shared/logger/logger';
import { env } from '@/app/config/env';

export class OutreachWebhookController {
  // AWS-SES
  static async awsSesWebhook(req: Request, res: Response) {
    logger.info('SNS Webhook Received');
    logger.info({ headers: req.headers }, 'SNS Request headers');
    logger.info({ body: req.body }, 'SNS Request body');

    // const payload = req.body;
    console.log('req.body: ', req.body);
    const payload =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    switch (payload.Type) {
      case 'SubscriptionConfirmation':
        await OutreachWebhookService.confirmSnsSubscription(payload);
        break;

      case 'Notification':
        await OutreachWebhookService.handleSesNotification(payload);
        break;

      case 'UnsubscribeConfirmation':
        logger.info('SNS subscription removed.');
        break;
    }

    return res.sendStatus(200);
  }

  static async handleLambdaEmailReceived(req: Request, res: Response) {
    try {
      const secret = req.headers['x-webhook-secret'];

      if (secret !== env.AWS_WEBHOOK_SECRET) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }

      await OutreachWebhookService.handleIncomingEmailFromLambda(req.body);

      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      logger.error(error);

      return res.status(500).json({
        message: 'Failed processing inbound email',
      });
    }
  }

  // Email Resend provider
  static async resendWebhook(req: Request, res: Response) {
    const payload = req.body;

    const event = payload.type;

    const providerMessageId = payload.data?.email_id;

    switch (event) {
      case 'email.delivered':
        await OutreachWebhookService.handleDelivered(providerMessageId);
        break;

      case 'email.opened':
        await OutreachWebhookService.handleOpened(providerMessageId);
        break;

      // case 'email.replied':
      //   await OutreachWebhookService.handleResponded(providerMessageId);
      //   break;
    }

    return res.sendStatus(200);
  }

  // WhatsApp Meta provider
  static async verifyWhatsappWebhook(req: Request, res: Response) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
  }

  static async receiveWhatsappWebhook(req: Request, res: Response) {
    try {
      const entry = req.body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      // Status updates
      if (value?.statuses?.length) {
        await OutreachWebhookService.handleWhatsappCallback({
          type: 'status',
          raw: req.body,
          source: 'whatsapp',
        });

        return res.sendStatus(200);
      }

      // Incoming messages
      const message = value?.messages?.[0];
      if (!message) {
        return res.sendStatus(200);
      }

      await OutreachWebhookService.handleWhatsappCallback({
        type: 'message',
        raw: req.body,
        source: 'whatsapp',
        from: message.from,
        text: message.text?.body,
      });

      return res.sendStatus(200);
    } catch (error) {
      logger.error(error);
      return res.sendStatus(500);
    }
  }
}
