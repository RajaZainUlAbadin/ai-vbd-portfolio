import mongoose, { Schema } from 'mongoose';
import { PROVIDERS, SERVICES, CATEGORIES } from '@/shared/constants';
import type {
  Provider,
  Service,
  Category,
  CostStatus,
  Currency,
} from '@/shared/constants/system.types';

export interface CostLedger {
  id?: string;
  leadId: string;
  batchId?: string;

  provider: Provider;
  service: Service;
  category: Category;

  action: string;

  status: CostStatus;

  amount: number;
  currency: Currency;

  referenceId?: string;
}

const costLedgerSchema = new Schema(
  {
    /**
     * Lead this cost is associated with
     * enables per-lead lifetime cost tracking
     */
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      index: true,
      required: true,
    },

    /**
     * Batch grouping (campaign / acquisition run)
     * used for campaign-level analytics
     */
    batchId: {
      type: String,
      index: true,
      required: false,
    },

    /**
     * External provider that incurred cost
     * (OpenAI, Google, Twilio, etc.)
     */
    provider: {
      type: String,
      enum: Object.values(PROVIDERS),
      required: true,
    },

    /**
     * Optional reference to downstream entity
     * Example:
     * - AIAnalysisId
     * - OutreachId
     * - ScrapeResultId
     */
    referenceId: {
      type: String,
      index: true,
    },

    /**
     * Internal business service classification
     * Used for reporting (SEO vs CRM vs Web Dev etc.)
     */
    service: {
      type: String,
      enum: Object.values(SERVICES),
      required: true,
    },

    /**
     * System category (AI, Outreach, Acquisition, etc.)
     * used for grouping cost dashboards
     */
    category: {
      type: String,
      enum: Object.values(CATEGORIES),
      required: true,
    },

    /**
     * Specific action performed
     * IMPORTANT: gives granular visibility
     *
     * Examples:
     * - gpt_business_analysis
     * - google_place_search
     * - email_send
     * - whatsapp_message_send
     */
    action: {
      type: String,
      index: true,
    },

    /**
     * Execution status of billed operation
     */
    status: {
      type: String,
      enum: ['success', 'retry', 'failed'],
      default: 'success',
      index: true,
    },

    /**
     * Cost amount in selected currency
     */
    amount: {
      type: Number,
      default: 0,
    },

    /**
     * Currency of transaction
     */
    currency: {
      type: String,
      enum: ['USD', 'AED'],
      default: 'USD',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const CostLedgerModel = mongoose.model('CostLedger', costLedgerSchema);
