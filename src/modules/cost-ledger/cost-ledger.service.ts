import { LeadModel } from '@/modules/lead/model/lead.model';
import {
  Category,
  Currency,
  Provider,
  Service,
} from '@/shared/constants/system.types';
import { CostLedgerRepository } from './cost-ledger.repository';
import { LeadsRepository } from '../lead/leads.repository';

export class CostLedgerService {
  /**
   * Base record method (internal)
   */
  static async record(data: {
    leadId: string;
    provider: string;
    service: string;
    category: string;
    action?: string;
    amount: number;
    currency?: string;
    referenceId?: string;
    status?: 'success' | 'retry' | 'failed';
  }) {
    // Fetch lead to get batchId
    const lead = await LeadsRepository.findById(data.leadId);

    if (!lead) {
      throw new Error('Lead not found for cost ledger');
    }

    return CostLedgerRepository.create({
      leadId: data.leadId,
      batchId: lead.batchId ?? '',
      provider: data.provider as Provider,
      service: data.service as Service,
      category: data.category as Category,
      action: data.action ?? '',
      amount: data.amount,
      currency: data.currency as Currency,
      referenceId: data.referenceId,
      status: data.status || 'success',
    });
  }

  /**
   * AI-specific helper (clean API for AIService)
   */
  static async recordAICost(data: {
    leadId: string;
    amount: number;
    model: string;
    referenceId?: string;
    tokens?: {
      input: number;
      output: number;
    };
  }) {
    return this.record({
      leadId: data.leadId,
      provider: 'OpenAI',
      service: 'CRM',
      category: 'AI_analysis',
      action: 'gpt_business_analysis',
      amount: data.amount,
      referenceId: data.referenceId,
    });
  }

  /**
   * Email cost helper
   */
  static async recordEmailCost(data: {
    leadId: string;
    amount: number;
    referenceId?: string;
  }) {
    return this.record({
      leadId: data.leadId,
      provider: 'Resend',
      service: 'CRM',
      category: 'Email Outreach',
      action: 'email_send',
      amount: data.amount,
      referenceId: data.referenceId,
    });
  }

  /**
   * WhatsApp cost helper
   */
  static async recordWhatsAppCost(data: {
    leadId: string;
    amount: number;
    referenceId?: string;
  }) {
    return this.record({
      leadId: data.leadId,
      provider: 'WhatsApp',
      service: 'CRM',
      category: 'WhatsApp',
      action: 'whatsapp_message_send',
      amount: data.amount,
      referenceId: data.referenceId,
    });
  }
}
