import mongoose, { Schema } from 'mongoose';
import {
  leadContactSchema,
} from '../../lead/lead-contact/lead-contact.schema';

const outreachMessageSchema = new Schema(
  {
    subject: String,
    greeting: String,
    opening: String,
    message: String,
    closing: String,
  },
  {
    _id: false,
  },
);

const aiAnalysisSchema = new Schema(
  {
    // Basic Info
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
      index: true,
    },
    scrapeResultId: {
      type: Schema.Types.ObjectId,
      ref: 'ScrapeResult',
    },
    provider: {
      type: String,
    },
    model: {
      type: String,
    },

    // Business Overview
    businessName: {
      type: String,
      required: true,
    },

    businessSummary: {
      type: String,
      default: '',
    },

    confidenceScore: {
      type: Number,
      default: 0,
    },

    estimatedBusinessSize: {
      type: String,
      enum: ['micro', 'small', 'medium', 'large', 'enterprise'],
    },

    contacts: {
      type: [leadContactSchema],
      default: [],
    },

    businessMaturityScore: {
      type: Number,
      default: 0,
    },

    digitalPresenceScore: {
      type: Number,
      default: 0,
    },

    uxScore: {
      type: Number,
      default: 0,
    },

    seoScore: {
      type: Number,
      default: 0,
    },

    opportunityScore: {
      type: Number,
      default: 0,
    },

    conversionProbability: {
      type: Number,
      default: 0,
    },

    mobileCheck: {
      dataAvailable: {
        type: Boolean,
        default: false,
      },

      isMobileResponsive: {
        type: Boolean,
        default: false,
      },

      loadingTimeIssues: {
        type: String,
        default: '',
      },

      breakingParts: {
        type: String,
        default: '',
      },

      notes: {
        type: String,
        default: '',
      },
    },

    keyFindings: {
      type: [String],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    painPoints: {
      type: [String],
      default: [],
    },

    primaryPainPoint: {
      type: String,
      default: '',
    },

    opportunities: {
      type: [String],
      default: [],
    },

    recommendedServices: {
      type: [String],
      default: [],
    },

    personalizedOutreach: {
      type: outreachMessageSchema,
      default: {},
    },

    qualification: {
      qualified: {
        type: Boolean,
        default: false,
      },

      score: {
        type: Number,
        default: 0,
      },

      reason: {
        type: String,
        default: '',
      },
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
  },
);

export const AIAnalysisModel = mongoose.model('AIAnalysis', aiAnalysisSchema);
