import { OutreachMessageStatus } from '../../outreach-message/model/outreachMessage.status';
import { OutreachStatus } from '../../outreach/model/outreach.status';

export interface ConversationListItemDto {
  id: string;

  leadId: string;
  leadContactId: string;
  leadScore: number;
  business?: string;
  contact: string;

  status: OutreachStatus;

  lastMessage: string;
  lastMessageAt: string;
  lastMessageStatus: OutreachMessageStatus | '';

  unread: boolean;

  channel: string;
  provider: string;

  sequenceStep: number;
}
