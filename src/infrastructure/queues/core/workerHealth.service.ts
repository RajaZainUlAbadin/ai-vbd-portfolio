import { healthRedis } from '@/infrastructure/redis/redis.client';

export class WorkerHealthService {
  private static readonly PREFIX = 'worker:heartbeat';

  static getKey(queueName: string): string {
    return `${this.PREFIX}:${queueName}`;
  }

  static async heartbeat(queueName: string): Promise<void> {
    const key = this.getKey(queueName);

    await healthRedis.set(key, new Date().toISOString(), 'EX', 60);
  }

  static async getHealth(queueName: string) {
    const key = this.getKey(queueName);

    const lastSeen = await healthRedis.get(key);

    if (!lastSeen) {
      return {
        queue: queueName,
        status: 'offline',
        lastSeen: null,
      };
    }

    return {
      queue: queueName,
      status: 'healthy',
      lastSeen,
    };
  }
}
