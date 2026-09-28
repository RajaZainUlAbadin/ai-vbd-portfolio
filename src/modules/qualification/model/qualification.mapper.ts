import { QualificationDocument } from './qualification.model';
import { IQualification } from './qualification.interface';

export function mapQualification(doc: QualificationDocument): IQualification {
  return {
    id: doc._id.toString(),

    leadId: doc.leadId.toString(),

    scrapeResultId: doc.scrapeResultId ? doc.scrapeResultId.toString() : null,

    qualified: doc.qualified,

    businessScore: doc.businessScore,

    opportunityScore: doc.opportunityScore,

    score: doc.score,

    reasons: doc.reasons ?? [],

    qualificationType: doc.qualificationType,

    createdAt: doc.createdAt,

    updatedAt: doc.updatedAt,
  };
}
