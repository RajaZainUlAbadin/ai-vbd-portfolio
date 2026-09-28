import { OutreachMessageStatus } from '../../outreach-message/model/outreachMessage.status';

export interface ConversationMessageDto {
  id: string;

  direction: 'INBOUND' | 'OUTBOUND';
  senderType: 'SYSTEM' | 'USER' | 'CONTACT';

  sender: string;
  recipient: string;

  subject?: string;
  text: string;

  status: OutreachMessageStatus;

  createdAt: string;

  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;

  errorMessage?: string;
}
