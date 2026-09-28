import mongoose, { Schema } from 'mongoose';

const acquisitionSearchSchema = new Schema(
  {
    acquisitionExecutionId: {
      type: Schema.Types.ObjectId,
      ref: 'AcquisitionExecution',
    },

    searchMatrixId: {
      type: Schema.Types.ObjectId,
      ref: 'SearchMatrix',
      required: true,
    },

    provider: {
      type: String,
      required: true,
    },

    query: {
      type: String,
      required: true,
    },

    location: {
      type: String,
    },

    searchHash: {
      type: String,
      required: true,
      unique: true,
    },
    
    timesExecuted: {
      type: Number,
      default: 1,
    },

    totalResults: Number,
    durationMs: Number,

    lastFetchedAt: Date,
    nextPageToken: String,

    rawResponse: Schema.Types.Mixed,
  },

  {
    timestamps: true,
  },
);

export const AcquisitionSearchModel = mongoose.model(
  'AcquisitionSearch',
  acquisitionSearchSchema,
);
