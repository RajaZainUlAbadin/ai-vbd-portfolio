import { ExecutionContext } from '@/shared/context/executionContext';

export interface BaseQueueJob<T = unknown> {
  context: ExecutionContext;
  data: T;
}
