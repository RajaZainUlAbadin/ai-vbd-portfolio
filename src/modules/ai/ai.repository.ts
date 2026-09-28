import { IAIAnalysis } from './model/aiAnalysis.interface';
import { mapAIAnalysis } from './model/aiAnalysis.mapper';
import { AIAnalysisModel } from './model/aiAnalysis.model';

export class AIRepository {
  static async create(data: Partial<IAIAnalysis>): Promise<IAIAnalysis> {
    const document = await AIAnalysisModel.create(data);

    return mapAIAnalysis(document);
  }

  static async findById(id: string): Promise<IAIAnalysis | null> {
    const document = await AIAnalysisModel.findById(id);

    return document ? mapAIAnalysis(document) : null;
  }

  static async findLatestByLeadId(leadId: string): Promise<IAIAnalysis | null> {
    const document = await AIAnalysisModel.findOne({
      leadId,
    }).sort({
      createdAt: -1,
    });

    return document ? mapAIAnalysis(document) : null;
  }

  static async update(
    id: string,
    data: Partial<IAIAnalysis>,
  ): Promise<IAIAnalysis | null> {
    const document = await AIAnalysisModel.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
    });

    return document ? mapAIAnalysis(document) : null;
  }
}
