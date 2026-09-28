import { LeadStatus } from '@/modules/lead/model/lead.status';
import { OutreachStatus } from '../../outreach/model/outreach.status';
import { ConversationMessageDto } from './conversationMessage.dto';
import { ConversationLead } from '../types/conversationOutreach.types';
import { ConversationLeadDto } from './conversationLead.dto';

export interface ConversationDetailDto {
  id: string;

  leadId: string;
  leadContactId: string;

  lead?: ConversationLeadDto;

  contact: string;
  sequenceStep: number;
  status: OutreachStatus;

  messages: ConversationMessageDto[];
}
