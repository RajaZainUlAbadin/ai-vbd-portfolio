import mongoose from 'mongoose';
import { LeadContact, LeadContactRecord } from './lead-contact.schema';

type LeadContactRecordWithId = LeadContactRecord & {
  _id: mongoose.Types.ObjectId;
};

export function mapToLeadContact(record: LeadContactRecordWithId): LeadContact {
  return {
    id: record._id.toString(),
    type: record.type,
    value: record.value,
    name: record.name,
    designation: record.designation,
    source: record.source,
    status: record.status,
    confidence: record.confidence ?? 100,
    verified: record.verified ?? false,
    isPrimary: record.isPrimary ?? false,
  };
}

export function mapToLeadContacts(
  records: LeadContactRecordWithId[] | null | undefined,
): LeadContact[] {
  return (records ?? []).map(mapToLeadContact);
}

export function mapToLeadContactRecord(
  contact: LeadContact,
): LeadContactRecord {
  return {
    type: contact.type,
    value: contact.value,
    name: contact.name,
    designation: contact.designation,
    source: contact.source,
    status: contact.status,
    confidence: contact.confidence,
    verified: contact.verified,
    isPrimary: contact.isPrimary,
  };
}

export function mapToLeadContactRecords(
  contacts: LeadContact[] | undefined,
): LeadContactRecord[] {
  return (contacts ?? []).map(mapToLeadContactRecord);
}
