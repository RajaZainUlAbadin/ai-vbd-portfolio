import { LeadContact } from '../../lead/lead-contact/lead-contact.schema';

export interface OutreachMessage {
  subject: string;
  greeting: string;
  opening: string;
  message: string;
  closing: string;
}

export interface MobileCheck {
  dataAvailable: boolean;
  isMobileResponsive: boolean;
  loadingTimeIssues: string;
  breakingParts: string;
  notes: string;
}

export interface Qualification {
  qualified: boolean;
  score: number;
  reason: string;
}

export interface IAIAnalysis {
  id: string;

  leadId: string;

  scrapeResultId?: string;

  provider?: string;

  model?: string;

  businessName: string;

  businessSummary: string;

  confidenceScore: number;

  estimatedBusinessSize?: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';

  contacts: LeadContact[];

  businessMaturityScore: number;

  digitalPresenceScore: number;

  uxScore: number;

  seoScore: number;

  opportunityScore: number;

  conversionProbability: number;

  mobileCheck?: MobileCheck;

  keyFindings: string[];

  strengths: string[];

  painPoints: string[];

  primaryPainPoint: string;

  opportunities: string[];

  recommendedServices: string[];

  personalizedOutreach?: OutreachMessage;

  qualification?: Qualification;

  priority: 'low' | 'medium' | 'high';

  createdAt: Date;

  updatedAt: Date;
}
