import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    PORT: z.coerce.number(),
    HOST: z.string().min(1),

    CORS_ORIGIN: z.string().min(1),

    MONGO_URI: z.string().min(1),
    REDIS_HOST: z.string().min(1),
    REDIS_PORT: z.coerce.number(),
    REDIS_USERNAME: z.string().min(1).optional(),
    REDIS_PASSWORD: z.string().min(1).optional(),
    REDIS_MASTER_URL: z.string().min(1).optional(),

    OPENAI_API_KEY: z.string().min(1),
    OPENAI_MODEL: z.string().min(1).default('gpt-4.1-mini'),

    // RESEND_API_KEY: z.string().min(1),
    // OUTREACH_FROM_EMAIL: z.email(),

    GOOGLE_MAPS_API_KEY: z.string().min(1),

    WHATSAPP_API_VERSION: z.string(),
    WHATSAPP_ACCESS_TOKEN: z.string(),
    WHATSAPP_PHONE_NUMBER_ID: z.coerce.number(),
    WHATSAPP_BUSINESS_ACCOUNT_ID: z.coerce.string(),
    WHATSAPP_VERIFY_TOKEN: z.string(),

    AWS_SES_INBOUND_BUCKET: z.string().min(1),
    AWS_REGION: z.string().min(1),
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    SES_FROM: z.string().min(1),
    AWS_SES_ConfigurationSets: z.string().min(1),
    AWS_WEBHOOK_SECRET: z.string().min(1),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production') {
      if (!env.REDIS_MASTER_URL) {
        ctx.addIssue({
          code: 'custom',
          path: ['REDIS_MASTER_URL'],
          message: 'REDIS_MASTER_URL is required in production',
        });
      }

      // if (!env.REDIS_USERNAME) {
      //   ctx.addIssue({
      //     code: 'custom',
      //     path: ['REDIS_USERNAME'],
      //     message: 'REDIS_USERNAME is required in production',
      //   });
      // }

      // if (!env.REDIS_PASSWORD) {
      //   ctx.addIssue({
      //     code: 'custom',
      //     path: ['REDIS_PASSWORD'],
      //     message: 'REDIS_PASSWORD is required in production',
      //   });
      // }
    }
  });
export const env = envSchema.parse(process.env);
