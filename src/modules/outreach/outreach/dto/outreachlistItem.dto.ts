import { OutreachMessageStatus } from '../../outreach-message/model/outreachMessage.status';
import { OutreachStatus } from '../model/outreach.status';

export interface OutreachListItem {
  id: string;

  lead: {
    id: string;
    businessName: string;
    provider: string;
    score: number;
  };

  recipient: string;

  sequenceStep: number;

  status: OutreachMessageStatus;

  sequenceStatus: OutreachStatus;

  createdAt: Date;
  sentAt?: Date;
  nextFollowupAt?: Date;

  replied: boolean;

  failure?: {
    reason: string;
  };
}
