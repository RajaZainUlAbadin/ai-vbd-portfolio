import OpenAI from 'openai';

import { env } from '@/app/config/env';
import { AIProvider } from '../base/AIProvider';
import {
  AIAnalysisInput,
  AIAnalysisResponse,
  AIAnalysis,
} from '../types/AIAnalysis';
import { logger } from '@/shared/logger/logger';
import { OutreachMessage } from '@/modules/ai/model/aiAnalysis.interface';
import { AIResponseInput, AIResponseResult } from '../types/AIResponse';
import { AIMetadata } from '../types/AIMetaData';

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export class OpenAIProvider implements AIProvider {
  name = 'openai';

  async analyzeBusiness(input: AIAnalysisInput): Promise<AIAnalysisResponse> {
    const startTime = Date.now();

    /*
     * Production implementation:
     * - Builds a structured business-analysis prompt
     * - Uses a JSON schema constrained response
     * - Sends business information to the configured AI model
     *
     * Proprietary prompts and response schemas have been
     * intentionally omitted from this portfolio version.
     */

    const response = await client.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: 0.2,
      response_format: {
        type: 'json_object',
      },
      messages: [
        {
          role: 'system',
          content: '[Business analysis prompt omitted]',
        },
        {
          role: 'user',
          content: JSON.stringify(input),
        },
      ],
    });

    const durationMs = Date.now() - startTime;

    const analysis = this.unwrapResponse<AIAnalysis>(response.choices[0]);

    if (!analysis.businessName || !analysis.businessSummary) {
      logger.error(`Parsed AI object: ${JSON.stringify(analysis)}`);
      throw new Error('AI response does not match expected schema.');
    }

    return {
      analysis,
      metadata: this.buildMetadata(response, durationMs),
    };
  }

  private calculateCost(
    promptTokens: number,
    completionTokens: number,
  ): number {
    /*
     * Production pricing configuration omitted.
     * Demonstrates token-based cost estimation.
     */

    const INPUT_RATE = 0;
    const OUTPUT_RATE = 0;

    return promptTokens * INPUT_RATE + completionTokens * OUTPUT_RATE;
  }

  private buildMetadata(
    response: OpenAI.Chat.Completions.ChatCompletion,
    durationMs: number,
  ): AIMetadata {
    if (!response.usage) {
      throw new Error('AI usage data missing.');
    }

    return {
      provider: this.name,
      model: response.model,

      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      },

      estimatedCostUsd: this.calculateCost(
        response.usage.prompt_tokens,
        response.usage.completion_tokens,
      ),

      durationMs,
    };
  }

  async generateResponse(input: AIResponseInput): Promise<AIResponseResult> {
    const startTime = Date.now();

    /*
     * Production implementation generates an outreach response
     * based on conversation context and the configured objective.
     *
     * Proprietary prompt and response schema omitted.
     */

    const response = await client.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: 0.4,
      response_format: {
        type: 'json_object',
      },
      messages: [
        {
          role: 'system',
          content: '[Response generation prompt omitted]',
        },
        {
          role: 'user',
          content: JSON.stringify(input),
        },
      ],
    });

    const durationMs = Date.now() - startTime;

    const message = this.unwrapResponse<OutreachMessage>(response.choices[0]);

    return {
      message,
      metadata: this.buildMetadata(response, durationMs),
    };
  }

  private unwrapResponse<T>(
    choice: OpenAI.Chat.Completions.ChatCompletion.Choice,
  ): T {
    if (!choice) {
      throw new Error('No AI response returned.');
    }

    if (choice.finish_reason !== 'stop') {
      throw new Error(`AI response incomplete: ${choice.finish_reason}`);
    }

    if (choice.message.refusal) {
      throw new Error(choice.message.refusal);
    }

    if (!choice.message.content) {
      throw new Error('AI returned an empty response.');
    }

    try {
      return JSON.parse(choice.message.content) as T;
    } catch (error) {
      logger.error(`Failed to parse AI response: ${error}`);
      throw new Error('AI returned invalid JSON.');
    }
  }
}
