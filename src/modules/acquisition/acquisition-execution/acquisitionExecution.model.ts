import mongoose, { Schema } from 'mongoose';
import {
  AcquisitionExecutionSource,
  AcquisitionExecutionStatus,
} from './acquisitionExecution.interface';

const acquisitionExecutionSchema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(AcquisitionExecutionStatus),
      default: AcquisitionExecutionStatus.PENDING,
    },

    source: {
      type: String,
      enum: Object.values(AcquisitionExecutionSource),
      default: AcquisitionExecutionSource.SCHEDULED,
    },

    targetMatrixId: {
      type: Schema.Types.ObjectId,
      ref: 'TargetMatrix',
    },

    providers: [String],

    searchesExecuted: {
      type: Number,
      default: 0,
    },

    leadsFound: {
      type: Number,
      default: 0,
    },

    newLeads: {
      type: Number,
      default: 0,
    },

    qualifiedLeads: {
      type: Number,
      default: 0,
    },

    totalCost: {
      type: Number,
      default: 0,
    },

    startedAt: Date,

    completedAt: Date,
  },
  {
    timestamps: true,
  },
);

export const AcquisitionExecutionModel = mongoose.model(
  'AcquisitionExecution',
  acquisitionExecutionSchema,
);
