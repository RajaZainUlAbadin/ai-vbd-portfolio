export interface ExecutionContext {
  acquisitionExecutionId: string;

  traceId: string;
  leadId?: string;

  campaignId?: string;
  campaignExecutionId?: string;

  acquisitionBatchId?: string;
  acquisitionSearchId?: string;

  provider?: string;
  searchQuery?: string;
  searchMatrixId?: string;

  createdAt: Date;
}
