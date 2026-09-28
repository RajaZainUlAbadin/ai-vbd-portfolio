import { bootstrapApp, bootstrapWorkers } from '@/app/bootstrap';

import { browserManager } from '@/infrastructure/browser/browserManager';
import { resetAllQueuesForDevelopment } from '../bootstrap/resetBullMQJobs';
import { registerProviders } from '@/providers';
import { logger } from '@/shared/logger/logger';

const loadWorkers = async () => {
  const [
    aiAnalysis,
    applicationExecution,
    followUp,
    followupScheduler,
    leadAcquisition,
    leadQualification,
    outreach,
    response,
    scrapeMaintenance,
    scraping,
  ] = await Promise.all([
    import('./aiAnalysis.worker'),
    import('./applicationExecution.worker'),
    import('./followUp.worker'),
    import('./followupScheduler.worker'),
    import('./leadAcquisition.worker'),
    import('./leadQualification.worker'),
    import('./outreach.worker'),
    import('./response.worker'),
    import('./scrapeMaintenance.worker'),
    import('./scraping.worker'),
  ]);

  return [
    aiAnalysis.aiAnalysisWorker,
    applicationExecution.applicationExecutionWorker,
    followUp.followupWorker,
    followupScheduler.followupSchedulerWorker,
    leadAcquisition.leadAcquisitionWorker,
    leadQualification.leadQualificationWorker,
    outreach.outreachWorker,
    response.responseWorker,
    scrapeMaintenance.scrapeMaintenanceWorker,
    scraping.scrapingWorker,
  ];
};

type Workers = Awaited<ReturnType<typeof loadWorkers>>;

export let workers: Workers = [];

let isShuttingDown = false;

let memoryLogInterval: NodeJS.Timeout | undefined;
let redisHealthInterval: NodeJS.Timeout | undefined;


const startMonitoring = () => {
  memoryLogInterval = setInterval(() => {
    const memory = process.memoryUsage();

    logger.info(
      {
        event: 'worker.memory.usage',
        pid: process.pid,
        rssMb: Math.round(memory.rss / 1024 / 1024),
        heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
        heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        externalMb: Math.round(memory.external / 1024 / 1024),
        arrayBuffersMb: Math.round((memory.arrayBuffers ?? 0) / 1024 / 1024),
      },
      'Worker memory usage',
    );
  }, 30_000);

  // Do not keep the Node.js process alive only because of this timer.
  memoryLogInterval.unref();

  // Redis monitoring can be added here later if required.
  // Keep this disabled until the Redis connection object is
  // imported into this entry point. The Redis event listeners
  // already provide connection/reconnect/error logs.
};

const stopMonitoring = () => {
  if (memoryLogInterval) {
    clearInterval(memoryLogInterval);
    memoryLogInterval = undefined;
  }

  if (redisHealthInterval) {
    clearInterval(redisHealthInterval);
    redisHealthInterval = undefined;
  }
};

const shutdown = async (signal: string, exitCode: 0 | 1 = 0) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  stopMonitoring();

  logger.info({
    event: 'worker.shutdown.started',
    signal,
    pid: process.pid,
    message: 'AI_VBD worker shutdown started',
  });

  try {
    // Stop workers from accepting new jobs and wait for
    // active jobs to complete.
    await Promise.all(workers.map((worker) => worker.close()));

    logger.info({
      event: 'worker.shutdown.workers_closed',
      signal,
      message: 'All queue workers closed',
    });

    // Browser is shared infrastructure for scraping.
    // Close it only after workers have stopped.
    await browserManager.close();

    logger.info({
      event: 'worker.shutdown.browser_closed',
      signal,
      message: 'Playwright browser closed',
    });

    logger.info({
      event: 'worker.shutdown.completed',
      signal,
      message: 'AI_VBD worker shutdown completed',
    });

    process.exit(exitCode);
  } catch (error) {
    logger.error({
      event: 'worker.shutdown.failed',
      signal,
      message: 'AI_VBD worker shutdown failed',
      error: error instanceof Error ? error.message : String(error),
    });

    process.exit(1);
  }
};

const startWorkers = async () => {
  try {
    logger.info({
      event: 'worker.process.started',
      pid: process.pid,
      nodeEnv: process.env.NODE_ENV,
      startedAt: new Date().toISOString(),
      message: 'AI_VBD worker process started',
    });

    startMonitoring();

    registerProviders();
    await bootstrapApp();

    if (process.env.NODE_ENV !== 'production') {
      await resetAllQueuesForDevelopment();
    }

    workers = await loadWorkers();
    await bootstrapWorkers();

    logger.info({
      event: 'worker.process.ready',
      pid: process.pid,
      workerCount: workers.length,
      message: 'AI_VBD workers started',
    });
  } catch (error) {
    logger.error({
      event: 'worker.startup.failed',
      pid: process.pid,
      message: 'Failed to start AI_VBD workers',
      error,
    });

    await shutdown('STARTUP_FAILURE', 1);
  }
};

process.once('SIGTERM', () => {
  void shutdown('SIGTERM', 0);
});

process.once('SIGINT', () => {
  void shutdown('SIGINT', 0);
});

void startWorkers();
