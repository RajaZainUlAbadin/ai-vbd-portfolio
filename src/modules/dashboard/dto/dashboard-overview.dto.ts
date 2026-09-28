// export interface DashboardOverviewDto {
//   kpis: DashboardKpisDto;
//   pipeline: DashboardPipelineStageDto[];
//   providers: Provider[];
//   controls: DashboardSystemControlDto[];
// }

export interface DashboardOverviewDto {
  kpis: Record<DashboardKpiKey, DashboardKpiDto>;
  pipeline: DashboardPipelineStageDto[];
  providers: DashboardProviderDto[];
  controls: DashboardSystemControlDto[];
}

export interface DashboardActivityDto {
  time: string;
  text: string;
  entity: string;

  type: 'success' | 'info' | 'warning' | 'danger' | 'neutral';

  link: {
    page: 'lead' | 'conversation' | 'provider';
    id: string;
  } | null;
}

export interface DashboardProviderDto {
  id: string;
  name: string;
  type: 'acquisition';
  status:
    | 'active'
    | 'connected'
    | 'running'
    | 'inactive'
    | 'paused'
    | 'degraded'
    | 'error'
    | 'disconnected';

  leads: number;
  qualified: number;
  outreach: number;
  replies: number;
}

export interface DashboardSystemControlDto {
  key: 'application' | 'acquisition' | 'outreach' | 'followups';

  label: string;
  description: string;

  status: 'running' | 'paused';
}

export interface DashboardPipelineStageDto {
  key: string;
  label: string;
  count: number;
  pct: number;
  change: string;
}

export type DashboardKpiKey =
  | 'totalLeads'
  | 'newLeadsToday'
  | 'qualifiedLeads'
  | 'readyForOutreach'
  | 'outreachSentToday'
  | 'replies'
  | 'followUpsPending'
  | 'failedJobs';

export interface DashboardKpiDto {
  value: number;
  change: string;
  trend: 'up' | 'down' | 'flat';
}
