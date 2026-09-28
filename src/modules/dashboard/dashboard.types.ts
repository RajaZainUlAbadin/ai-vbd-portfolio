export interface ProviderPerformance {
  provider: string;
  leads: number;
  qualified: number;
  qualificationRate: number;
  rejected: number;
  analyzed: number;
  contacted: number;
  replied: number;
  replyRate: number;
}

export interface DashboardOverview {
  system: {
    enabled: boolean;
    acquisitionEnabled: boolean;
    outreachEnabled: boolean;
    followupsEnabled: boolean;
    redis: 'connected' | 'disconnected';
    mongo: 'connected' | 'disconnected';
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
    ready: number;
    contacted: number;
    replied: number;
  };

  providers: ProviderPerformance[];
}

export interface LeadDashboardMetrics {
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
}

export interface QueueHealth {
  name: 'LEAD_ACQUISITION';
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}
