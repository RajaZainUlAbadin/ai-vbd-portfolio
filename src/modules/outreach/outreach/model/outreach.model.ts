import mongoose, { Schema } from 'mongoose';
import { OutreachStatus } from './outreach.status';

const outreachSchema = new Schema(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
      index: true,
    },

    leadContactId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    recipient: String,

    aiAnalysisId: {
      type: Schema.Types.ObjectId,
      ref: 'AIAnalysis',
    },

    status: {
      type: String,
      enum: Object.values(OutreachStatus),
      default: OutreachStatus.ACTIVE,
      index: true,
    },

    sequenceStep: {
      type: Number,
      default: 1,
    },

    provider: String,

    lastMessageAt: Date,

    respondedAt: Date,

    completedAt: Date,

    cancelledAt: Date,
    cancelReason: String,

    errorMessage: String,
  },
  {
    timestamps: true,
  },
);

export type OutreachRecord = mongoose.InferSchemaType<typeof outreachSchema>;

export const OutreachModel = mongoose.model('Outreach', outreachSchema);

export type OutreachDocument = mongoose.HydratedDocument<OutreachRecord>;
// export interface OutreachDocument extends mongoose.Document, OutreachRecord {}
// export type OutreachDocument = OutreachRecord & {
//   _id: mongoose.Types.ObjectId;
//   createdAt: Date;
//   updatedAt: Date;
// };
