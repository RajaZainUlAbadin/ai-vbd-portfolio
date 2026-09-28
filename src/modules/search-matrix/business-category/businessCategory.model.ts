import mongoose, { Schema, Types } from 'mongoose';

const businessCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    targetAudience: {
      type: [String],
      default: [],
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

export type BusinessCategoryDocument = mongoose.InferSchemaType<
  typeof businessCategorySchema
>;

export const BusinessCategoryModel = mongoose.model(
  'BusinessCategory',
  businessCategorySchema,
);

export interface IBusinessCategory extends BusinessCategoryDocument {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
