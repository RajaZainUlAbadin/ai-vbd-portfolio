import { ProcessingFailureModel } from './processingFailure.model';

export class ProcessingFailureRepository {
  static async getRecentSummary(hours = 1) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return ProcessingFailureModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: since,
          },
        },
      },
      {
        $group: {
          _id: {
            stage: '$stage',
            category: '$category',
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);
  }
}
