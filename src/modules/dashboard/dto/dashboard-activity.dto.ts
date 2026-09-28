// export interface DashboardActivityDto {
//   id: string;
//   timestamp: string;
//   event: string;
//   entity: string;
//   description: string;
//   entityId: string | null;
// }

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
