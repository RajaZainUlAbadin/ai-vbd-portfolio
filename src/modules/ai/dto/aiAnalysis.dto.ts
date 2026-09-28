export interface AiAnalysisDto {
  id: string;
  leadId: string;

  summary: string;

  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  detectedProblems: string[];

  recommendedServices: string[];

  leadScore: number;
  qualificationScore: number;
  aiConfidence: number;

  analysisProvider: string;
  analyzedAt: string;
}
