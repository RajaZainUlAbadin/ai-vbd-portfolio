// export interface QueuesHealthDto {
//   queues: QueueHealthDto[];
// }

// export interface QueueHealthDto {
//   name: string;
//   status: 'healthy' | 'paused' | 'warning' | 'unhealthy';

//   jobs: {
//     waiting: number;
//     active: number;
//     completed: number;
//     failed: number;
//     delayed: number;
//     paused: number;
//   };

//   worker: {
//     status: string;
//     lastSeen: string | null;
//   };

//   error?: string;
// }

export interface QueueJobCountsDto {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

export interface QueueWorkerDto {
  status: 'healthy' | 'offline' | 'unknown';
  lastSeen: string | null;
}

export interface QueueHealthDto {
  name: string;

  status: 'healthy' | 'warning' | 'paused' | 'unhealthy';

  jobs: QueueJobCountsDto;

  worker: QueueWorkerDto;

  error?: string;
}

export interface QueuesHealthSummaryDto {
  total: number;
  healthy: number;
  warning: number;
  paused: number;
  unhealthy: number;

  failedJobs: number;

  workersHealthy: number;
  workersTotal: number;
}

export interface QueuesHealthDto {
  summary: QueuesHealthSummaryDto;

  queues: QueueHealthDto[];
}
