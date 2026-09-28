import { ApplicationSettingsService } from '@/modules/application-settings/applicationSettings.service';
import mongoose from 'mongoose';
import { healthRedis as redis } from '@/infrastructure/redis/redis.client';
import { DashboardRepository } from './dashboard.repository';
import { queues } from '@/infrastructure/queues';
import { WorkerHealthService } from '@/infrastructure/queues/core/workerHealth.service';
import { DashboardMapper } from './dto/dashboard.mapper';

export class DashboardService {
  static async overview() {
    const [settings, leadMetrics, providerPerformance] = await Promise.all([
      ApplicationSettingsService.getSettings(),
      DashboardRepository.getDashboardMetrics(),
      DashboardRepository.getProviderPerformance(),
    ]);

    return DashboardMapper.toOverviewDto({
      system: {
        enabled: settings.enabled,
        acquisitionEnabled: settings.acquisition?.enabled ?? false,
        outreachEnabled: settings.outreach?.enabled ?? false,
        followupEnabled: settings.followup?.enabled ?? false,
      },

      metrics: leadMetrics.metrics,
      pipeline: leadMetrics.pipeline,
      providers: providerPerformance,
    });
  }

  static async activity() {
    const activities = await DashboardRepository.getRecentActivity(20);

    return DashboardMapper.toActivityListDto(activities);
  }

  static async systemHealth() {
    const databaseHealthy = mongoose.connection.readyState === 1;

    let redisHealthy = false;

    try {
      const response = await redis.ping();

      redisHealthy = response === 'PONG';
    } catch {
      redisHealthy = false;
    }

    const applicationHealthy = databaseHealthy && redisHealthy;

    return DashboardMapper.toSystemHealthDto({
      application: applicationHealthy ? 'healthy' : 'degraded',

      database: databaseHealthy ? 'healthy' : 'unhealthy',

      redis: redisHealthy ? 'healthy' : 'unhealthy',

      timestamp: new Date(),
    });
  }

  static async getQueuesHealth() {
    const queueResults = await Promise.all(
      queues.map(async (queue) => {
        try {
          const [counts, isPaused, workerHealth] = await Promise.all([
            queue.getJobCounts(
              'waiting',
              'active',
              'completed',
              'failed',
              'delayed',
              'paused',
            ),

            queue.isPaused(),

            WorkerHealthService.getHealth(queue.name),
          ]);

          let status: 'healthy' | 'paused' | 'warning' = 'healthy';

          if (isPaused) {
            status = 'paused';
          } else if (!workerHealth.lastSeen) {
            status = 'warning';
          } else if (counts.failed > 0) {
            status = 'warning';
          }

          return {
            name: queue.name,

            status,

            jobs: {
              waiting: counts.waiting ?? 0,

              active: counts.active ?? 0,

              completed: counts.completed ?? 0,

              failed: counts.failed ?? 0,

              delayed: counts.delayed ?? 0,

              paused: counts.paused ?? 0,
            },

            worker: {
              status: workerHealth.status as 'healthy' | 'offline' | 'unknown',

              lastSeen: workerHealth.lastSeen,
            },
          };
        } catch (error) {
          return {
            name: queue.name,

            status: 'unhealthy' as const,

            jobs: {
              waiting: 0,
              active: 0,
              completed: 0,
              failed: 0,
              delayed: 0,
              paused: 0,
            },

            worker: {
              status: 'unknown' as const,

              lastSeen: null,
            },

            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }),
    );

    return DashboardMapper.toQueuesHealthDto(queueResults);
  }

  static async getProviderPerformance() {
    return DashboardRepository.getProviderPerformance();
  }
}
