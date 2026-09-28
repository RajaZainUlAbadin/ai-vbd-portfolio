export type QualificationType = 'PROVIDER' | 'SCRAPED';

export interface IQualification {
  id: string;

  leadId: string;

  scrapeResultId?: string | null;

  qualified: boolean;

  businessScore: number;

  opportunityScore: number;

  score: number;

  reasons: string[];

  qualificationType: QualificationType;

  createdAt: Date;

  updatedAt: Date;
}

export interface CreateQualificationInput {
  leadId: string;

  scrapeResultId?: string | null;

  qualified: boolean;

  businessScore?: number;

  opportunityScore?: number;

  score: number;

  reasons?: string[];

  qualificationType: QualificationType;
}
