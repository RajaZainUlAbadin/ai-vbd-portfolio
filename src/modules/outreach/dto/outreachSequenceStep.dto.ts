export interface OutreachSequenceStepDto_00 {
  outreachId: string;

  sequenceStep: number;

  status: OutreachSequenceStepStatus;

  recipient?: string;

  provider?: string;

  lastMessageAt?: Date;

  respondedAt?: Date;

  completedAt?: Date;

  cancelledAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}

export type OutreachSequenceStepStatus =
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'replied'
  | 'failed'
  | 'cancelled';

export interface OutreachSequenceStepDto {
  step: string;
  status: OutreachSequenceStepStatus;
  at: Date | null;
}
