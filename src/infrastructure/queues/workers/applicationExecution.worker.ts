import os from 'os';
import { Job } from 'bullmq';
import { createWorker } from '../core/createWorker';
import { QUEUE_NAMES } from '../constants/queueNames';
import { ApplicationExecutionService } from '@/modules/application-settings/applicationExecution.service';
import { logger } from '@/shared/logger/logger';

export const applicationExecutionWorker = createWorker(
  QUEUE_NAMES.APPLICATION_EXECUTION,

  async (_job: Job) => {
    try {
      logger.info({
        module: 'application-execution-worker',
        event: 'Application-execution.started',
        message: 'Application execution worker started',
        pid: process.pid,
        hostname: os.hostname(),
      });

      await ApplicationExecutionService.tick();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error({
        module: 'application-execution-worker',
        event: 'application-execution.failed',
        message: `Application Execution Error: ${err.message}`,
        queue: QUEUE_NAMES.APPLICATION_EXECUTION,
        error: err,
        stack: err.stack,
      });

      throw err;
    }
  },
);
