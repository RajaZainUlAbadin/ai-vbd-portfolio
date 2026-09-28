import { LeadStatus } from "@/modules/lead/model/lead.status";

export interface ConversationLeadDto {
  id: string;
  businessName?: string;
  website?: string;
  address?: string;
  provider?: string;
  score?: number;
  status: LeadStatus;
}