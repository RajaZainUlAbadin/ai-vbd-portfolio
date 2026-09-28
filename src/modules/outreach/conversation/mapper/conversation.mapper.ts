import { IOutreachMessage } from '../../outreach-message/model/outreachMessage.interface';
import { OutreachMessageStatus } from '../../outreach-message/model/outreachMessage.status';
import { ConversationListItemDto } from '../dto/conversationListItem.dto';
import { ConversationMessageDto } from '../dto/conversationMessage.dto';
import {
  extractMessageText,
  resolvePrimaryContact,
  resolveUnread,
  toId,
} from './conversation.mapper.helpers';
import { IConversation } from '../types/conversation.type';
import { ConversationDetailDto } from '../dto/conversationDetail.dto';
import { ConversationOutreach } from '../types/conversationOutreach.types';

export const mapConversationMessage = (
  message: any,
): ConversationMessageDto => {
  const direction = message.direction === 'inbound' ? 'INBOUND' : 'OUTBOUND';

  const senderType =
    direction === 'INBOUND'
      ? 'CONTACT'
      : message.from === 'SYSTEM'
        ? 'SYSTEM'
        : 'USER';

  return {
    id: message._id.toString(),

    direction,

    senderType,

    sender: message.from ?? '',

    recipient: message.to ?? '',

    subject: message.subject || undefined,

    text: extractMessageText(message.message),

    status: message.status as OutreachMessageStatus,

    createdAt: message.createdAt.toISOString(),

    deliveredAt: message.deliveredAt
      ? message.deliveredAt.toISOString()
      : undefined,

    openedAt: message.openedAt ? message.openedAt.toISOString() : undefined,

    clickedAt: undefined,
    // clickedAt: message.clickedAt.toISOString() ?? undefined,

    errorMessage: message.errorMessage ?? undefined,
  };
};

export const mapConversationListItem = (
  conv: IConversation,
): ConversationListItemDto => {
  const lastMessage = conv.lastMessage;

  const primaryContact = conv.lead
    ? resolvePrimaryContact(conv.lead, conv.leadContactId)
    : undefined;

  return {
    id: toId(conv._id),

    leadId: conv.leadId,

    leadContactId: conv.leadContactId,

    leadScore: conv.leadScore ?? 0,

    business:
      conv.lead?.businessName ??
      conv.lead?.website ??
      primaryContact?.designation ??
      primaryContact?.name ??
      'Unknowned',
    // business: conv.businessName,

    contact:
      primaryContact?.name ?? primaryContact?.value ?? conv.recipient ?? '',

    status: conv.status,

    lastMessage: extractMessageText(lastMessage?.message),

    lastMessageAt: lastMessage?.createdAt?.toISOString() ?? '',

    lastMessageStatus: conv.lastMessageStatus ?? '',

    unread: resolveUnread(conv),

    channel: lastMessage?.channel ?? 'email',

    provider: conv.provider ?? lastMessage?.provider ?? '',

    sequenceStep: conv.sequenceStep ?? 0,
  };
};

export const mapConversationDetail = (
  outreach: ConversationOutreach,
  messages: IOutreachMessage[],
): ConversationDetailDto => {
  const lead = outreach.lead;
  return {
    id: outreach.id,
    leadId: outreach.leadId,
    leadContactId: outreach.leadContactId,
    lead: lead
      ? {
          id: lead._id.toString(),
          businessName: lead.businessName ?? '',
          website: lead.website ?? '',
          address: lead.address ?? '',
          provider: lead.provider ?? '',
          score: lead.score ?? 0,
          status: lead.status,
        }
      : undefined,
    status: outreach.status,
    contact: outreach.recipient ?? '',
    sequenceStep: outreach.sequenceStep,
    messages: messages.map(mapConversationMessage),
  };
};
