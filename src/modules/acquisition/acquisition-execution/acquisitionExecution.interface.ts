export interface CreateAcquisitionExecutionInput {
  status: AcquisitionExecutionStatus;
  source: AcquisitionExecutionSource;
  targetMatrixId?: string;
  providers: string[];
  startedAt?: Date;
}

export enum AcquisitionExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum AcquisitionExecutionSource {
  SCHEDULED = 'SCHEDULED',
  MANUAL = 'MANUAL',
  TEST = 'TEST',
}

export interface IAcquisitionExecution {
  id: string;

  status: AcquisitionExecutionStatus;

  source: AcquisitionExecutionSource;

  targetMatrixId?: string;

  providers: string[];

  searchesExecuted: number;

  leadsFound: number;

  newLeads: number;

  qualifiedLeads: number;

  totalCost: number;

  startedAt?: Date;

  completedAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}
