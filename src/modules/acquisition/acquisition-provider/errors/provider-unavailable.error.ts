import { LeadProvider } from '@/shared/constants';
import { ProviderUnavailableReason } from '../acquisition-provider.types';

export class ProviderUnavailableError extends Error {
  constructor(
    public readonly provider: LeadProvider,
    public readonly reason?: ProviderUnavailableReason,
  ) {
    super(`Provider ${provider} is not currently available`);
    this.name = 'ProviderUnavailableError';
    this.reason = reason;
  }
}
