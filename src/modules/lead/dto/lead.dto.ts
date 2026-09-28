import { LeadContact } from '../lead-contact/lead-contact.schema';

// export type LeadStatusDto =
//   | 'new'
//   | 'qualifying'
//   | 'qualified'
//   | 'rejected'
//   | 'scraping'
//   | 'analyzing'
//   | 'ready'
//   | 'contacted'
//   | 'replied'
//   | 'converted'
//   | 'failed';

export enum FrontendLeadStatus {
  NEW = 'NEW',

  SCRAPED = 'SCRAPED',

  QUALIFIED = 'QUALIFIED',
  NOT_QUALIFIED = 'NOT_QUALIFIED',
  REJECTED = 'REJECTED',

  ANALYZED = 'ANALYZED',

  OUTREACH_PENDING = 'OUTREACH_PENDING',
  OUTREACHED = 'OUTREACHED',

  CONTACT_MISSING = 'CONTACT_MISSING',

  CONTACTED = 'CONTACTED',
  ENGAGED = 'ENGAGED',
  RESPONDED = 'RESPONDED',
  CONVERTED = 'CONVERTED',
}

export interface LeadContactDto {
  name: string;
  role: string | null;
}

export interface LeadDto {
  id: string;
  business: string;
  industry: string;
  location: string;

  provider: string;

  score: number;

  status: FrontendLeadStatus;

  contacts: LeadContact[];

  outreachScheduledFor: Date | null;
  lastOutreachAt: Date | null;
  nextFollowupAt: Date | null;

  outreachStatus: string;

  website: string;

  phone: string;

  email: string;

  lastActivity: string;

  created: string;
}
