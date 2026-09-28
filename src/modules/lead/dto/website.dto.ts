export type LeadSource = 'diagnostic' | 'consultation' | 'contact';

export interface Lead_website {
  source: LeadSource;

  name?: string;
  email: string;

  phone?: string;
  company?: string;

  message?: string;

  metadata?: Record<string, unknown>;
}
