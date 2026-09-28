import mongoose from 'mongoose';
import {
  OutreachMessageDocument,
  OutreachMessageRecord,
} from '../model/outreachMessage.model';
import { IOutreachMessage } from './outreachMessage.interface';

export function mapOutreachMessage(
  doc:
    | OutreachMessageDocument
    | (OutreachMessageRecord & { _id: mongoose.Types.ObjectId }),
): IOutreachMessage {
  return {
    id: doc._id.toString(),

    outreachId: doc.outreachId.toString(),

    parentMessageId: doc.parentMessageId
      ? doc.parentMessageId.toString()
      : undefined,

    direction: doc.direction,

    channel: doc.channel,

    provider: doc.provider ?? undefined,

    providerMessageId: doc.providerMessageId ?? undefined,

    externalMessageId: doc.externalMessageId ?? undefined,
    inReplyTo: doc.inReplyTo ?? undefined,

    from: doc.from ?? '',
    to: doc.to ?? '',

    subject: doc.subject ?? undefined,

    message: doc.message,

    status: doc.status,

    sentAt: doc.sentAt ?? undefined,

    deliveredAt: doc.deliveredAt ?? undefined,

    openedAt: doc.openedAt ?? undefined,

    repliedAt: doc.repliedAt ?? undefined,

    errorMessage: doc.errorMessage ?? undefined,

    createdAt: doc.createdAt,

    updatedAt: doc.updatedAt,
  };
}
