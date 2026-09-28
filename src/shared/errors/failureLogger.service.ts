import { FailureCategory } from './failureCategory';
import { ProcessingFailureModel } from './processingFailure.model';
import { ExecutionContext } from '@/shared/context/executionContext';

export class FailureLogger {
  static async log(params: {
    context: ExecutionContext;
    leadId?: string;
    stage: string;
    category: FailureCategory;
    message: string;
    payload?: any;
    error?: any;
  }) {
    await ProcessingFailureModel.create({
      traceId: params.context.traceId,
      leadId: params.leadId,
      stage: params.stage,
      category: params.category,
      message: params.message,
      errorStack: params.error?.stack,
      payload: params.payload,
    });
  }
}
