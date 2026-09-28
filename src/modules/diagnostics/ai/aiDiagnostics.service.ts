import { AIService } from '@/modules/ai/ai.service';
import { OutreachRepository } from '@/modules/outreach/outreach/outreach.repository';
import { ResponseType } from '@/providers/ai/types/AIResponse';

export class AIDiagnosticsService {
  static async generateFollowup(outreachId: string) {
    const outreach = await OutreachRepository.findById(outreachId);

    if (!outreach) {
      throw new Error('Outreach not found');
    }

    const ai = new AIService();
    const started = Date.now();

    const response = await ai.generateResponse(
      outreach,
      ResponseType.FOLLOW_UP,
    );

    return {
      success: true,
      durationMs: Date.now() - started,
      response,
    };
  }
}
