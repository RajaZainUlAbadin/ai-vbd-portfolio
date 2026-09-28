import {
  DashboardOverviewDto,
  DashboardPipelineStageDto,
  DashboardProviderDto,
  DashboardSystemControlDto,
} from './dashboard-overview.dto';
import { DashboardActivityDto } from './dashboard-activity.dto';
import { QueueHealthDto, QueuesHealthDto } from './queue-health.dto';
import { SystemHealthDto } from './system-health.dto';

interface OverviewSource {
  system: {
    enabled: boolean;
    acquisitionEnabled: boolean;
    outreachEnabled: boolean;
    followupEnabled: boolean;
  };

  metrics: {
    totalLeads: number;
    newToday: number;
    qualified: number;
    readyForOutreach: number;
    outreachSentToday: number;
    replies: number;
    followupsPending: number;
  };

  pipeline: {
    acquired: number;
    qualified: number;
    analyzed: number;
    readyForOutreach: number;
    contacted: number;
    replied: number;
  };

  providers: Array<{
    provider: string;
    leads: number;
    qualified: number;
    rejected: number;
    analyzed: number;
    contacted: number;
    replied: number;
    qualificationRate: number;
    replyRate: number;
  }>;
}

interface ActivitySource {
  type: string;
  title: string;
  description: string;
  timestamp: Date | string;

  metadata?: {
    leadId?: string;
    outreachId?: string;
    messageId?: string;
    channel?: string;
  };
}

interface QueueSource {
  name: string;

  status: string;

  jobs: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  };

  worker: {
    status: 'healthy' | 'offline' | 'unknown';
    lastSeen: string | null;
  };

  error?: string;
}

export class DashboardMapper {
  static toOverviewDto(source: OverviewSource): DashboardOverviewDto {
    const totalLeads = source.metrics.totalLeads;

    return {
      kpis: {
        totalLeads: {
          value: source.metrics.totalLeads,
          change: '—',
          trend: 'flat',
        },

        newLeadsToday: {
          value: source.metrics.newToday,
          change: 'Today',
          trend: 'flat',
        },

        qualifiedLeads: {
          value: source.metrics.qualified,
          change: '—',
          trend: 'flat',
        },

        readyForOutreach: {
          value: source.metrics.readyForOutreach,
          change: '—',
          trend: 'flat',
        },

        outreachSentToday: {
          value: source.metrics.outreachSentToday,
          change: 'Today',
          trend: 'flat',
        },

        replies: {
          value: source.metrics.replies,
          change: '—',
          trend: 'flat',
        },

        followUpsPending: {
          value: source.metrics.followupsPending,
          change: 'Pending',
          trend: 'flat',
        },

        // Queue health is the real source for failed jobs.
        // We keep this temporarily for UI compatibility.
        failedJobs: {
          value: 0,
          change: '—',
          trend: 'flat',
        },
      },

      pipeline: this.toPipeline(source.pipeline, totalLeads),

      providers: source.providers.map(this.toProviderDto),

      controls: this.toSystemControls(source.system),
    };
  }

  private static toPipeline(
    pipeline: OverviewSource['pipeline'],
    total: number,
  ): DashboardPipelineStageDto[] {
    const pct = (count: number) => {
      if (total <= 0) {
        return 0;
      }

      return Math.round((count / total) * 100);
    };

    return [
      {
        key: 'acquired',
        label: 'Acquired',
        count: pipeline.acquired,
        pct: pct(pipeline.acquired),
        change: '—',
      },

      {
        key: 'qualified',
        label: 'Qualified',
        count: pipeline.qualified,
        pct: pct(pipeline.qualified),
        change: '—',
      },

      {
        key: 'analyzed',
        label: 'Analyzed',
        count: pipeline.analyzed,
        pct: pct(pipeline.analyzed),
        change: '—',
      },

      {
        key: 'ready',
        label: 'Ready',
        count: pipeline.readyForOutreach,
        pct: pct(pipeline.readyForOutreach),
        change: '—',
      },

      {
        key: 'contacted',
        label: 'Contacted',
        count: pipeline.contacted,
        pct: pct(pipeline.contacted),
        change: '—',
      },

      {
        key: 'replied',
        label: 'Replied',
        count: pipeline.replied,
        pct: pct(pipeline.replied),
        change: '—',
      },
    ];
  }

  private static toProviderDto(
    provider: OverviewSource['providers'][number],
  ): DashboardProviderDto {
    return {
      id: provider.provider,

      name: provider.provider,

      type: 'acquisition',

      status: 'active',

      leads: provider.leads,

      qualified: provider.qualified,

      outreach: provider.contacted,

      replies: provider.replied,
    };
  }

