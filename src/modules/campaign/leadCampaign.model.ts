import mongoose, { Schema } from 'mongoose';
import { CampaignStatus } from './campaign.status';

const leadCampaignSchema = new Schema(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
    },

    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(CampaignStatus),
      default: CampaignStatus.ACTIVE,
    },

    currentStep: {
      type: Number,
      default: 0,
    },

    nextRunAt: Date,
    completedAt: Date,
    stoppedReason: String,
  },
  {
    timestamps: true,
  },
);

export const LeadCampaignModel = mongoose.model(
  'LeadCampaign',
  leadCampaignSchema,
);
