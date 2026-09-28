import mongoose, { Schema } from 'mongoose';

const acquisitionBatchSchema = new Schema(
  {
    acquisitionExecutionId: {
      type: Schema.Types.ObjectId,
      ref: 'AcquisitionExecution',
    },
    acquisitionSearchId: {
      type: Schema.Types.ObjectId,
      ref: 'AcquisitionSearch',
    },

    provider: {
      type: String,
      required: true,
    },

    query: {
      type: String,
      required: true,
    },

    location: String,

    traceId: String,

    totalResults: Number,

    rawResponse: Schema.Types.Mixed,

    expiresAt: {
      type: Date,
      index: {
        expires: 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

export const AcquisitionBatchModel = mongoose.model(
  'AcquisitionBatch',
  acquisitionBatchSchema,
);

export type acquisitionBatchRecord = mongoose.InferSchemaType<
  typeof acquisitionBatchSchema
>;

export type acquisitionBatchDocument = acquisitionBatchRecord & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};
