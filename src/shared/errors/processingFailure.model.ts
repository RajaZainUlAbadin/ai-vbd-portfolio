import mongoose, { Schema } from 'mongoose';

const processingFailureSchema = new Schema(
  {
    traceId: {
      type: String,
      index: true,
    },

    leadId: {
      type: String,
      index: true,
    },

    stage: {
      type: String,
      required: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    message: String,

    errorStack: String,

    payload: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  },
);

processingFailureSchema.index({ createdAt: -1 });
processingFailureSchema.index({ stage: 1, category: 1 });

export const ProcessingFailureModel = mongoose.model(
  'ProcessingFailure',
  processingFailureSchema,
);
