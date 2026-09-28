import crypto from 'crypto';

import { ILead } from '../model/lead.interface';
import { LeadStatus } from '../model/lead.status';

import { Lead_website } from './website.dto';

import { LeadProvider } from '@/shared/constants';

import {
  ContactSource,
  ContactStatus,
  ContactType,
} from '../lead-contact/lead-contact.types';
import { LeadContact } from '../lead-contact/lead-contact.schema';

export class WebsiteLeadMapper {
  static toILead(lead_web: Lead_website): Partial<ILead> {
    return {
      businessName:
        lead_web.company?.trim() ||
        lead_web.name?.trim() ||
        lead_web.email?.trim(),

      website: '',
      address: '',

      contacts: this.mapContacts(lead_web),

      provider: LeadProvider.WEBSITE,
      websiteSource: lead_web.source,
      websiteMetadata: lead_web.metadata ?? {},

      externalId: lead_web.email.trim().toLowerCase(),

      businessStatus: 'WEBSITE_INQUIRY',

      isFutureOpeningBusiness: false,

      primaryType: lead_web.source,

      categories: ['website-lead', lead_web.source],

      dedupeHash: this.createDedupeHash(lead_web),
    };
  }

  /**
   * Maps website lead contact information
   * into structured LeadContact records.
   */
  private static mapContacts(lead_web: Lead_website): LeadContact[] {
    const contacts: LeadContact[] = [];

    /**
     * Email is required for all website leads.
     */
    contacts.push(
      this.createContact({
        type: ContactType.EMAIL,
        value: lead_web.email,
        name: lead_web.name ?? '',
        isPrimary: true,
      }),
    );

    /**
     * Phone is optional.
     */
    if (lead_web.phone?.trim()) {
      contacts.push(
        this.createContact({
          type: ContactType.PHONE,
          value: lead_web.phone,
          name: lead_web.name ?? '',
          isPrimary: false,
        }),
      );
    }

    return contacts;
  }

  private static createContact({
    type,
    value,
    name,
    isPrimary,
  }: {
    type: ContactType;
    value: string;
    name?: string;
    isPrimary: boolean;
  }): LeadContact {
    return {
      type,

      value: value.trim(),

      name: name?.trim() || null,

      designation: null,

      source: ContactSource.WEBSITE,

      status: ContactStatus.ACTIVE,

      confidence: 1,

      verified: false,

      isPrimary,
    };
  }

  /**
   * Creates a deterministic hash for website lead deduplication.
   *
   * Source is included so the same email can submit
   * different types of website forms independently.
   */
  private static createDedupeHash(lead_web: Lead_website): string {
    const value = [lead_web.source, lead_web.email.trim().toLowerCase()].join(
      ':',
    );

    return crypto.createHash('sha256').update(value).digest('hex');
  }
}
