import { LeadModel } from '../../lead/model/lead.model';

export class BusinessQualificationRules {
  static async evaluate(lead: any) {
    let score = 0;

    const reasons: string[] = [];

    // High review volume
    if ((lead.reviewCount ?? 0) > 500) {
      score += 25;
      reasons.push('High review volume');
    }

    // Excellent rating
    if ((lead.rating ?? 0) >= 4.5) {
      score += 20;
      reasons.push('Excellent rating');
    }

    // Has website
    if (lead.website) {
      score += 10;
      reasons.push('Website available');
    }

    // Operational
    if (lead.businessStatus === 'OPERATIONAL') {
      score += 10;
      reasons.push('Operational business');
    }

    return {
      score,
      reasons,
    };
  }
}
