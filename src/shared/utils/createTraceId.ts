import { randomUUID } from 'crypto';

export const createTraceId = () => {
  return randomUUID();
};
