import { AIAnalysisInput, AIAnalysisResponse } from '../types/AIAnalysis';
import { AIResponseInput, AIResponseResult } from '../types/AIResponse';

export interface AIProvider {
  name: string;
  analyzeBusiness(input: AIAnalysisInput): Promise<AIAnalysisResponse>;
  generateResponse(input: AIResponseInput): Promise<AIResponseResult>;
}
