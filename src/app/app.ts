import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { httpLogger } from '@/shared/logger/httpLogger';
import { globalErrorHandler } from '@/shared/errors/globalErrorHandler';
import { registerRoutes } from './routes';
import { env } from './config/env';

const allowedOrigins = env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',') : [];

const app = express();

app.use(httpLogger);
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(compression());
app.use(helmet());
registerRoutes(app);

app.use(globalErrorHandler);

export default app;
