import { EmailUsageModel } from './emailUsage.model';

export class EmailUsageRepository {
  static currentMonth() {
    return new Date().toISOString().slice(0, 7);
  }

  static async increment(provider: string) {
    return EmailUsageModel.findOneAndUpdate(
      {
        provider,
        month: this.currentMonth(),
      },
      {
        $inc: {
          sentCount: 1,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      },
    );
  }

  static async getUsage(provider: string) {
    return EmailUsageModel.findOne({
      provider,
      month: this.currentMonth(),
    });
  }
}
