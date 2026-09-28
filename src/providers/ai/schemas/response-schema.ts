export const RESPONSE_SCHEMA = {
  name: 'outreach_response',
  strict: true,

  schema: {
    type: 'object',
    additionalProperties: false,

    properties: {
      opening: {
        type: 'string',
        description:
          'A natural opening sentence acknowledging the previous conversation.',
      },

      message: {
        type: 'string',
        description:
          'The main body of the email containing the follow-up or reply.',
      },

      closing: {
        type: 'string',
        description:
          'A professional closing ending with one soft question or call to action.',
      },
    },

    required: ['opening', 'message', 'closing'],
  },
};
