import { CampaignModel } from './campaign.model';
import { LeadCampaignModel } from './leadCampaign.model';

export class CampaignService {
  static async enrollLead(leadId: string, campaignId: string) {
    const campaign = await CampaignModel.findById(campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const firstStep = campaign.steps[0];

    const delayInHours = firstStep.delayInHours || 1;
    const nextRunAt = new Date(Date.now() + delayInHours * 60 * 60 * 1000);

    return LeadCampaignModel.create({
      leadId,
      campaignId,
      currentStep: 0,
      nextRunAt,
    });
  }
}
