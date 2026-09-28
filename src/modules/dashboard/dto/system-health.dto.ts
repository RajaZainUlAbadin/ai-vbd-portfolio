// export interface SystemHealthDto {
//   application: "healthy" | "degraded";
//   database: "healthy" | "unhealthy";
//   redis: "healthy" | "unhealthy";
//   timestamp: string;
// }

export interface SystemHealthComponentDto {
  status: 'healthy' | 'degraded' | 'down';

  label: string;

  latency: string | null;
}

export interface SystemHealthDto {
  overall: 'running' | 'paused' | 'error';

  mongodb: SystemHealthComponentDto;

  redis: SystemHealthComponentDto;

  workers: SystemHealthComponentDto;

  lastActivity: string;
}
