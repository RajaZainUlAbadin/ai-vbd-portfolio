import { Browser, chromium } from 'playwright';

import { logger } from '@/shared/logger/logger';

class BrowserManager {
  private browser: Browser | null = null;
  private initPromise: Promise<Browser> | null = null;

  async init(): Promise<Browser> {
    if (this.browser?.isConnected()) {
      return this.browser;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = chromium
      .launch({
        headless: true,
      })
      .then((browser) => {
        this.browser = browser;

        browser.on('disconnected', () => {
          logger.warn('Playwright browser disconnected');

          if (this.browser === browser) {
            this.browser = null;
          }
        });

        logger.info('Playwright browser initialized');

        return browser;
      })
      .finally(() => {
        this.initPromise = null;
      });

    return this.initPromise;
  }

  async getBrowser(): Promise<Browser> {
    if (this.browser?.isConnected()) {
      return this.browser;
    }

    return this.init();
  }

  async close(): Promise<void> {
    const browser = this.browser;

    this.browser = null;

    if (browser) {
      await browser.close().catch(() => {});
      logger.info('Browser closed');
    }
  }

  async reset(): Promise<void> {
    const browser = this.browser;

    this.browser = null;

    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

export const browserManager = new BrowserManager();
