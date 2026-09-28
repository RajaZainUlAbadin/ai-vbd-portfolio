import mongoose, { Schema } from 'mongoose';
import { CampaignStatus } from './campaign.status';

const campaignStepSchema = new Schema({
  order: Number,
  delayInHours: Number,
  subjectTemplate: String,
  messageTemplate: String,
});

const campaignSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    niche: String,
    status: {
      type: String,
      enum: Object.values(CampaignStatus),
      default: CampaignStatus.ACTIVE,
    },
    steps: [campaignStepSchema],
  },
  {
    timestamps: true,
  },
);

export const CampaignModel = mongoose.model('Campaign', campaignSchema);
