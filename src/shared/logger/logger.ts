import { env } from '@/app/config/env';
import pino from 'pino';

export const logger = pino({
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
        }
      : undefined,
});
