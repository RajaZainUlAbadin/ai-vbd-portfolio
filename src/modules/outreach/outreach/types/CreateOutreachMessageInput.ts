export type CreateOutreachMessageInput = {
  outreachId: string;
  direction: 'outbound' | 'inbound';
  from?: string;
  to: string;
  subject?: string;
  message: string;

  parentMessageId?: string;
  providerMessageId?: string;

  externalMessageId?: String;
  inReplyTo?: String;
};
