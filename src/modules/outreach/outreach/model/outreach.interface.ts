import { OutreachStatus } from '../model/outreach.status';

export interface IOutreach {
  id: string;

  leadId: string;

  leadContactId: string;
  recipient?: string;

  aiAnalysisId?: string;

  status: OutreachStatus;

  sequenceStep: number;

  provider?: string;

  lastMessageAt?: Date;

  respondedAt?: Date;

  completedAt?: Date;

  cancelledAt?: Date;

  cancelReason?: string;

  errorMessage?: string;

  createdAt: Date;

  updatedAt: Date;
}

export interface CreateOutreachInput {
  leadId: string;
  leadContactId: string;
  aiAnalysisId?: string;

  status?: OutreachStatus;

  sequenceStep?: number;

  provider?: string;

  recipient?: string;

  lastMessageAt?: Date;

  respondedAt?: Date;

  completedAt?: Date;

  cancelledAt?: Date;
  cancelReason?: string;

  errorMessage?: string;
}
