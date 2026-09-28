import { OutreachDocument, OutreachRecord } from './outreach.model';
import { IOutreach } from './outreach.interface';
import mongoose from 'mongoose';

export function mapOutreach(
  record:
    | OutreachDocument
    | (OutreachRecord & { _id: mongoose.Types.ObjectId }),
): IOutreach {
  return {
    id: record._id.toString(),

    leadId: record.leadId.toString(),

    leadContactId: record.leadContactId
      ? record.leadContactId.toString()
      : 'n/a',
    recipient: record.recipient ?? undefined,

    aiAnalysisId: record.aiAnalysisId?.toString(),

    status: record.status,

    sequenceStep: record.sequenceStep,

    provider: record.provider ?? undefined,

    lastMessageAt: record.lastMessageAt ?? undefined,

    respondedAt: record.respondedAt ?? undefined,

    completedAt: record.completedAt ?? undefined,

    cancelledAt: record.cancelledAt ?? undefined,
    cancelReason: record.cancelReason ?? undefined,

    errorMessage: record.errorMessage ?? undefined,

    createdAt: record.createdAt,

    updatedAt: record.updatedAt,
  };
}
