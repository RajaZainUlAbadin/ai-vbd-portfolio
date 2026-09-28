import mongoose, { Schema } from 'mongoose';
import { ScrapeStatus, ScrapingStage } from './scrape.status';

export interface ContactInfo {
  emails: string[];
  phones: ContactPhone[];
}

export interface ContactPhone {
  number: string;
  confidence: number;
  source: PhoneSource;
}

export enum PhoneSource {
  TEL = 'tel',
  JSONLD = 'jsonld',
  CONTACT_PAGE = 'contact-page',
  ABOUT_PAGE = 'about-page',
  SERVICES_PAGE = 'services-page',
  CONTEXT = 'context',
  REGEX = 'regex',
}

export interface SocialLinks {
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

export interface SiteStructure {
  hasAbout: boolean;
  hasServices: boolean;
  hasPortfolio: boolean;
  hasPricing: boolean;
  hasContact: boolean;
  hasBlog: boolean;
}

export interface SeoProfile {
  metaTitle?: string;
  metaDescription?: string;

  h1: string[];
}

export interface PerformanceProfile {
  loadTimeMs?: number;

  speedRating?: 'FAST' | 'NORMAL' | 'SLOW';
}

export interface BusinessSignals {
  hasWhatsapp: boolean;
  hasLiveChat: boolean;
  hasBookingSystem: boolean;
  hasEcommerce: boolean;

  hasAnalytics: boolean;
  hasMetaPixel: boolean;
  hasGoogleMapsEmbed: boolean;
  hasNewsletter: boolean;
}

export interface RedirectInfo {
  from: string;
  to: string;
  status: number;
}

export interface ScrapeProfilingError {
  method: string;
  message: string;
  createdAt: Date;
}

const scrapeResultSchema = new Schema(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
      index: true,
    },

    url: {
      type: String,
      required: true,
    },

    finalUrl: String,
    title: String,
    html: {
      type: String,
      select: false,
    },

    hero: {
      heading: String,
      description: String,
    },
    visibleText: String,
    pages: {
      home: String,
      about: String,
      services: String,
      contact: String,
    },

    headings: {
      type: {
        h1: {
          type: [String],
          default: [],
        },
        h2: {
          type: [String],
          default: [],
        },
        h3: {
          type: [String],
          default: [],
        },
      },

      default: {
        h1: [],
        h2: [],
        h3: [],
      },
    },

    forms: Number,
    technologies: {
      type: [String],
      default: [],
    },
    screenshot: String,

    links: {
      type: [String],
      default: [],
    },
    navigation: {
      type: [String],
      default: [],
    },
    metadata: Schema.Types.Mixed,

    // Execution props
    status: {
      type: String,
      enum: Object.values(ScrapeStatus),
      default: ScrapeStatus.EMPTY,
    },
    stage: {
      type: String,
      enum: Object.values(ScrapingStage),
      default: ScrapingStage.SCRAPING,
    },
    profilingErrors: {
      type: [
        {
          method: String,
          message: String,
          createdAt: Date,
        },
      ],
      default: [],
    },

    // Business props
    services: {
      type: [String],
      default: [],
    },
    contactInfo: {
      emails: {
        type: [String],
        default: [],
      },
      phones: {
        type: [
          {
            number: String,
            confidence: Number,
            source: String,
          },
        ],
        default: [],
      },
      default: {
        emails: [],
        phones: [],
      },
    },
    socialLinks: {
      linkedin: String,
      facebook: String,
      instagram: String,
      youtube: String,
    },
    ctas: {
      type: [String],
      default: [],
    },
    siteStructure: {
      type: {
        hasAbout: Boolean,
        hasServices: Boolean,
        hasPortfolio: Boolean,
        hasPricing: Boolean,
        hasContact: Boolean,
        hasBlog: Boolean,
      },

      default: {
        hasAbout: false,
        hasServices: false,
        hasPortfolio: false,
        hasPricing: false,
        hasContact: false,
        hasBlog: false,
      },
    },

    screenshotPath: String,

    seo: {
      metaTitle: String,

      metaDescription: String,

      h1: {
        type: [String],
        default: [],
      },
    },
    performance: {
      loadTimeMs: Number,
      speedRating: {
        type: String,
        enum: ['FAST', 'NORMAL', 'SLOW'],
      },
    },

    scripts: {
      type: [String],
      default: [],
    },

    businessSignals: {
      type: {
        hasWhatsapp: Boolean,
        hasLiveChat: Boolean,
        hasBookingSystem: Boolean,
        hasEcommerce: Boolean,

        hasAnalytics: Boolean,
        hasMetaPixel: Boolean,
        hasGoogleMapsEmbed: Boolean,
        hasNewsletter: Boolean,
      },
      default: {
        hasWhatsapp: false,
        hasLiveChat: false,
        hasBookingSystem: false,
        hasEcommerce: false,

        hasAnalytics: false,
        hasMetaPixel: false,
        hasGoogleMapsEmbed: false,
        hasNewsletter: false,
      },
    },

    // Scraping agnos
    attempts: {
      type: Number,
      default: 1,
    },
    failureReason: String,
    redirects: {
      type: [
        {
          from: String,
          to: String,
          status: Number,
        },
      ],
      default: [],
    },
    httpStatus: Number,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

scrapeResultSchema.virtual('id').get(function () {
  return this._id.toString();
});

export type ScrapeResultRecord = mongoose.InferSchemaType<
  typeof scrapeResultSchema
>;

export type ScrapeResultDocument =
  mongoose.HydratedDocument<ScrapeResultRecord>;

export const ScrapeResultModel = mongoose.model<ScrapeResultRecord>(
  'ScrapeResult',
  scrapeResultSchema,
);

export type IScrapeResult = ScrapeResultRecord & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};
