import { ScrapeResultModel } from '../../scraping/model/scrapeResult.model';

export class WebsiteQualificationRules {
  static async evaluate(scrapeResult: any) {
    let score = 0;

    const reasons: string[] = [];

    // Missing SEO description
    if (!scrapeResult.seo?.metaDescription) {
      score += 15;
      reasons.push('Missing meta description');
    }

    // Slow website
    if (scrapeResult.performance?.loadTimeMs > 4000) {
      score += 20;
      reasons.push('Slow performance website');
    }

    // WordPress detected
    if (scrapeResult.technologies?.includes('WordPress')) {
      score += 10;
      reasons.push('Uses WordPress');
    }

    // Missing H1
    if (!scrapeResult.seo?.h1?.length) {
      score += 15;
      reasons.push('Missing H1 headings');
    }

    // No title
    if (!scrapeResult.title) {
      score += 25;
      reasons.push('Missing page title');
    }

    return {
      score,
      reasons,
    };
  }
}
