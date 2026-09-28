export interface IAcquisitionSearch {
  id: string;

  acquisitionExecutionId?: string;

  searchMatrixId: string;
  
  provider: string;
  
  query: string;

  location?: string;
  
  searchHash: string;

  timesExecuted: number;

  totalResults?: number;

  durationMs?: number;

  lastFetchedAt?: Date;

  nextPageToken?: string;

  rawResponse?: unknown;

  createdAt: Date;

  updatedAt: Date;
}

export interface CreateAcquisitionSearch {
  acquisitionExecutionId: string;
  searchMatrixId: string;
  query: string;
  provider: string;
  location: string;
  searchHash: string;
}
