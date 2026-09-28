import { ScrapeRepository } from '@/modules/scraping/scrape.repository';
import { QUEUE_NAMES } from '../constants/queueNames';
import { createWorker } from '../core/createWorker';
import { Job } from 'bullmq';

export const scrapeMaintenanceWorker = createWorker(
  QUEUE_NAMES.SCRAPEMAINTENANCE,

  async (_job: Job) => {
    await ScrapeRepository.clean_HtmlFields();
  },
);
