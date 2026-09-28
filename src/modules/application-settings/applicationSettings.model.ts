import { Schema, model } from 'mongoose';

import {
  IApplicationSettings,
  OutreachSpreadStrategy,
} from './applicationSettings.interface';

import { LeadProvider } from '@/shared/constants';

const ApplicationSettingsSchema = new Schema<IApplicationSettings>(
  {
    enabled: {
      type: Boolean,
      default: true,
    },

    acquisition: {
      enabled: {
        type: Boolean,
        default: false,
      },

      maxPendingLeads: {
        type: Number,
        default: 20,
      },

      defaultProvider: {
        type: String,
        enum: [
          LeadProvider.GOOGLE_PLACES,
          LeadProvider.LINKEDIN,
          LeadProvider.YELLOWPAGES,
        ],
        default: LeadProvider.GOOGLE_PLACES,
      },

      providers: {
        GOOGLE_PLACES: {
          enabled: {
            type: Boolean,
            default: true,
          },
        },

        LINKEDIN: {
          enabled: {
            type: Boolean,
            default: false,
          },
        },

        YELLOWPAGES: {
          enabled: {
            type: Boolean,
            default: false,
          },
        },
      },
    },

    execution: {
      batchSize: {
        type: Number,
        default: 20,
      },

      providers: {
        GOOGLE_PLACES: {
          enabled: {
            type: Boolean,
            default: true,
          },
        },

        LINKEDIN: {
          enabled: {
            type: Boolean,
            default: false,
          },
        },

        YELLOWPAGES: {
          enabled: {
            type: Boolean,
            default: false,
          },
        },

        CSV_IMPORT: {
          enabled: {
            type: Boolean,
            default: false,
          },
        },
      },
    },

    outreach: {
      enabled: {
        type: Boolean,
        default: true,
      },

      dailyLimit: {
        type: Number,
        default: 10,
      },

      sendWindowStart: {
        type: String,
        default: '08:00',
      },

      sendWindowEnd: {
        type: String,
        default: '19:00',
      },

      maxSequence: {
        type: Number,
        default: 4,
      },

      timezone: {
        type: String,
        default: 'Asia/Dubai',
      },

      spreadStrategy: {
        type: String,
        enum: Object.values(OutreachSpreadStrategy),
        default: OutreachSpreadStrategy.RANDOM,
      },
    },

    followup: {
      enabled: {
        type: Boolean,
        default: true,
      },

      defaultDelay: {
        type: Number,
        default: 2, // number of days
      },

      maxFollowUps: {
        type: Number,
        default: 3,
      },
    },

    notifications: {
      emailOnReply: {
        type: Boolean,
        default: false,
      },

      emailOnReplyAt: {
        type: [String],
        default: null,
      },

      emailOnError: {
        type: Boolean,
        default: false,
      },

      emailOnErrorAt: {
        type: [String],
        default: null,
      },

      dailyDigest: {
        type: Boolean,
        default: false,
      },

      dailyDigestAt: {
        type: [String],
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);

export const ApplicationSettingsModel = model<IApplicationSettings>(
  'ApplicationSettings',
  ApplicationSettingsSchema,
);
