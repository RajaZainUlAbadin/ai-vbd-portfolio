import { Category, Provider } from '@/shared/constants/system.types';
import { CostLedger, CostLedgerModel } from './cost-ledger.model';

export class CostLedgerRepository {
  static async create(data: CostLedger) {
    return CostLedgerModel.create(data);
  }

  static async findByLeadId(leadId: string) {
    return CostLedgerModel.find({ leadId }).sort({ createdAt: -1 });
  }

  static async findByBatchId(batchId: string) {
    return CostLedgerModel.find({ batchId }).sort({ createdAt: -1 });
  }

  static async findByProvider(provider: Provider) {
    return CostLedgerModel.find({ provider });
  }

  static async aggregateByLead(leadId: string) {
    return CostLedgerModel.aggregate([
      { $match: { leadId } },
      {
        $group: {
          _id: '$leadId',
          totalCost: { $sum: '$amount' },
        },
      },
    ]);
  }

  static async aggregateByProvider(provider?: Provider) {
    const matchStage = provider ? { $match: { provider } } : { $match: {} };

    return CostLedgerModel.aggregate([
      matchStage,
      {
        $group: {
          _id: '$provider',
          totalCost: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalCost: -1 },
      },
    ]);
  }

  static async aggregateByCategory(category?: Category) {
    const matchStage = category ? { $match: { category } } : { $match: {} };

    return CostLedgerModel.aggregate([
      matchStage,
      {
        $group: {
          _id: '$category',
          totalCost: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalCost: -1 },
      },
    ]);
  }

  static async breakdownByProviderAndCategory() {
    return CostLedgerModel.aggregate([
      {
        $group: {
          _id: {
            provider: '$provider',
            category: '$category',
          },
          totalCost: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalCost: -1 },
      },
    ]);
  }
}
