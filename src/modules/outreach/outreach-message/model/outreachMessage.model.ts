import mongoose, { Schema } from 'mongoose';

import { OutreachMessageStatus } from './outreachMessage.status';

const outreachMessageSchema = new Schema(
  {
    outreachId: {
      type: Schema.Types.ObjectId,
      ref: 'Outreach',
      required: true,
      index: true,
    },

    parentMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'OutreachMessage',
      index: true,
    },

    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true,
    },

    channel: {
      type: String,
      enum: ['email', 'whatsapp'],
      default: 'email',
      required: true,
    },

    provider: String,

    providerMessageId: {
      type: String,
      index: true,
    },

    // For email threading
    externalMessageId: String,
    inReplyTo: String,

    from: String,
    to: String,

    subject: String,

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(OutreachMessageStatus),
      default: OutreachMessageStatus.PENDING,
    },

    sentAt: Date,
    deliveredAt: Date,
    openedAt: Date,
    repliedAt: Date,

    errorMessage: String,
  },
  {
    timestamps: true,
  },
);

export const OutreachMessageModel = mongoose.model(
  'OutreachMessage',
  outreachMessageSchema,
);

export type OutreachMessageRecord = mongoose.InferSchemaType<
  typeof outreachMessageSchema
>;

export type OutreachMessageDocument =
  mongoose.HydratedDocument<OutreachMessageRecord>;
