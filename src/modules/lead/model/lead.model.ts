import mongoose, { Schema } from 'mongoose';
import { LeadStatus } from './lead.status';
import { leadContactSchema } from '../lead-contact/lead-contact.schema';

const leadSchema = new Schema(
  {
    batchId: {
      type: Schema.Types.ObjectId,
      ref: 'AcquisitionBatch',
      required: false,
    },

    businessName: {
      type: String,
      required: true,
    },

    website: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },

    contacts: {
      type: [leadContactSchema],
      default: [],
    },

    provider: {
      type: String,
      required: true,
    },

    externalId: {
      type: String,
    },
    businessStatus: String,
    isFutureOpeningBusiness: {
      type: Boolean,
      default: false,
    },
    primaryType: String,
    categories: [String],

    rating: Number,
    reviewCount: Number,

    mapsUrl: String,
    latitude: Number,
    longitude: Number,

    // business fields
    dedupeHash: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: Object.values(LeadStatus),
      default: LeadStatus.NEW,
    },
    score: {
      type: Number,
      default: 0,
    },

    outreachCount: {
      type: Number,
      default: 0,
    },
    outreachSequenceStep: {
      type: Number,
      default: 0,
    },
    outreachScheduledFor: {
      type: Date,
      default: null,
    },
    lastOutreachAt: {
      type: Date,
      default: null,
    },
    nextFollowupAt: {
      type: Date,
      default: null,
    },

    lastEngagementAt: {
      type: Date,
      default: null,
    },
    repliedAt: {
      type: Date,
      default: null,
    },
    convertedAt: {
      type: Date,
      default: null,
    },

    currentOutreachId: {
      type: Schema.Types.ObjectId,
      ref: 'Outreach',
    },

    websiteSource: {
      type: String,
      enum: ['diagnostic', 'consultation', 'contact'],
      required: false,
      index: true,
    },

    websiteMetadata: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

leadSchema.index(
  { provider: 1, externalId: 1 },
  { unique: true, sparse: true },
);

export type LeadRecord = mongoose.InferSchemaType<typeof leadSchema>;

export const LeadModel = mongoose.model<LeadRecord>('Lead', leadSchema);

export type LeadDocument = mongoose.HydratedDocument<LeadRecord>;

export type LeadRaw = LeadRecord & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};
