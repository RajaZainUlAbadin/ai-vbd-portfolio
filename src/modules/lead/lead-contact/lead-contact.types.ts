export enum ContactType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  WHATSAPP = 'WHATSAPP',
}

export enum ContactSource {
  CSV_IMPORT = 'CSV_IMPORT',
  PROVIDER = 'PROVIDER',
  WEBSITE = 'website',
  SCRAPER = 'SCRAPER',
  AI = 'AI',
  ADMIN = 'ADMIN',
}

export enum ContactStatus {
  ACTIVE = 'ACTIVE',
  BOUNCED = 'BOUNCED',
  INVALID = 'INVALID',
  UNSUBSCRIBED = 'UNSUBSCRIBED',
}
