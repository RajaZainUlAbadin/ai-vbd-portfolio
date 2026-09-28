import { ScrapeStatus } from '@/modules/scraping/model/scrape.status';

export interface ScrapeRawResult {
  status: ScrapeStatus;
  attempts: number;
  failureReason: string;
  httpStatus: number;
  redirects:
    | [
        {
          from: string;
          to: string;
          status: number;
        },
      ]
    | [];

  finalUrl: string;
  title?: string;
  html?: string;

  hero?: {
    heading?: string;
    description?: string;
  };
  visibleText?: string;
  pages?: {
    home?: string;
    about?: string;
    services?: string;
    contact?: string;
  };
  headings?: {
    h1: string[];
    h2: string[];
    h3: string[];
  };

  forms?: number;
  technologies?: string[];
  screenshot?: string;

  links?: string[];
  navigation?: string[];

  scripts?: string[];

  metadata?: Record<string, unknown>;
}

export interface ScraperProvider {
  name: string;
  scrape(url: string): Promise<ScrapeRawResult>;
}
