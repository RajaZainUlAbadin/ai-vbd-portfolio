import { createQueue } from './core/createQueue';
import { QUEUE_NAMES } from './constants/queueNames';

export const applicationExecutionQueue = createQueue(
  QUEUE_NAMES.APPLICATION_EXECUTION,
);

export const leadAcquisitionQueue = createQueue(QUEUE_NAMES.LEAD_ACQUISITION);

export const scrapingQueue = createQueue(QUEUE_NAMES.SCRAPING);

export const leadQualificationQueue = createQueue(
  QUEUE_NAMES.LEAD_QUALIFICATION,
);

export const aiAnalysisQueue = createQueue(QUEUE_NAMES.AI_ANALYSIS);

export const outreachQueue = createQueue(QUEUE_NAMES.OUTREACH);

export const followupSchedulerQueue = createQueue(
  QUEUE_NAMES.FOLLOWUP_SCHEDULER,
);
export const followUpQueue = createQueue(QUEUE_NAMES.FOLLOW_UP);

export const responseQueue = createQueue(QUEUE_NAMES.RESPONSE);

export const scrapeMaintenanceQueue = createQueue(
  QUEUE_NAMES.SCRAPEMAINTENANCE,
);

export const queues = [
  applicationExecutionQueue,
  leadAcquisitionQueue,
  scrapingQueue,
  leadQualificationQueue,
  aiAnalysisQueue,
  outreachQueue,
  followupSchedulerQueue,
  followUpQueue,
  responseQueue,
  scrapeMaintenanceQueue,
];
