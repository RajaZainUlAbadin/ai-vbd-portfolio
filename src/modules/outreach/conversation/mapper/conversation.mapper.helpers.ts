import { LeadContact } from '@/modules/lead/lead-contact/lead-contact.schema';
import { OutreachMessageStatus } from '../../outreach-message/model/outreachMessage.status';
import { IConversation } from '../types/conversation.type';

export const toId = (value: unknown): string => {
  if (!value) return '';

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && value !== null && 'toString' in value) {
    return String(value);
  }

  return String(value);
};

export const extractMessageText = (message?: string | null): string => {
  if (!message) return '';

  // If the message is already plain text, return it as-is.
  if (!/<[a-z][\s\S]*>/i.test(message)) {
    return normalizeWhitespace(message);
  }

  return normalizeWhitespace(
    message
      // Remove scripts and styles completely.
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')

      // Preserve meaningful line breaks before stripping tags.
      .replace(/<\/(p|div|li|tr|h[1-6]|br)>/gi, '\n')

      // Convert common HTML entities.
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")

      // Remove remaining HTML tags.
      .replace(/<[^>]+>/g, ' '),
  );
};

export const normalizeWhitespace = (value: string): string => {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const resolveUnread = (conv: IConversation): boolean => {
  const lastMessageStatus = conv.lastMessage?.status as OutreachMessageStatus;
  if (
    lastMessageStatus === OutreachMessageStatus.OPENED ||
    lastMessageStatus === OutreachMessageStatus.CLICKED ||
    lastMessageStatus === OutreachMessageStatus.RESPONDED
  ) {
    return false;
  }

  return true;
};

export const resolvePrimaryContact = (
  lead: any,
  leadContactId?: unknown,
): LeadContact | undefined => {
  if (!lead?.contacts?.length) {
    return undefined;
  }

  const contactId = toId(leadContactId);

  if (contactId) {
    const matched = lead.contacts.find(
      (contact: any) => toId(contact._id) === contactId,
    );

    if (matched) {
      return matched;
    }
  }

  // Fallback
  return (
    lead.contacts.find((contact: any) => contact.isPrimary) ?? lead.contacts[0]
  );
};
