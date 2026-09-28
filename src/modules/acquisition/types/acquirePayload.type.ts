import { ExecutionContext } from '@/shared/context/executionContext';

export interface AcquirePayload {
  context: ExecutionContext;
  provider: string;
  query: string;
  location: string;
}
