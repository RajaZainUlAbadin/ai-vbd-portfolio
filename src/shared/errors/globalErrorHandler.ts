import { Request, Response, NextFunction } from 'express';
import { logger } from '@/shared/logger/logger';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err);

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};
