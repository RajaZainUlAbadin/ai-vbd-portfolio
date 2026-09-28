import { LeadContact } from '@/modules/lead/lead-contact/lead-contact.schema';
import { LeadStatus } from '@/modules/lead/model/lead.status';
import { IOutreach } from '../../outreach/model/outreach.interface';
import { IOutreachMessage } from '../../outreach-message/model/outreachMessage.interface';
import mongoose from 'mongoose';

export interface ConversationLead {
  _id: mongoose.Types.ObjectId;

  businessName?: string;
  website?: string;
  address?: string;

  provider?: string;

  score?: number;
  status: LeadStatus;
}

export interface ConversationOutreach extends IOutreach {
  lead: ConversationLead;
}

export interface ConversationRepositoryResult {
  outreach: ConversationOutreach;
  messages: IOutreachMessage[];
}
