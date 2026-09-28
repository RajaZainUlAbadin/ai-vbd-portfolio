import { StringValidation } from 'zod/v3';
import { OutreachMessageStatus } from './outreachMessage.status';

export type OutreachMessageDirection = 'inbound' | 'outbound';

export type OutreachMessageChannel = 'email' | 'whatsapp';

export interface IOutreachMessage {
  id: string;

  outreachId: string;

  parentMessageId?: string;

  direction: OutreachMessageDirection;

  channel: OutreachMessageChannel;

  provider?: string;
  providerMessageId?: string;

  externalMessageId?: string;
  inReplyTo?: string;

  from: string;
  to: string;

  subject?: string;
  message: string;

  status: OutreachMessageStatus;

  sentAt?: Date;
  deliveredAt?: Date;

  openedAt?: Date;
  repliedAt?: Date;

  errorMessage?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOutreachMessageInput {
  outreachId: string;

  parentMessageId?: string;

  direction: OutreachMessageDirection;

  channel?: OutreachMessageChannel;

  provider?: string;
  providerMessageId?: string;

  externalMessageId?: string;
  inReplyTo?: string;

  from: string;
  to: string;
  subject?: string;
  message: string;
  status?: OutreachMessageStatus;

  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;

  repliedAt?: Date;

  errorMessage?: string;
}

export interface CreateOutboundMessageInput extends Omit<
  CreateOutreachMessageInput,
  'direction'
> {}

export interface CreateInboundMessageInput {
  outreachId: string;
  replyToMessageId: string;
  providerMessageId: string;
  externalMessageId?: string;
  inReplyTo?: string;
  from: string;
  to: string;
  subject?: string;
  message: string;
  provider?: string;
  channel?: OutreachMessageChannel;
}
