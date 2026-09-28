import { OutreachMessage } from '@/modules/ai/model/aiAnalysis.interface';
import { LeadContact } from '@/modules/lead/lead-contact/lead-contact.schema';
import { AIMetadata } from './AIMetaData';

export interface AIAnalysisInput {
  leadId?: string;

  businessName: string;
  website?: string;
  category?: string;

  address?: string;
  contacts?: LeadContact[];

  source?: string;

  websiteAnalysis?: {
    title?: string;
    technologies?: string[];
    seo?: {
      h1?: string[];
      metaTitle?: string;
      metaDescription?: string;
    };

    performance?: {
      loadTimeMs?: number;
    };
  };
}

export interface AIAnalysisResponse {
  analysis: AIAnalysis;
  metadata: AIMetadata;
}

export interface AIAnalysis {
  // Basic Info
  id: string;
  leadId: string;
  scrapeResultId?: string;
  provider: string;
  model: string;

  // Business Overview
  businessName: string;
  businessSummary: string;
  confidenceScore: number;

  estimatedBusinessSize: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';

  contacts: LeadContact[];
  // Score
  businessMaturityScore: number;
  digitalPresenceScore: number;
  uxScore: number;
  seoScore: number;
  opportunityScore: number;
  conversionProbability: number;

  mobileCheck: {
    dataAvailable: boolean;
    isMobileResponsive: boolean;
    loadingTimeIssues: string;
    breakingParts: string;
    notes: string;
  };

  keyFindings: string[];
  strengths: string[];
  painPoints: string[];
  primaryPainPoint: string;
  opportunities: string[];

  recommendedServices: string[];

  personalizedOutreach: OutreachMessage;

  qualification: {
    qualified: boolean;
    score: number;
    reason: string;
  };

  priority: 'low' | 'medium' | 'high';
}
