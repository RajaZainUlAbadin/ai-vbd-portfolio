import { IAIAnalysis } from '../model/aiAnalysis.interface';
import { AiAnalysisDto } from './aiAnalysis.dto';

export function toAiAnalysisDto(analysis: IAIAnalysis): AiAnalysisDto {
  return {
    id: analysis.id,
    leadId: analysis.leadId,

    summary: analysis.businessSummary,

    strengths: analysis.strengths ?? [],

    // Backend currently has painPoints
    weaknesses: analysis.painPoints ?? [],

    opportunities: analysis.opportunities ?? [],

    // Using painPoints for now
    detectedProblems: analysis.painPoints ?? [],

    recommendedServices: analysis.recommendedServices ?? [],

    // Best available score for current UI
    leadScore: analysis.opportunityScore,

    qualificationScore: analysis.qualification?.score ?? 0,

    aiConfidence: analysis.confidenceScore,

    analysisProvider: analysis.provider ?? 'AI',

    analyzedAt: analysis.createdAt.toISOString(),
  };
}
