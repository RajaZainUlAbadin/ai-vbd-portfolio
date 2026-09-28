import { toIdString } from '@/shared/utils/mongoose-id-convert';
import { ILead } from '../model/lead.interface';
import { mapToLeadContacts } from '../lead-contact/lead-contact-maps';
import { LeadProvider } from '@/shared/constants';
import { LeadRaw } from '../model/lead.model';

export function mapToILead(doc: LeadRaw): ILead {
  return {
    id: doc._id.toString(),
    batchId: toIdString(doc.batchId) ?? '',

    businessName: doc.businessName ?? '',
    website: doc.website ?? '',
    address: doc.address ?? '',

    contacts: mapToLeadContacts(doc.contacts),

    rating: doc.rating ?? 0,
    reviewCount: doc.reviewCount ?? 0,

    mapsUrl: doc.mapsUrl ?? '',
    latitude: doc.latitude ?? 0,
    longitude: doc.longitude ?? 0,

    provider: doc.provider as LeadProvider,
    externalId: doc.externalId ?? '',
    businessStatus: doc.businessStatus ?? '',
    isFutureOpeningBusiness: doc.isFutureOpeningBusiness ?? false,
    primaryType: doc.primaryType ?? '',
    categories: doc.categories ?? [],

    dedupeHash: doc.dedupeHash,
    status: doc.status,
    score: doc.score ?? 0,

    outreachCount: doc.outreachCount ?? 0,
    outreachSequenceStep: doc.outreachSequenceStep ?? 0,
    outreachScheduledFor: doc.outreachScheduledFor ?? null,
    lastOutreachAt: doc.lastOutreachAt ?? null,
    nextFollowupAt: doc.nextFollowupAt ?? null,

    lastEngagementAt: doc.lastEngagementAt ?? null,
    repliedAt: doc.repliedAt ?? null,
    convertedAt: doc.convertedAt ?? null,

    currentOutreachId: toIdString(doc.currentOutreachId),

    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
