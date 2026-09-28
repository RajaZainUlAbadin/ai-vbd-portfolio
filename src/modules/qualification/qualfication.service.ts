import { qualificationConfig } from './rules/qualification.config';
import { QualificationRepository } from './qualification.repository';
import { WebsiteQualificationRules } from './rules/websiteQualification.rules';
import { BusinessQualificationRules } from './rules/businessQualification.rules';

import { LeadStatus } from '../lead/model/lead.status';
import { LeadsService } from '../lead/leads.service';

import { ScrapeResultModel } from '../scraping/model/scrapeResult.model';

export class QualificationService {
  // Qualified result
  // Rating: 4.7
  // Reviews: 2500
  // Website: NULL
  // ////
  //   {
  //   "businessScore": 45,
  //   "opportunityScore": 35,
  //   "score": 80,
  //   "qualified": true,
  //   "reasons": [
  //     "High review volume",
  //     "Excellent rating",
  //     "Missing meta description",
  //     "Slow website"
  //   ]
  // }

  private static async qualifyWithoutScraping(leadId: string) {
    const lead = await LeadsService.getLeadById(leadId);

    if (!lead) {
      throw new Error('Lead not found');
    }

    const businessEvaluation = await BusinessQualificationRules.evaluate(lead);

    const qualified =
      businessEvaluation.score >= qualificationConfig.minimumScore;

    const qualificationReport = await QualificationRepository.createOrUpdate({
      leadId,
      scrapeResultId: null,
      qualified,
      businessScore: businessEvaluation.score,
      opportunityScore: 0,
      score: businessEvaluation.score,
      reasons: businessEvaluation.reasons,
      qualificationType: 'PROVIDER',
    });

    await LeadsService.updateStatus(
      leadId,
      qualified ? LeadStatus.QUALIFIED : LeadStatus.NOT_QUALIFIED,
    );

    return qualificationReport;
  }

  private static async qualifyWithScraping(
    leadId: string,
    scrapeResultId: string,
  ) {
    const scrapeResult = await ScrapeResultModel.findById(scrapeResultId);

    if (!scrapeResult) {
      throw new Error('Scrape result not found');
    }

    const lead = await LeadsService.getLeadById(leadId);

    if (!lead) {
      throw new Error('Lead not found');
    }

    const businessEvaluation = await BusinessQualificationRules.evaluate(lead);

    const websiteEvaluation =
      await WebsiteQualificationRules.evaluate(scrapeResult);

    const finalScore = businessEvaluation.score + websiteEvaluation.score;

    const qualified = finalScore >= qualificationConfig.minimumScore;

    const qualificationReport = await QualificationRepository.createOrUpdate({
      leadId: lead.id,
      scrapeResultId,
      qualified,
      businessScore: businessEvaluation.score,
      opportunityScore: websiteEvaluation.score,
      score: finalScore,
      reasons: [...businessEvaluation.reasons, ...websiteEvaluation.reasons],
      qualificationType: 'SCRAPED',
    });

    await LeadsService.updateStatus(
      leadId,
      qualified ? LeadStatus.QUALIFIED : LeadStatus.NOT_QUALIFIED,
    );

    return qualificationReport;
  }

  static async qualifyLead({
    leadId,
    scrapeResultId,
    scrapeSkipped,
  }: {
    leadId: string;
    scrapeResultId?: string;
    scrapeSkipped?: boolean;
  }) {
    if (scrapeSkipped && leadId) {
      return this.qualifyWithoutScraping(leadId);
    } else if (scrapeResultId) {
      return this.qualifyWithScraping(leadId, scrapeResultId);
    } else {
      throw new Error(
        'Either scrapeResultId or leadId with scrapeSkipped flag must be provided for qualification',
      );
    }
  }
}
