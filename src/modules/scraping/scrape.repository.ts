import { mapIScrapeResult } from './mapper/mapIScrapResult';
import {
  IScrapeResult,
  ScrapeResultDocument,
  ScrapeResultModel,
  ScrapeResultRecord,
} from './model/scrapeResult.model';

export class ScrapeRepository {
  static async getAll(): Promise<IScrapeResult[]> {
    const scrapes = await ScrapeResultModel.find()
      .sort({ createdAt: -1 })
      .lean();
    return scrapes.map(mapIScrapeResult);
  }

  static async create(
    data: Partial<ScrapeResultDocument>,
  ): Promise<ScrapeResultDocument> {
    return ScrapeResultModel.create(data);
  }

  static async update(
    id: string,
    data: Partial<ScrapeResultDocument>,
  ): Promise<ScrapeResultDocument | null> {
    return ScrapeResultModel.findByIdAndUpdate(
      id,
      {
        $set: data,
      },
      {
        returnDocument: 'after',
      },
    );
  }

  static async findById(id: string): Promise<ScrapeResultDocument | null> {
    return ScrapeResultModel.findById(id);
  }

  static async findLatestByLeadId(
    leadId: string,
  ): Promise<ScrapeResultRecord | null> {
    return ScrapeResultModel.findOne({ leadId }).sort({ createdAt: -1 }).lean();
  }

  static async clean_HtmlFields() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    await ScrapeResultModel.updateMany(
      {
        createdAt: {
          $lt: cutoffDate,
          // $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        html: { $exists: true },
      },
      {
        $unset: {
          html: 1,
        },
      },
    );
  }
}
