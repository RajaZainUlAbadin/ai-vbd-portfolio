import express from 'express';
import { Router } from 'express';
import { OutreachWebhookController } from './outreachWebhook.controller';

// api/webhooks
const router = Router();

// AWS_SES
router.post(
  '/aws-ses',
  express.text({
    type: ['text/plain', 'text/plain; charset=UTF-8'],
  }),
  OutreachWebhookController.awsSesWebhook,
);

router.post(
  '/email-received',
  OutreachWebhookController.handleLambdaEmailReceived,
);

// Resend
router.post('/resend', OutreachWebhookController.resendWebhook);

// Meta Verification
router.get('/whatsapp', OutreachWebhookController.verifyWhatsappWebhook);

// Meta Incoming Messages
router.post('/whatsapp', OutreachWebhookController.receiveWhatsappWebhook);

export default router;
