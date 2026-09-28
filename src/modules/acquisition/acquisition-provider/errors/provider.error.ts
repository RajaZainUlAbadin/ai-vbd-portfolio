import { LeadProvider } from '@/shared/constants';
import { ProviderUnavailableReason } from '../acquisition-provider.types';

export class ProviderError extends Error {
  constructor(
    public readonly provider: LeadProvider,

    public readonly reason?: ProviderUnavailableReason,

    public readonly retryable: boolean = true,

    public readonly description?: string,

    message: string = 'Provider request failed',
  ) {
    super(message);

    this.name = 'ProviderError';
  }
}
