export class LeadWebsiteValidator {
  static isInvalidWebsite(url?: string) {
    if (!url) return false;

    const blockedDomains = [
      'facebook.com',
      'instagram.com',
      'linkedin.com',
      'tripadvisor.com',
      'booking.com',
      'zomato.com',
      'talabat.com',
      'careem.com',
    ];

    return blockedDomains.some((domain) => url.includes(domain));
  }
}
