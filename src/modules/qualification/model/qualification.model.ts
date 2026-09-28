import mongoose, { Schema } from 'mongoose';

const qualificationSchema = new Schema(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
      index: true,
      unique: true,
    },

    scrapeResultId: {
      type: Schema.Types.ObjectId,
      ref: 'ScrapeResult',
      default: null,
    },

    qualified: {
      type: Boolean,
      required: true,
    },

    businessScore: {
      type: Number,
      default: 0,
    },

    opportunityScore: {
      type: Number,
      default: 0,
    },

    score: {
      type: Number,
      required: true,
    },

    reasons: [
      {
        type: String,
      },
    ],

    qualificationType: {
      type: String,
      enum: ['PROVIDER', 'SCRAPED'],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const QualificationModel = mongoose.model(
  'Qualification',
  qualificationSchema,
);

export type QualificationRecord = mongoose.InferSchemaType<
  typeof qualificationSchema
>;

export type QualificationDocument =
  mongoose.HydratedDocument<QualificationRecord>;
