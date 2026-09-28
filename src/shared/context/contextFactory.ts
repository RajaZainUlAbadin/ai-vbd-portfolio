import { randomUUID } from 'crypto';
import { ExecutionContext } from './executionContext';

export class ContextFactory {
  static create(data: Partial<ExecutionContext> = {}): ExecutionContext {
    return {
      traceId: randomUUID(),
      createdAt: new Date(),
      ...data,
    } as ExecutionContext;
  }
}
