import mongoose from 'mongoose';

import { ILead } from '../model/lead.interface';
import { LeadRecord } from '../model/lead.model';
import { toObjectId } from '../../../shared/utils/mongoose-id-convert';
import { mapToLeadContactRecords } from '../lead-contact/lead-contact-maps';

export function mapToLeadRecord(lead: Partial<ILead>): Partial<LeadRecord> {
  const record: Record<string, unknown> = {};

  const set = <K extends keyof ILead>(key: K, value: unknown) => {
    if (value !== undefined) record[key] = value;
  };

  if (lead.batchId !== undefined) record.batchId = toObjectId(lead.batchId);
  if (lead.currentOutreachId !== undefined) {
    record.lastOutreachId = toObjectId(lead.currentOutreachId) ?? null;
  }

  set('businessName', lead.businessName);
  set('website', lead.website);
  set('address', lead.address);
  set(
    'contacts',
    lead.contacts ? mapToLeadContactRecords(lead.contacts) : undefined,
  );

  set('rating', lead.rating);
  set('reviewCount', lead.reviewCount);

  set('mapsUrl', lead.mapsUrl);
  set('latitude', lead.latitude);
  set('longitude', lead.longitude);

  set('provider', lead.provider);
  set('externalId', lead.externalId);
  set('businessStatus', lead.businessStatus);
  set('isFutureOpeningBusiness', lead.isFutureOpeningBusiness);
  set('primaryType', lead.primaryType);
  set('categories', lead.categories);

  set('dedupeHash', lead.dedupeHash);
  set('status', lead.status);
  set('score', lead.score);

  set('outreachCount', lead.outreachCount);
  set('outreachSequenceStep', lead.outreachSequenceStep);
  set('lastOutreachAt', lead.lastOutreachAt);
  set('nextFollowupAt', lead.nextFollowupAt);

  set('lastEngagementAt', lead.lastEngagementAt);
  set('repliedAt', lead.repliedAt);
  set('convertedAt', lead.convertedAt);

  return record as Partial<LeadRecord>;
}
