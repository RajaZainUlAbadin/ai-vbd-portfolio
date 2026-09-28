import { IAIAnalysis } from './aiAnalysis.interface';
import { AIAnalysisModel } from './aiAnalysis.model';

export function mapAIAnalysis(
  doc: InstanceType<typeof AIAnalysisModel>,
): IAIAnalysis {
  return {
    id: doc._id.toString(),

    leadId: doc.leadId.toString(),

    scrapeResultId: doc.scrapeResultId?.toString(),

    provider: doc.provider || undefined,

    model: doc.model,

    businessName: doc.businessName,

    businessSummary: doc.businessSummary,

    confidenceScore: doc.confidenceScore,

    estimatedBusinessSize: doc.estimatedBusinessSize ?? undefined,

    contacts: doc.contacts ?? [],

    businessMaturityScore: doc.businessMaturityScore,

    digitalPresenceScore: doc.digitalPresenceScore,

    uxScore: doc.uxScore,

    seoScore: doc.seoScore,

    opportunityScore: doc.opportunityScore,

    conversionProbability: doc.conversionProbability,

    mobileCheck: doc.mobileCheck ?? undefined,

    keyFindings: doc.keyFindings ?? [],

    strengths: doc.strengths ?? [],

    painPoints: doc.painPoints ?? [],

    primaryPainPoint: doc.primaryPainPoint,

    opportunities: doc.opportunities ?? [],

    recommendedServices: doc.recommendedServices ?? [],

    personalizedOutreach: doc.personalizedOutreach
      ? {
          message: doc.personalizedOutreach.message ?? '',
          subject: doc.personalizedOutreach.subject ?? '',
          greeting: doc.personalizedOutreach.greeting ?? '',
          opening: doc.personalizedOutreach.opening ?? '',
          closing: doc.personalizedOutreach.closing ?? '',
        }
      : undefined,

    qualification: doc.qualification ?? undefined,

    priority: doc.priority,

    createdAt: doc.createdAt,

    updatedAt: doc.updatedAt,
  };
}
