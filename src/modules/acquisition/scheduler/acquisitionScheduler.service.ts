import { leadAcquisitionQueue } from '@/infrastructure/queues';
import { SearchMatrixService } from '../../search-matrix/searchMatrix.service';
import { ContextFactory } from '@/shared/context/contextFactory';
import { AcquisitionExecutionRepository } from '../acquisition-execution/acquisitionExecution.repository';
import { createTraceId } from '@/shared/utils/createTraceId';
import { LeadAcquisitionPayload } from '@/infrastructure/queues/types/leadAcquisitionPayload';
import { BaseQueueJob } from '@/infrastructure/queues/types/baseQueueJob';
import { ExecutionContext } from '@/shared/context/executionContext';
import {
  AcquisitionExecutionSource,
  AcquisitionExecutionStatus,
} from '../acquisition-execution/acquisitionExecution.interface';
import { LeadProvider } from '@/shared/constants';
import { logger } from '@/shared/logger/logger';

// const DEFAULT_PROVIDER = 'google_places';

export class AcquisitionSchedulerService {
  static async run(provider: LeadProvider) {
    const startedAt = Date.now();

    try {
      const matrix = await SearchMatrixService.getNextSearchMatrix();

      if (!matrix) {
        logger.info({
          module: 'acquisition-scheduler',
          message: 'Empty Search_Matrix',
        });

        throw new Error('Search_Matrix not found');
      }

      const execution = await AcquisitionExecutionRepository.create({
        status: AcquisitionExecutionStatus.RUNNING,
        source: AcquisitionExecutionSource.SCHEDULED,
        providers: [provider],
        targetMatrixId: matrix.id,
        startedAt: new Date(),
      });

      const context: ExecutionContext = ContextFactory.create({
        traceId: createTraceId(),
        provider: provider,
        acquisitionExecutionId: execution.id,
        searchMatrixId: matrix.id,
        searchQuery: matrix.query,
      });

      const job = await leadAcquisitionQueue.add('acquire', {
        context,
        data: {
          sourceId: 'SCHEDULED',
          provider: provider,
          query: matrix.query,
          location: matrix.location ?? 'UAE',
        },
      } satisfies BaseQueueJob<LeadAcquisitionPayload>);

      await SearchMatrixService.markExecuted(matrix.id);

      logger.info({
        module: 'acquisition-scheduler',
        event: 'lead-acquisition.job.queued',
        message: 'Lead acquisition job successfully added to queue',
        jobId: job.id,
        provider,
        query: matrix.query,
        location: matrix.location ?? 'UAE',
        traceId: context.traceId,
        acquisitionExecutionId: execution.id,
        searchMatrixId: matrix.id,
      });

      logger.info({
        module: 'acquisition-scheduler',
        event: 'acquisition-scheduler.completed',
        message: 'Acquisition scheduler completed',
        provider,
        durationMs: Date.now() - startedAt,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error({
        module: 'acquisition-scheduler',
        event: 'acquisition-scheduler.failed',
        message: 'Acquisition scheduler failed',
        provider,
        error: err,
        stack: err.stack,
        durationMs: Date.now() - startedAt,
      });

      throw err;
    }
  }
}
