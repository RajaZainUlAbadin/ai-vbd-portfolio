import mongoose, { Schema, model } from 'mongoose';

import {
  IAcquisitionProvider,
  ProviderUnavailableReason,
} from './acquisition-provider.types';

const AcquisitionProviderSchema = new Schema<IAcquisitionProvider>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Serves for Application Settings
    // to determine if the provider is enabled or not
    // instead of hardcoded acquisition.google_places.enabled
    enabled: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },

    available: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },

    reason: {
      type: String,
      enum: Object.values(ProviderUnavailableReason),
      default: undefined,
    },
    description: {
      type: String,
      default: undefined,
    },

    disabledUntil: {
      type: Date,
      default: null,
      index: true,
    },

    lastErrorAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const AcquisitionProviderModel = model<IAcquisitionProvider>(
  'AcquisitionProvider',
  AcquisitionProviderSchema,
);

export type AcquisitionProviderRecord = mongoose.InferSchemaType<
  typeof AcquisitionProviderSchema
>;

export type AcquisitionProviderDocument = AcquisitionProviderRecord & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};
