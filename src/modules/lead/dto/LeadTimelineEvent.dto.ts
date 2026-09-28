export interface LeadTimelineEvent {
  type:
    | 'LEAD_CREATED'
    | 'OUTREACH_CREATED'
    | 'MESSAGE_SENT'
    | 'MESSAGE_RECEIVED'
    | 'FOLLOWUP_SENT'
    | 'REPLIED';

  title: string;

  description?: string;

  timestamp: Date;

  metadata?: Record<string, unknown>;
}
