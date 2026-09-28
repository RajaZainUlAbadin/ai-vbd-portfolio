import { LeadsRepository } from '../leads.repository';
import { LeadContact } from './lead-contact.schema';
import { ContactStatus, ContactType } from './lead-contact.types';

export class LeadContactService {
  static getBestContact(
    contacts: LeadContact[],
    type: ContactType,
  ): LeadContact | null {
    const eligibleContacts = contacts.filter(
      (contact) =>
        contact.type === type && contact.status === ContactStatus.ACTIVE,
    );

    if (!eligibleContacts.length) {
      return null;
    }

    return [...eligibleContacts].sort((a, b) => {
      // 1. Verified first
      if (a.verified !== b.verified) {
        return Number(b.verified) - Number(a.verified);
      }

      // 2. Confidence
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }

      // 3. Designation
      const designationDiff =
        this.getDesignationScore(b.designation) -
        this.getDesignationScore(a.designation);

      if (designationDiff !== 0) {
        return designationDiff;
      }

      // 4. Primary contact
      return Number(b.isPrimary) - Number(a.isPrimary);
    })[0];
  }

  private static getDesignationScore(designation?: string | null): number {
    if (!designation) return 0;

    const value = designation.toLowerCase();

    if (
      value.includes('owner') ||
      value.includes('founder') ||
      value.includes('ceo') ||
      value.includes('chief executive')
    ) {
      return 100;
    }

    if (
      value.includes('director') ||
      value.includes('partner') ||
      value.includes('president')
    ) {
      return 80;
    }

    if (value.includes('manager') || value.includes('head')) {
      return 60;
    }

    if (value.includes('marketing') || value.includes('sales')) {
      return 50;
    }

    return 10;
  }

  // Contact Status
  static async markContactBounced(leadId: string, recipient: string) {
    return LeadsRepository.updateContactStatus(
      leadId,
      recipient,
      ContactStatus.BOUNCED,
    );
  }

  static async markContactUnsubscribed(leadId: string, recipient: string) {
    return LeadsRepository.updateContactStatus(
      leadId,
      recipient,
      ContactStatus.UNSUBSCRIBED,
    );
  }

  static async markContactInvalid(leadId: string, recipient: string) {
    return LeadsRepository.updateContactStatus(
      leadId,
      recipient,
      ContactStatus.INVALID,
    );
  }
}
