export interface SiteStructure {
  hasAbout: boolean;
  hasServices: boolean;
  hasPortfolio: boolean;
  hasPricing: boolean;
  hasContact: boolean;
  hasBlog: boolean;
  hasCareers: boolean;
}

export function detectSiteStructure(navigation: string[] = []): SiteStructure {
  const nav = navigation.join(' ').toLowerCase();

  return {
    hasAbout: nav.includes('about'),

    hasServices: nav.includes('service'),

    hasPortfolio:
      nav.includes('portfolio') ||
      nav.includes('projects') ||
      nav.includes('case studies'),

    hasPricing: nav.includes('pricing') || nav.includes('plans'),

    hasContact: nav.includes('contact'),

    hasBlog: nav.includes('blog') || nav.includes('news'),

    hasCareers: nav.includes('career') || nav.includes('jobs'),
  };
}
