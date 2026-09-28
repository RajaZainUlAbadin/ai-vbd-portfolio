export interface IAcquisitionBatch {
  id: string;

  acquisitionExecutionId?: string;
  acquisitionSearchId?: string;

  provider: string;
  query: string;

  location?: string;

  traceId?: string;

  totalResults?: number;

  rawResponse?: unknown;

  expiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// export interface CreateAcquisitionBatchInput {
//   acquisitionExecutionId?: string;
//   acquisitionSearchId?: string;
//   provider: string;
//   query: string;
//   location?: string;
// }
