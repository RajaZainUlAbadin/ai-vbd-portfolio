import crypto from 'crypto';

export const generateSearchHash = (input: {
  provider: string;
  query: string;
  location?: string;
}) => {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(input))
    .digest('hex');
};
