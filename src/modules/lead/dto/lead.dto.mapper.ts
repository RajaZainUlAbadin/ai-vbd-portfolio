import { ILead } from '../model/lead.interface';
import { LeadStatus } from '../model/lead.status';
import { LeadDto, FrontendLeadStatus } from './lead.dto';

export function toLeadDto(lead: ILead): LeadDto {
  return {
    id: lead.id,

    business: lead.businessName,

    industry: lead.primaryType ?? lead.categories?.[0] ?? 'Unknown',

    location: lead.address ?? '',

    provider: lead.provider,

    score: lead.score,

    status: toFrontendLeadStatus(lead.status),

    contacts: lead.contacts,

    outreachStatus: '',
    outreachScheduledFor: lead.outreachScheduledFor,
    lastOutreachAt: lead.lastOutreachAt,
    nextFollowupAt: lead.nextFollowupAt,

    website: lead.website ?? '',

    phone: '',

    email: '',

    lastActivity: lead.updatedAt?.toISOString() ?? lead.createdAt.toISOString(),

    created: lead.createdAt.toISOString(),
  };
}

// Lead status mapper
// export const LEAD_STATUS_DTO_MAP: Record<LeadStatus, LeadStatusDto> = {
//   [LeadStatus.NEW]: 'new',

//   [LeadStatus.PROCESSING]: 'qualifying',

//   [LeadStatus.SCRAPING_PENDING]: 'scraping',

//   [LeadStatus.SCRAPED]: 'qualifying',

//   [LeadStatus.SCRAPING_SKIPPED]: 'qualifying',

//   [LeadStatus.QUALIFICATION_PENDING]: 'qualifying',

//   [LeadStatus.QUALIFIED]: 'qualified',

//   [LeadStatus.NOT_QUALIFIED]: 'rejected',

//   [LeadStatus.REJECTED]: 'rejected',

//   [LeadStatus.ANALYSIS_PENDING]: 'analyzing',

//   [LeadStatus.ANALYZED]: 'ready',

//   [LeadStatus.OUTREACH_PENDING]: 'ready',

//   [LeadStatus.OUTREACHED]: 'contacted',

//   [LeadStatus.CONTACT_MISSING]: 'failed',

//   [LeadStatus.CONTACTED]: 'contacted',

//   [LeadStatus.ENGAGED]: 'contacted',

//   [LeadStatus.RESPONDED]: 'replied',

//   [LeadStatus.CONVERTED]: 'converted',
// };

// export function toLeadStatusDto(status: LeadStatus): LeadStatusDto {
//   return LEAD_STATUS_DTO_MAP[status];
// }

const BACKEND_TO_FRONTEND: Partial<Record<LeadStatus, FrontendLeadStatus>> = {
  [LeadStatus.NEW]: FrontendLeadStatus.NEW,

  [LeadStatus.PROCESSING]: FrontendLeadStatus.NEW,

  [LeadStatus.SCRAPING_PENDING]: FrontendLeadStatus.NEW,

  [LeadStatus.SCRAPED]: FrontendLeadStatus.SCRAPED,

  [LeadStatus.SCRAPING_SKIPPED]: FrontendLeadStatus.SCRAPED,

  [LeadStatus.QUALIFICATION_PENDING]: FrontendLeadStatus.SCRAPED,

  [LeadStatus.NOT_QUALIFIED]: FrontendLeadStatus.NOT_QUALIFIED,

  [LeadStatus.QUALIFIED]: FrontendLeadStatus.QUALIFIED,

  [LeadStatus.REJECTED]: FrontendLeadStatus.REJECTED,

  [LeadStatus.ANALYSIS_PENDING]: FrontendLeadStatus.QUALIFIED,

  [LeadStatus.ANALYZED]: FrontendLeadStatus.ANALYZED,

  [LeadStatus.OUTREACH_PENDING]: FrontendLeadStatus.OUTREACH_PENDING,

  [LeadStatus.OUTREACHED]: FrontendLeadStatus.OUTREACHED,

  [LeadStatus.CONTACT_MISSING]: FrontendLeadStatus.CONTACT_MISSING,

  [LeadStatus.CONTACTED]: FrontendLeadStatus.CONTACTED,

  [LeadStatus.ENGAGED]: FrontendLeadStatus.ENGAGED,

  [LeadStatus.RESPONDED]: FrontendLeadStatus.RESPONDED,

  [LeadStatus.CONVERTED]: FrontendLeadStatus.CONVERTED,
};

const FRONTEND_TO_BACKEND: Record<FrontendLeadStatus, LeadStatus> = {
  [FrontendLeadStatus.NEW]: LeadStatus.NEW,

  [FrontendLeadStatus.SCRAPED]: LeadStatus.SCRAPED,

  [FrontendLeadStatus.QUALIFIED]: LeadStatus.QUALIFIED,

  [FrontendLeadStatus.NOT_QUALIFIED]: LeadStatus.NOT_QUALIFIED,

  [FrontendLeadStatus.REJECTED]: LeadStatus.REJECTED,

  [FrontendLeadStatus.ANALYZED]: LeadStatus.ANALYZED,

  [FrontendLeadStatus.OUTREACH_PENDING]: LeadStatus.OUTREACH_PENDING,

  [FrontendLeadStatus.OUTREACHED]: LeadStatus.OUTREACHED,

  [FrontendLeadStatus.CONTACT_MISSING]: LeadStatus.CONTACT_MISSING,

  [FrontendLeadStatus.CONTACTED]: LeadStatus.CONTACTED,

  [FrontendLeadStatus.ENGAGED]: LeadStatus.ENGAGED,

  [FrontendLeadStatus.RESPONDED]: LeadStatus.RESPONDED,

  [FrontendLeadStatus.CONVERTED]: LeadStatus.CONVERTED,
};

export function toFrontendLeadStatus(status: LeadStatus): FrontendLeadStatus {
  return BACKEND_TO_FRONTEND[status] ?? FrontendLeadStatus.NEW;
}

export function toBackendLeadStatus(status: FrontendLeadStatus): LeadStatus {
  return FRONTEND_TO_BACKEND[status];
}
