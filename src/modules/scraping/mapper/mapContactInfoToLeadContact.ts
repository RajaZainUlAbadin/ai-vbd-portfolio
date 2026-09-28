import {
  ContactSource,
  ContactStatus,
  ContactType,
} from '@/modules/lead/lead-contact/lead-contact.types';
import { ContactInfo } from '../model/scrapeResult.model';
import { LeadContact } from '@/modules/lead/lead-contact/lead-contact.schema';

interface MapOptions {
  defaultEmailConfidence?: number;
  defaultPhoneConfidence?: number;
  source?: ContactSource;
  markPrimaryFirst?: boolean;
}

const DEFAULT_OPTIONS: MapOptions = {
  defaultEmailConfidence: 90,
  defaultPhoneConfidence: 80,
  source: ContactSource.SCRAPER,
  markPrimaryFirst: true,
};

export function mapContactInfoToLeadContact(
  contactInfo: ContactInfo,
  options: MapOptions = {},
): LeadContact[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const result: LeadContact[] = [];

  if (!contactInfo) return result;

  mapEmails(contactInfo, result, opts);
  mapPhones(contactInfo, result, opts);

  return result;
}

/* -------------------------
   EMAIL MAPPING
--------------------------*/
function mapEmails(
  contactInfo: ContactInfo,
  result: LeadContact[],
  opts: MapOptions,
) {
  const emails = contactInfo.emails || [];

  emails.forEach((email, index) => {
    if (!email) return;

    result.push(
      createLeadContact({
        type: ContactType.EMAIL,
        value: normalizeEmail(email),
        confidence: opts.defaultEmailConfidence!,
        source: opts.source!,
        isPrimary: opts.markPrimaryFirst ? index === 0 : false,
      }),
    );
  });
}

/* -------------------------
   PHONE MAPPING
--------------------------*/
function mapPhones(
  contactInfo: ContactInfo,
  result: LeadContact[],
  opts: MapOptions,
) {
  const phones = contactInfo.phones || [];

  phones.forEach((phone, index) => {
    if (!phone?.number) return;

    result.push(
      createLeadContact({
        type: ContactType.PHONE,
        value: normalizePhone(phone.number),
        confidence: phone.confidence ?? opts.defaultPhoneConfidence!,
        source: opts.source!,
        isPrimary: opts.markPrimaryFirst ? index === 0 : false,
      }),
    );
  });
}

/* -------------------------
   FACTORY FUNCTION
--------------------------*/
function createLeadContact(params: {
  type: ContactType;
  value: string;
  confidence: number;
  source: ContactSource;
  isPrimary: boolean;
}): LeadContact {
  return {
    type: params.type,
    value: params.value,
    confidence: clampConfidence(params.confidence),

    source: params.source,
    status: ContactStatus.ACTIVE,

    verified: false,
    isPrimary: params.isPrimary,

    // optional enrichment hooks later
    name: undefined,
    designation: undefined,
  };
}

/* -------------------------
   NORMALIZATION HELPERS
--------------------------*/
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string): string {
  return phone.replace(/\s|\.|\(|\)|-/g, '').trim();
}

function clampConfidence(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}
