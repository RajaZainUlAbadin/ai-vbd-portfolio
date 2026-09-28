import mongoose, { Schema } from 'mongoose';

const emailUsageSchema = new Schema(
  {
    provider: {
      type: String,
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    sentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const EmailUsageModel = mongoose.model('EmailUsage', emailUsageSchema);
