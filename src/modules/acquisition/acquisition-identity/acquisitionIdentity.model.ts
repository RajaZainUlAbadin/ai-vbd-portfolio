import mongoose, { Schema } from 'mongoose';

const acquisitionIdentitySchema = new Schema(
  {
    provider: {
      type: String,
      required: true,
    },

    externalId: {
      type: String,
      required: true,
    },

    businessName: String,

    website: String,

    phone: String,

    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
    },

    firstSeenAt: {
      type: Date,
      default: Date.now,
    },

    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    lastProcessedAt: Date,

    timesSeen: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

acquisitionIdentitySchema.index(
  {
    provider: 1,
    externalId: 1,
  },
  {
    unique: true,
  },
);

export const AcquisitionIdentityModel = mongoose.model(
  'AcquisitionIdentity',
  acquisitionIdentitySchema,
);
