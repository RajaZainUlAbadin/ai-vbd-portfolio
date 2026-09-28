import mongoose from 'mongoose';
import { env } from '@/app/config/env';
import { logger } from '@/shared/logger/logger';

let isConnected = false;

export const connectMongo = async () => {
  try {
    if (isConnected || mongoose.connection.readyState === 1) {
      return;
    }

    await mongoose.connect(env.MONGO_URI);

    isConnected = true;

    logger.info(
      {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        database: mongoose.connection.name,
      },
      'MongoDB connected successfully',
    );
    logger.info(`Mongo ready State:, ${mongoose.connection.readyState}`);
  } catch (error) {
    logger.error({ error: error as Error }, 'MongoDB connection failed');
    process.exit(1);
  }
};

export const disconnectMongo = async () => {
  await mongoose.disconnect();
};
