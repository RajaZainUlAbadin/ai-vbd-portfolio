import { ILead } from '@/modules/lead/model/lead.interface';
import { OutreachStatus } from '../../outreach/model/outreach.status';
import { IOutreachMessage } from '../../outreach-message/model/outreachMessage.interface';
import { OutreachMessageStatus } from '../../outreach-message/model/outreachMessage.status';

export interface IConversation {
  _id: string;

  leadId: string;

  leadContactId: string;

  recipient?: string;

  aiAnalysisId?: string;

  status: OutreachStatus;

  sequenceStep: number;

  provider?: string;

  leadScore?: number;

  businessName: string;

  lead?: ILead;

  lastMessage?: IOutreachMessage;

  lastMessageStatus?: OutreachMessageStatus;

  lastMessageAt?: Date;

  respondedAt?: Date;

  completedAt?: Date;

  cancelledAt?: Date;

  cancelReason?: string;

  errorMessage?: string;

  createdAt: Date;

  updatedAt: Date;
}
