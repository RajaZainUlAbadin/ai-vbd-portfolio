import { ScraperProvider } from './base/ScraperProvider';

export class ScraperRegistry {
  private static providers = new Map<string, ScraperProvider>();

  static register(provider: ScraperProvider) {
    this.providers.set(provider.name, provider);
  }

  static get(name: string) {
    const provider = this.providers.get(name);

    if (!provider) {
      throw new Error(`Scraper provider not found: ${name}`);
    }

    return provider;
  }
}
