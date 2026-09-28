export interface AIMetadata {
  provider: string;
  model: string;

  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };

  estimatedCostUsd: number;
  durationMs: number;
}