  private static toSystemControls(
    system: OverviewSource['system'],
  ): DashboardSystemControlDto[] {
    return [
      {
        key: 'application',

        label: 'Application',

        description: 'Enable or pause the complete application workflow.',

        status: system.enabled ? 'running' : 'paused',
      },

      {
        key: 'acquisition',

        label: 'Lead Acquisition',

        description: 'Control automatic lead acquisition.',

        status: system.acquisitionEnabled ? 'running' : 'paused',
      },

      {
        key: 'outreach',

        label: 'Outreach',

        description: 'Control automated outreach campaigns.',

        status: system.outreachEnabled ? 'running' : 'paused',
      },

      {
        key: 'followups',

        label: 'Follow-ups',

        description: 'Control automated follow-up messages.',

        status: system.followupEnabled ? 'running' : 'paused',
      },
    ];
  }

  static toActivityDto(activity: ActivitySource): DashboardActivityDto {
    const timestamp = new Date(activity.timestamp);

    return {
      time: this.formatActivityTime(timestamp),
      text: activity.title ?? '',
      entity: activity.description ?? '',
      type: this.getActivityTone(activity.type),
      link: this.getActivityLink(activity),
    };
  }

  static toActivityListDto(
    activities: ActivitySource[],
  ): DashboardActivityDto[] {
    return activities.map(this.toActivityDto);
  }

  private static getActivityTone(type: string): DashboardActivityDto['type'] {
    switch (type) {
      case 'LEAD_CREATED':
        return 'info';

      case 'OUTREACH_CREATED':
      case 'MESSAGE_SENT':
        return 'success';

      case 'MESSAGE_RECEIVED':
        return 'success';

      default:
        return 'neutral';
    }
  }

  private static getActivityLink(
    activity: ActivitySource,
  ): DashboardActivityDto['link'] {
    if (activity.metadata?.leadId) {
      return {
        page: 'lead',
        id: activity.metadata.leadId,
      };
    }

    if (activity.metadata?.outreachId) {
      return {
        page: 'conversation',
        id: activity.metadata.outreachId,
      };
    }

    return null;
  }

  private static formatActivityTime(
    date: Date | string | null | undefined,
  ): string {
    if (!date) {
      return '';
    }

    const activityDate = new Date(date);

    if (Number.isNaN(activityDate.getTime())) {
      return '';
    }

    return activityDate.toISOString();
  }

  static toSystemHealthDto(
    source: {
      application: string;
      database: string;
      redis: string;
      timestamp: Date;
    },
    queues?: QueuesHealthDto,
  ): SystemHealthDto {
    const workersHealthy = queues?.summary.workersHealthy ?? 0;

    const workersTotal = queues?.summary.workersTotal ?? 0;

    return {
      overall: source.application === 'healthy' ? 'running' : 'error',

      mongodb: {
        status: this.toHealthStatus(source.database),

        label: source.database === 'healthy' ? 'Connected' : 'Unavailable',

        latency: null,
      },

      redis: {
        status: this.toHealthStatus(source.redis),

        label: source.redis === 'healthy' ? 'Connected' : 'Unavailable',

        latency: null,
      },

      workers: {
        status:
          workersTotal === 0
            ? 'degraded'
            : workersHealthy === workersTotal
              ? 'healthy'
              : 'degraded',

        label:
          workersTotal > 0
            ? `${workersHealthy}/${workersTotal} online`
            : 'Unknown',

        latency: null,
      },

      lastActivity: source.timestamp.toISOString(),
    };
  }

  private static toHealthStatus(
    status: string,
  ): 'healthy' | 'degraded' | 'down' {
    if (status === 'healthy') {
      return 'healthy';
    }

    if (status === 'degraded') {
      return 'degraded';
    }

    return 'down';
  }

  static toQueuesHealthDto(queues: QueueSource[]): QueuesHealthDto {
    const normalizedQueues: QueueHealthDto[] = queues.map((queue) => ({
      name: queue.name,

      status:
        queue.status === 'healthy'
          ? 'healthy'
          : queue.status === 'paused'
            ? 'paused'
            : queue.status === 'warning'
              ? 'warning'
              : 'unhealthy',

      jobs: queue.jobs,

      worker: queue.worker,

      ...(queue.error ? { error: queue.error } : {}),
    }));

    const summary = normalizedQueues.reduce(
      (accumulator, queue) => {
        accumulator.total += 1;

        accumulator[queue.status] += 1;

        accumulator.failedJobs += queue.jobs.failed;

        accumulator.workersTotal += 1;

        if (queue.worker.status === 'healthy') {
          accumulator.workersHealthy += 1;
        }

        return accumulator;
      },
      {
        total: 0,

        healthy: 0,

        warning: 0,

        paused: 0,

        unhealthy: 0,

        failedJobs: 0,

        workersHealthy: 0,

        workersTotal: 0,
      },
    );

    return {
      summary,

      queues: normalizedQueues,
    };
  }
}
