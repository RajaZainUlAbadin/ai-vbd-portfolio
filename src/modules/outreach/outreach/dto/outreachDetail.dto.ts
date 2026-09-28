import { OutreachMessageStatus } from '../../outreach-message/model/outreachMessage.status';
import { OutreachStatus } from '../model/outreach.status';

export interface outreachDetail {
  id: string;

  status: OutreachStatus;

  sequenceStep: number;

  recipient?: string;

  createdAt: Date;
  updatedAt: Date;

  lead: {
    id: string;
    businessName: string;
    provider: string;
    score: number;
    website?: string;
    address?: string;
  };

  leadContact?: {
    id: string;
    type: string;
    value: string;
    name?: string;
    designation?: string;
    status: string;
    verified: boolean;
    confidence: number;
  };

  aiAnalysis?: {
    id: string;
    qualification: {
      qualified: boolean;
      score: number;
      reason: string;
    };
    opportunityScore: number;
    priority: string;
    primaryPainPoint: string;
  };

  message?: {
    id: string;
    status: OutreachMessageStatus;
    channel: string;
    provider?: string;
    from: string;
    to: string;
    subject?: string;
    message: string;

    createdAt: Date;
    sentAt?: Date;
    deliveredAt?: Date;
    openedAt?: Date;
    repliedAt?: Date;

    errorMessage?: string;
  };
}
