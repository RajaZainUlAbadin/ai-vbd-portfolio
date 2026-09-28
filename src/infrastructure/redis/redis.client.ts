import Redis, { RedisOptions } from 'ioredis';
import { env } from '@/app/config/env';
import { logger } from '@/shared/logger/logger';

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,

  retryStrategy(times: number) {
    const baseDelay = Math.min(
      250 * Math.pow(2, Math.min(times - 1, 5)),
      10_000,
    );

    const jitter = Math.floor(Math.random() * 250);

    const delay = baseDelay + jitter;

    logger.warn(
      {
        attempt: times,
        delay,
      },
      'Redis reconnecting',
    );
    return delay;
  },
};

const createRedisConnection = (): Redis => {
  const redis = env.REDIS_MASTER_URL
    ? new Redis(env.REDIS_MASTER_URL, redisOptions)
    : new Redis({
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        ...redisOptions,
      });

  redis.on('connect', () => {
    logger.info(
      {
        redisUrlConfigured: Boolean(env.REDIS_MASTER_URL),
        host: env.REDIS_MASTER_URL ? undefined : env.REDIS_HOST,
        port: env.REDIS_MASTER_URL ? undefined : env.REDIS_PORT,
      },
      'Redis connected',
    );
  });

  redis.on('ready', () => {
    logger.info('Redis ready');
  });

  redis.on('close', () => {
    logger.warn('Redis connection closed');
  });

  // redis.on('reconnecting', (delay: number) => {
  //   logger.warn({ delay }, 'Redis reconnecting');
  // });

  redis.on('error', (err) => {
    logger.error(
      {
        name: err.name,
        message: err.message,
        code: (err as NodeJS.ErrnoException).code,
      },
      'Redis connection error',
    );
  });

  return redis;
};

//Factories
export const createQueueConnection = () => createRedisConnection();

export const createWorkerConnection = () => createRedisConnection();

export const createMonitorConnection = () => createRedisConnection();

// Long-lived purpose-specific connections
export const healthRedis = createRedisConnection();
