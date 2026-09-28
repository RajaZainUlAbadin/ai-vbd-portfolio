import { BrowserContext, Page } from 'playwright';
import { browserManager } from '@/infrastructure/browser/browserManager';
import { ScraperProvider, ScrapeRawResult } from '../base/ScraperProvider';
import { detectScrapeStatus } from '@/modules/scraping/utils/detectScrapeStatus';
import { ScrapeStatus } from '@/modules/scraping/model/scrape.status';

export class PlaywrightScraperProvider implements ScraperProvider {
  name = 'playwright';

  private findImportantPages(links: string[]) {
    const normalize = (url: string) => url.toLowerCase();
    return {
      about:
        links.find(
          (x) =>
            normalize(x).includes('/about') ||
            normalize(x).includes('/about-us'),
        ) || null,

      services:
        links.find(
          (x) =>
            normalize(x).includes('/services') ||
            normalize(x).includes('/solutions'),
        ) || null,

      contact:
        links.find(
          (x) =>
            normalize(x).includes('/contact') ||
            normalize(x).includes('/contact-us'),
        ) || null,
    };
  }

  private async scrapePageText(
    context: BrowserContext,
    url?: string | null,
  ): Promise<string> {
    if (!url) return '';

    const page = await context.newPage();

    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      return await page.evaluate(() => {
        return document.body?.innerText || '';
      });
    } catch {
      return '';
    } finally {
      await page.close();
    }
  }

  async scrape(url: string): Promise<ScrapeRawResult> {
    const shouldRetry = (status: ScrapeStatus) => {
      return [
        ScrapeStatus.TIMEOUT,
        ScrapeStatus.DNS_ERROR,
        ScrapeStatus.CLOUDFLARE,
        ScrapeStatus.FAILED,
        ScrapeStatus.PARTIAL,
      ].includes(status);
    };

    const createFailedResult = (
      error: unknown,
      attempt: number,
    ): ScrapeRawResult => {
      const err = error instanceof Error ? error : new Error(String(error));

      return {
        status: ScrapeStatus.FAILED,
        attempts: attempt,
        failureReason: err.message,
        httpStatus: 0,
        redirects: [],

        finalUrl: url,
        title: '',
        html: '',

        visibleText: '',
        pages: {
          home: '',
          about: '',
          services: '',
          contact: '',
        },

        hero: {},
        headings: {
          h1: [],
          h2: [],
          h3: [],
        },

        navigation: [],
        links: [],
        forms: 0,
        scripts: [],

        metadata: {
          scrapedAt: new Date(),
          loadTimeMs: 0,
        },
      };
    };

    const isBrowserClosedError = (error: unknown) => {
      if (!(error instanceof Error)) {
        return false;
      }

      return (
        error.message.includes('browser has been closed') ||
        error.message.includes(
          'Target page, context or browser has been closed',
        ) ||
        error.message.includes('Browser has been closed')
      );
    };

    let lastResult: ScrapeRawResult | undefined;

    for (let attempt = 1; attempt <= 2; attempt++) {
      let context: BrowserContext | undefined;
      let page: Page | undefined;

      try {
        const browser = await browserManager.getBrowser();

        context = await browser.newContext({
          ignoreHTTPSErrors: true,
          javaScriptEnabled: true,

          viewport: {
            width: 1366,
            height: 768,
          },

          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
            'AppleWebKit/537.36 Chrome/138 Safari/537.36',
        });

        page = await context.newPage();

        const start = Date.now();

        // Route before navigation
        await page.route('**/*', (route) => {
          const resourceType = route.request().resourceType();

          if (['image', 'media', 'font'].includes(resourceType)) {
            return route.abort();
          }

          const requestUrl = route.request().url();

          if (
            requestUrl.includes('google-analytics') ||
            requestUrl.includes('doubleclick')
          ) {
            return route.abort();
          }

          return route.continue();
        });

        let response;
        let loadError: Error | undefined;

        try {
          response = await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 45000,
          });
        } catch (error) {
          loadError = error instanceof Error ? error : new Error(String(error));
        }

        await page.waitForTimeout(1500);

        const loadTimeMs = Date.now() - start;

        const title = await page.title();

        const html = await page.content();

        const visibleText = await page.evaluate(
          () => document.body?.innerText || '',
        );

        const headings = await page.evaluate(() => ({
          h1: [...document.querySelectorAll('h1')]
            .map((element) => element.textContent?.trim())
            .filter(Boolean),

          h2: [...document.querySelectorAll('h2')]
            .map((element) => element.textContent?.trim())
            .filter(Boolean),

          h3: [...document.querySelectorAll('h3')]
            .map((element) => element.textContent?.trim())
            .filter(Boolean),
        }));

        const navigation = await page.evaluate(() =>
          [...document.querySelectorAll('nav a')]
            .map((element) => element.textContent?.trim())
            .filter(Boolean),
        );

        const links = await page.evaluate(() =>
          [...document.querySelectorAll('a')]
            .map((anchor) => anchor.href)
            .filter(Boolean),
        );

        const importantPages = this.findImportantPages(links);

        const forms = await page.$$eval(
          'form',
          (formElements) => formElements.length,
        );

        const hero = await page.evaluate(() => {
          const h1 = document.querySelector('h1');
          const paragraph = document.querySelector('p');

          return {
            heading: h1?.textContent?.trim(),
            description: paragraph?.textContent?.trim(),
          };
        });

        const pages = {
          home: visibleText,

          about: await this.scrapePageText(context, importantPages.about),

          services: await this.scrapePageText(context, importantPages.services),

          contact: await this.scrapePageText(context, importantPages.contact),
        };

        const scripts = await page.evaluate(() =>
          [...document.querySelectorAll('script')]
            .map((script) => script.src)
            .filter(Boolean),
        );

        const scrapeStatus = detectScrapeStatus({
          responseStatus: response?.status(),

          finalUrl: page.url(),

          title,
          html,
          visibleText,

          forms,

          h1Count: headings.h1.length,

          loadError,
        });

        const result: ScrapeRawResult = {
          status: scrapeStatus,
          attempts: attempt,

          failureReason: '',

          httpStatus: response?.status() ?? 0,

          redirects: [],

          finalUrl: page.url(),

          title,
          html,

          visibleText,

          pages,

          hero,

          headings,

          navigation,

          links,

          forms,

          scripts,

          metadata: {
            scrapedAt: new Date(),
            loadTimeMs,
          },
        };

        lastResult = result;

        // Success or a status that should not be retried.
        if (!shouldRetry(scrapeStatus)) {
          return result;
        }
      } catch (error: unknown) {
        if (isBrowserClosedError(error)) {
          await browserManager.reset();
        }

        lastResult = createFailedResult(error, attempt);
        // Terminate the loop if the error is not retryable
      } finally {
        await page?.close().catch(() => {});
        await context?.close().catch(() => {});
      }

      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    return (
      lastResult ??
      createFailedResult(new Error('Scraping failed without a result'), 2)
    );
  }
  // async scrape(url: string): Promise<ScrapeRawResult> {
  //   const shouldRetry = (status: ScrapeStatus) => {
  //     return [
  //       ScrapeStatus.TIMEOUT,
  //       ScrapeStatus.DNS_ERROR,
  //       ScrapeStatus.CLOUDFLARE,
  //       ScrapeStatus.FAILED,
  //       ScrapeStatus.PARTIAL,
  //     ].includes(status);
  //   };

  //   let lastResult: ScrapeRawResult;

  //   for (let attempt = 1; attempt <= 2; attempt++) {
  //     let context: BrowserContext | undefined;
  //     let page: Page | undefined;

  //     try {
  //       const browser = await browserManager.getBrowser();

  //       context = await browser.newContext({
  //         ignoreHTTPSErrors: true,
  //         javaScriptEnabled: true,
  //         viewport: {
  //           width: 1366,
  //           height: 768,
  //         },
  //         userAgent:
  //           'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138 Safari/537.36',
  //       });

  //       page = await context.newPage();

  //       const start = Date.now();

  //       // ✅ IMPORTANT: route BEFORE navigation
  //       await page.route('**/*', (route) => {
  //         const type = route.request().resourceType();

  //         if (['image', 'media', 'font'].includes(type)) {
  //           return route.abort();
  //         }

  //         const reqUrl = route.request().url();
  //         if (
  //           reqUrl.includes('google-analytics') ||
  //           reqUrl.includes('doubleclick')
  //         ) {
  //           return route.abort();
  //         }

  //         route.continue();
  //       });

  //       let response;
  //       let loadError: Error | undefined;

  //       try {
  //         response = await page.goto(url, {
  //           waitUntil: 'domcontentloaded',
  //           timeout: 45000,
  //         });
  //       } catch (err) {
  //         loadError = err as Error;
  //       }

  //       await page.waitForTimeout(1500);

  //       const loadTimeMs = Date.now() - start;

  //       const title = await page.title();
  //       const html = await page.content();

  //       const visibleText = await page.evaluate(
  //         () => document.body?.innerText || '',
  //       );

  //       const headings = await page.evaluate(() => ({
  //         h1: [...document.querySelectorAll('h1')]
  //           .map((el) => el.textContent?.trim())
  //           .filter(Boolean),

  //         h2: [...document.querySelectorAll('h2')]
  //           .map((el) => el.textContent?.trim())
  //           .filter(Boolean),

  //         h3: [...document.querySelectorAll('h3')]
  //           .map((el) => el.textContent?.trim())
  //           .filter(Boolean),
  //       }));

  //       const navigation = await page.evaluate(() =>
  //         [...document.querySelectorAll('nav a')]
  //           .map((el) => el.textContent?.trim())
  //           .filter(Boolean),
  //       );

  //       const links = await page.evaluate(() =>
  //         [...document.querySelectorAll('a')]
  //           .map((a) => a.href)
  //           .filter(Boolean),
  //       );

  //       const importantPages = this.findImportantPages(links);

  //       const forms = await page.$$eval('form', (forms) => forms.length);

  //       const hero = await page.evaluate(() => {
  //         const h1 = document.querySelector('h1');
  //         const p = document.querySelector('p');

  //         return {
  //           heading: h1?.textContent?.trim(),
  //           description: p?.textContent?.trim(),
  //         };
  //       });

  //       const pages = {
  //         home: visibleText,

  //         about: await this.scrapePageText(context, importantPages.about),
  //         services: await this.scrapePageText(context, importantPages.services),
  //         contact: await this.scrapePageText(context, importantPages.contact),
  //       };

  //       const scripts = await page.evaluate(() =>
  //         [...document.querySelectorAll('script')]
  //           .map((x) => x.src)
  //           .filter(Boolean),
  //       );

  //       // const scrapeStatus = ScrapeStatus.SUCCESS;
  //       const scrapeStatus = detectScrapeStatus({
  //         responseStatus: response?.status(),
  //         finalUrl: page.url(),

  //         title,
  //         html,
  //         visibleText,

  //         forms,
  //         h1Count: headings.h1.length,

  //         loadError,
  //       });

  //       const result: ScrapeRawResult = {
  //         status: scrapeStatus,
  //         attempts: attempt,
  //         failureReason: '',
  //         httpStatus: 0,
  //         redirects: [],

  //         finalUrl: page.url(),
  //         title,
  //         html,

  //         visibleText,
  //         pages,

  //         hero,
  //         headings,

  //         navigation,
  //         links,

  //         forms,
  //         scripts,

  //         metadata: {
  //           scrapedAt: new Date(),
  //           loadTimeMs,
  //         },
  //       };

  //       lastResult = result;

  //       // ✅ success or non-retry status → return immediately
  //       if (!shouldRetry(scrapeStatus)) {
  //         return result;
  //       }
  //     } catch (err: any) {
  //       lastResult = {
  //         status: ScrapeStatus.FAILED,
  //         attempts: attempt,
  //         failureReason: err?.message || 'Unknown error',
  //         httpStatus: 0,
  //         redirects: [],

  //         finalUrl: url,
  //         title: '',
  //         html: '',

  //         visibleText: '',
  //         pages: {
  //           home: '',
  //           about: '',
  //           services: '',
  //           contact: '',
  //         },

  //         hero: {},
  //         headings: { h1: [], h2: [], h3: [] },

  //         navigation: [],
  //         links: [],
  //         forms: 0,
  //         scripts: [],

  //         metadata: {
  //           scrapedAt: new Date(),
  //           loadTimeMs: 0,
  //         },
  //       };
  //     } finally {
  //       await page?.close().catch(() => {});
  //       await context?.close().catch(() => {});
  //     }

  //     // ✅ retry delay (only if another attempt exists)
  //     if (attempt < 2) {
  //       await new Promise((r) => setTimeout(r, 2000));
  //     }
  //   }

  //   return lastResult!;
  // }
}
