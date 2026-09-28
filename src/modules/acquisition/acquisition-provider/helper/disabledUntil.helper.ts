import { ProviderUnavailableReason } from '../acquisition-provider.types';

export function getDisabledUntil(
  reason: ProviderUnavailableReason,
): Date | null {
  switch (reason) {
    case ProviderUnavailableReason.DAILY_QUOTA_EXHAUSTED:
      // 24 hours
      return new Date(Date.now() + 24 * 60 * 60 * 1000);

    case ProviderUnavailableReason.RATE_LIMITED:
      // 5 minutes
      return new Date(Date.now() + 5 * 60 * 1000);

    case ProviderUnavailableReason.AUTHENTICATION_FAILED:
      return null;

    case ProviderUnavailableReason.PROVIDER_UNAVAILABLE:
      // 15 minutes
      return new Date(Date.now() + 15 * 60 * 1000);

    default:
      return null;
  }
}
