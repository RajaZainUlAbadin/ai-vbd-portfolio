import mongoose, { Schema } from 'mongoose';

const campaignExecutionSchema = new Schema(
  {
    leadCampaignId: {
      type: Schema.Types.ObjectId,
      ref: 'LeadCampaign',
      required: true,
    },
    stepOrder: Number,
    outreachId: {
      type: Schema.Types.ObjectId,
      ref: 'Outreach',
    },
    executedAt: Date,
    success: Boolean,
    errorMessage: String,
  },
  {
    timestamps: true,
  },
);

export const CampaignExecutionModel = mongoose.model(
  'CampaignExecution',
  campaignExecutionSchema,
);
