import mongoose, { Schema, Types } from 'mongoose';

const locationSchema = new Schema(
  {
    city: {
      type: String,
      required: true,
      index: true,
    },

    area: {
      type: String,
      index: true,
    },

    country: {
      type: String,
      required: true,
      index: true,
    },

    priority: {
      type: Number,
      default: 1,
      index: true,
    },

    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

locationSchema.index(
  {
    city: 1,
    area: 1,
    country: 1,
  },
  {
    unique: true,
  },
);

export type LocationDocument = mongoose.InferSchemaType<typeof locationSchema>;

export const LocationModel = mongoose.model('Location', locationSchema);

export interface ILocation extends LocationDocument {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
