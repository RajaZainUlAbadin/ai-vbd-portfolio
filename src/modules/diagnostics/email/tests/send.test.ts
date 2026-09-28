import { EmailService } from '@/providers/communication/email/EmailService';

export async function testSendEmail() {
  const result = await EmailService.send({
    to: 'zainsaeed067@gmail.com',
    subject: 'AI_VBD Test Email',
    html: '<h1>Hello</h1>',
  });

  return result;
}

// Expected
// - MessageId returned
// - success=true
// - Email received
