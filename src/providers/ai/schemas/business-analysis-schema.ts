const SCORE = {
  type: 'integer',
  minimum: 0,
  maximum: 100,
} as const;

const STRING_ARRAY = {
  type: 'array',
  items: {
    type: 'string',
  },
};

export const BUSINESS_ANALYSIS_SCHEMA = {
  name: 'business_analysis',
  strict: true,

  schema: {
    type: 'object',

    additionalProperties: false,

    properties: {
      businessName: {
        type: 'string',
      },

      businessSummary: {
        type: 'string',
      },

      confidenceScore: SCORE,

      estimatedBusinessSize: {
        type: 'string',
        enum: ['micro', 'small', 'medium', 'large', 'enterprise'],
      },

      contacts: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            type: {
              type: 'string',
              enum: ['EMAIL', 'PHONE', 'WHATSAPP'],
            },

            value: {
              type: 'string',
            },

            confidence: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
            },

            name: {
              type: 'string',
            },

            designation: {
              type: 'string',
            },

            source: {
              type: 'string',
              enum: ['AI'],
            },

            verified: {
              type: 'boolean',
            },

            isPrimary: {
              type: 'boolean',
            },

            status: {
              type: 'string',
              enum: ['ACTIVE', 'BOUNCED', 'INVALID', 'UNSUBSCRIBED'],
            },
          },

          required: [
            'type',
            'value',
            'confidence',
            'name',
            'designation',
            'source',
            'verified',
            'isPrimary',
            'status',
          ],
        },
      },

      uxScore: SCORE,
      seoScore: SCORE,
      digitalPresenceScore: SCORE,

      opportunityScore: SCORE,
      businessMaturityScore: SCORE,
      conversionProbability: SCORE,

      mobileCheck: {
        type: 'object',
        additionalProperties: false,
        properties: {
          dataAvailable: {
            type: 'boolean',
          },
          isMobileResponsive: {
            type: 'boolean',
          },
          loadingTimeIssues: {
            type: 'string',
          },
          breakingParts: {
            type: 'string',
          },
          notes: {
            type: 'string',
          },
        },
        required: [
          'dataAvailable',
          'isMobileResponsive',
          'loadingTimeIssues',
          'breakingParts',
          'notes',
        ],
      },

      keyFindings: STRING_ARRAY,
      strengths: STRING_ARRAY,
      painPoints: STRING_ARRAY,

      primaryPainPoint: {
        type: 'string',
      },

      opportunities: STRING_ARRAY,
      recommendedServices: STRING_ARRAY,

      personalizedOutreach: {
        type: 'object',
        additionalProperties: false,
        properties: {
          subject: {
            type: 'string',
          },
          greeting: {
            type: 'string',
          },
          opening: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
          closing: {
            type: 'string',
          },
        },
        required: ['subject', 'greeting', 'opening', 'message', 'closing'],
      },

      qualification: {
        type: 'object',

        additionalProperties: false,

        properties: {
          qualified: {
            type: 'boolean',
          },

          score: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
          },

          reason: {
            type: 'string',
          },
        },

        required: ['qualified', 'score', 'reason'],
      },

      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
      },
    },

    required: [
      'businessName',
      'businessSummary',
      'confidenceScore',
      'estimatedBusinessSize',

      'contacts',

      'uxScore',
      'seoScore',
      'digitalPresenceScore',

      'opportunityScore',
      'businessMaturityScore',
      'conversionProbability',

      'mobileCheck',

      'keyFindings',
      'strengths',
      'painPoints',
      'primaryPainPoint',
      'opportunities',

      'recommendedServices',

      'personalizedOutreach',

      'qualification',

      'priority',
    ],
  },
} as const;
