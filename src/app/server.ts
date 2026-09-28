import app from './app';
import { env } from './config/env';
import { logger } from '@/shared/logger/logger';
import { registerShutdown } from './gracefulShutdown';
import { registerProviders } from '@/providers';
import { bootstrapApp } from './bootstrap';

const startServer = async () => {
  const PORT = Number(env.PORT || 5000);
  const HOST = env.HOST || '0.0.0.0';

  try {
    registerProviders();

    await bootstrapApp();

    const server = app.listen(PORT, HOST, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });

    registerShutdown(server);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

startServer();
