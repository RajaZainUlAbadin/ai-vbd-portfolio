import {
  ContactType,
  ContactSource,
  ContactStatus,
} from '@/modules/lead/lead-contact/lead-contact.types';
import { LeadRecord } from '@/modules/lead/model/lead.model';
import { LeadStatus } from '@/modules/lead/model/lead.status';

import { LeadImportRow } from './leadImport.types';
import { LeadProvider } from '@/shared/constants';
import { ILead } from '@/modules/lead/model/lead.interface';

function normalize(value?: string): string {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function normalizeDomain(value?: string): string {
  if (!value) return '';

  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split('?')[0]
    .split('#')[0];
}

// function generateDedupeHash(row: LeadImportRow): string {
//   const domain = normalizeDomain(
//     row.companyDomain || row.company_domain || row.companyWebsite,
//   );

//   if (domain) {
//     return crypto.createHash('sha256').update(`domain:${domain}`).digest('hex');
//   }

//   const businessName = normalize(row.companyName);
//   const location = normalize(row.location);

//   return crypto
//     .createHash('sha256')
//     .update(`business:${businessName}:${location}`)
//     .digest('hex');
// }

function buildContacts(row: LeadImportRow) {
  const email = normalize(row.Email || row.contact);

  if (!email) {
    return [];
  }

  return [
    {
      type: ContactType.EMAIL,
      value: email,
      name:
        [row['First Name'], row['Last Name']]
          .filter(Boolean)
          .join(' ')
          .trim() || undefined,
      designation: row.jobTitle?.trim() || undefined,
      source: ContactSource.CSV_IMPORT,
      status: ContactStatus.ACTIVE,
      confidence: 100,
      verified: true,
      isPrimary: true,
    },
  ];
}

export function mapLeadImportRowToLead(
  row: LeadImportRow,
  // batchId: string | mongoose.Types.ObjectId,
  // index: number,
): Partial<ILead> {
  const businessName = row.companyName?.trim();

  if (!businessName) {
    throw new Error('companyName is required');
  }

  const website =
    row.companyWebsite?.trim() ||
    row.companyDomain?.trim() ||
    row.company_domain?.trim();

  const contacts = buildContacts(row);

  return {
    // batchId: new mongoose.Types.ObjectId(batchId),
    // Provider-specific record identity
    externalId: '',

    businessName,

    website: website ?? '',

    address: row.location?.trim() ?? '',

    contacts: contacts as LeadRecord['contacts'],

    provider: LeadProvider.CSV_IMPORT,

    dedupeHash: '',

    status: LeadStatus.NEW,

    categories: [row.industry, row.subIndustry].filter(Boolean) as string[],

    score: 0,
    outreachCount: 0,
    outreachSequenceStep: 0,
    isFutureOpeningBusiness: false,
    // rating: 0,
    // reviewCount: 0,
    // mapsUrl: '',
    // latitude: 0,
    // longitude: 0,
    // businessStatus: '',
    // primaryType: '',

    // lastOutreachAt: null,
    // nextFollowupAt: null,
    // lastEngagementAt: null,
    // repliedAt: null,
    // convertedAt: null,
    // currentOutreachId: null,
  };
}
