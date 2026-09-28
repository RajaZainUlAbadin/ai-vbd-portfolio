import { OutreachMessage } from '@/modules/ai/model/aiAnalysis.interface';
import { AIMetadata } from './AIMetaData';

export enum ResponseType {
  'FOLLOW_UP' = 'FOLLOW_UP',
  'REPLY' = 'REPLY',
  'REENGAGEMENT' = 'REENGAGEMENT',
}

export interface AIResponseInput {
  goal: ResponseType;

  sequence: {
    step: number;
    maxSteps: number;
  };

  analysis: {
    businessName: string;
    businessSummary: string;
    qualification: string;
    primaryPainPoint: string;
    painPoints: string[];
  } | null;

  messages: {
    direction: 'outbound' | 'inbound';
    subject?: string;
    message: string;
    createdAt: Date;
  }[];
}

export interface AIResponseResult {
  message: OutreachMessage;
  metadata: AIMetadata;
}
