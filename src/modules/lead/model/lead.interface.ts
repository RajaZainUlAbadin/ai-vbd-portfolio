import { LeadSource } from '../dto/website.dto';
import { LeadContact } from '../lead-contact/lead-contact.schema';
import { LeadStatus } from './lead.status';
import { LeadProvider } from '@/shared/constants';

/**
 * Application-level Lead type.
 *
 * This is the shape every service/controller/route handler should work with.
 * It differs from `LeadRecord` (the Mongo/Mongoose shape) in a few
 * deliberate ways so consumers never have to defensively cast or null-check:
 *
 *  - `_id` / `batchId` / `lastOutreachId` are plain `string`s, not ObjectIds.
 *  - Every field that Mongoose leaves optional/undefined on the schema
 *    (String, Number, Date, Boolean with no `required: true`) is given a
 *    concrete default here ('', 0, false, [], or null for dates/refs),
 *    so `lead.businessName` is always a string and never
 *    `lead.businessName ?? ''`.
 *  - Date fields that are genuinely "may not have happened yet"
 *    (lastOutreachAt, repliedAt, convertedAt, etc.) are typed as
 *    `Date | null` instead of `Date | undefined` — null is an intentional,
 *    explicit "not yet" rather than an accidental "forgot to set it".
 */
export interface ILead {
  id: string;
  batchId: string;

  businessName: string;
  website: string;
  address: string;
  contacts: LeadContact[];

  rating: number;
  reviewCount: number;

  mapsUrl: string;
  latitude: number;
  longitude: number;

  // Provider specific fields
  provider: LeadProvider;
  externalId: string;
  businessStatus: string;
  isFutureOpeningBusiness: boolean;
  primaryType: string;
  categories: string[];

  // Business logic
  dedupeHash: string;
  status: LeadStatus;
  score: number;

  // Outreach
  outreachCount: number;
  outreachSequenceStep: number;
  outreachScheduledFor: Date | null;
  lastOutreachAt: Date | null;
  nextFollowupAt: Date | null;

  lastEngagementAt: Date | null;
  repliedAt: Date | null;
  convertedAt: Date | null;

  currentOutreachId: string | null;

  /**
   * Website lead source.
   * Only applicable when provider is WEBSITE.
   */
  websiteSource?: LeadSource;
  /**
   * Source-specific information submitted
   * through the website.
   */
  websiteMetadata?: Record<string, unknown>;

  // timestamps: true on the schema
  createdAt: Date;
  updatedAt: Date;
}
