import mongoose, { Schema } from 'mongoose';

const searchMatrixSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    businessCategory: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    query: {
      type: String,
      required: true,
      trim: true,
    },

    priority: {
      type: Number,
      default: 0,
      index: true,
    },

    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },

    lastExecutedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

searchMatrixSchema.index({
  enabled: 1,
  priority: -1,
  lastExecutedAt: 1,
});

export type SearchMatrixDocument = mongoose.InferSchemaType<
  typeof searchMatrixSchema
>;

export const SearchMatrixModel = mongoose.model(
  'SearchMatrix',
  searchMatrixSchema,
);
