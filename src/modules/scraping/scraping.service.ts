import { logger } from '@/shared/logger/logger';
import {
  ContactSource,
  ContactStatus,
  ContactType,
} from '../lead/lead-contact/lead-contact.types';
import { LeadContact } from '../lead/lead-contact/lead-contact.schema';
import { LeadsRepository } from '../lead/leads.repository';

import { ScrapeStatus, ScrapingStage } from './model/scrape.status';
import { ScrapeRepository } from './scrape.repository';
import { ScraperRegistry } from '@/providers/scrapers/ScraperRegistry';
import { ScrapeRawResult } from '@/providers/scrapers/base/ScraperProvider';

import { extractSeoData } from './utils/extractSeoData';
import { detectTechnologies } from './utils/detectTechnologies';
import { extractContacts } from './utils/extractContacts';
import { extractSocialLinks } from './utils/extractSocialLinks';
import { detectSiteStructure } from './utils/detectSiteStructure';
import { detectCTAs } from './utils/detectCTAs';
import { detectServices } from './utils/detectServices';
import { detectBusinessSignals } from './utils/detectBusinessSignals';
import { ScrapeProfilingError } from './model/scrapeResult.model';
import { Types } from 'mongoose';

export class ScrapingService {
  static async scrapeWebsite(leadId: string, url: string) {
    const scraper = ScraperRegistry.get('playwright');
    const result: ScrapeRawResult = await scraper.scrape(url);

    const html = result.html || '';
    // const compressedHtml = compressHtml(html);

    const visibleText = result.visibleText?.slice(0, 30000) || '';
    const loadTimeMs =
      typeof result.metadata?.loadTimeMs === 'number'
        ? result.metadata.loadTimeMs
        : undefined;

    const scrapeResult = await ScrapeRepository.create({
      leadId: new Types.ObjectId(leadId),
      url,
      finalUrl: result.finalUrl,
      title: result.title,
      html,
      visibleText,
      hero: result.hero,
      headings: result.headings,
      forms: result.forms || 0,

      links: result.links || [],
      navigation: result.navigation || [],

      screenshotPath: result.screenshot,

      scripts: result.scripts ?? [],
      pages: result.pages,

      metadata: result.metadata,

      performance: {
        loadTimeMs,
        speedRating: this.getSpeedRating(loadTimeMs),
      },

      stage: ScrapingStage.SCRAPED,
      status: result.status,
    });

    if (result.status === ScrapeStatus.SUCCESS) {
      // Profiler exec
      const profile = await this.profileScraping(scrapeResult.id);

      return {
        scrapeResultId: scrapeResult.id,
        skippedProfiling: false,
        ...profile,
      };
    }

    return {
      scrapeResultId: scrapeResult.id,
      skippedProfiling: true,
    };
  }

  static async profileScraping(scrapeResultId: string) {
    const scrape = await ScrapeRepository.findById(scrapeResultId);
    if (!scrape) throw new Error('Invalid ScrapeResult Id');

    // Status update
    await ScrapeRepository.update(scrape.id, {
      stage: ScrapingStage.PROFILING,
    });

    // Profiling work
    const errors: ScrapeProfilingError[] = [];

    const html = scrape.html || '';
    const visibleText = scrape.visibleText || '';

    const run = <T>(name: string, fn: () => T): T | undefined =>
      this.runProfiler(name, fn, errors);

    const seo = run('extractSeoData', () => extractSeoData(html));

    const technologies = run('detectTechnologies', () =>
      detectTechnologies(html, scrape.scripts || []),
    );

    const contactInfo = run('extractContacts', () =>
      extractContacts({
        html,
        home: scrape.pages?.home ?? '',
        about: scrape.pages?.about ?? '',
        contact: scrape.pages?.contact ?? '',
        services: scrape.pages?.services ?? '',
        links: scrape.links || [],
      }),
    );

    const socialLinks = run('extractSocialLinks', () =>
      extractSocialLinks(scrape.links || []),
    );

    const siteStructure = run('detectSiteStructure', () =>
      detectSiteStructure(scrape.navigation || []),
    );

    const ctas = run('detectCTAs', () => detectCTAs(visibleText));

    const services = run('detectServices', () =>
      detectServices(scrape.pages?.services || ''),
    );

    const businessSignals = run('detectBusinessSignals', () =>
      detectBusinessSignals(html, scrape.links || [], visibleText),
    );

    const profiled = await ScrapeRepository.update(scrape.id, {
      seo,
      technologies: technologies || [],

      contactInfo: contactInfo || ({ emails: [], phones: [] } as any),
      socialLinks: socialLinks || {},
      siteStructure: siteStructure,
      ctas: ctas || [],
      services: services || [],
      businessSignals,

      profilingErrors: errors as any,
      stage:
        errors.length > 0
          ? ScrapingStage.PROFILE_FAILED
          : ScrapingStage.PROFILED,
    });

    // -------- CONTACT MERGE --------
    const leadId = scrape.leadId;

    const leadContacts: LeadContact[] = [];

    if (contactInfo?.emails?.length) {
      for (const email of contactInfo.emails) {
        leadContacts.push({
          type: ContactType.EMAIL,
          name: '',
          value: email,

          confidence: 90,
          source: ContactSource.SCRAPER,

          status: ContactStatus.ACTIVE,
          verified: false,
          isPrimary: false,
        });
      }
    }

    if (contactInfo?.phones?.length) {
      for (const phone of contactInfo.phones) {
        leadContacts.push({
          type: ContactType.PHONE,
          value: phone.number,
          name: '',

          confidence: phone.confidence,
          source: ContactSource.SCRAPER,

          status: ContactStatus.ACTIVE,
          verified: false,
          isPrimary: false,
        });
      }
    }

    if (leadContacts.length > 0) {
      // await LeadRepository.mergeContacts(String(scrape.leadId), leadContacts);
    }

    return profiled;
  }

  private static runProfiler<T>(
    method: string,
    fn: () => T,
    errors: any[],
  ): T | undefined {
    try {
      return fn();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({
        method,
        message,
        createdAt: new Date(),
      });

      logger.error({
        module: 'website-profiler',
        method,
        message,
        stack: error instanceof Error ? error.stack : undefined,
      });

      return undefined;
    }
  }

  private static getSpeedRating(
    loadTimeMs?: number,
  ): 'FAST' | 'NORMAL' | 'SLOW' {
    if (!loadTimeMs) {
      return 'NORMAL';
    }

    if (loadTimeMs < 2000) {
      return 'FAST';
    }

    if (loadTimeMs < 5000) {
      return 'NORMAL';
    }

    return 'SLOW';
  }
}
