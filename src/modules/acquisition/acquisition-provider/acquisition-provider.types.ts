import { LeadProvider } from '@/shared/constants';
import { AcquisitionProviderDocument } from './acquisition-provider.model';

export interface IAcquisitionProvider {
  name: LeadProvider;

  // later will be replaced with Application Settings
  // to determine if the provider is enabled or not
  // instead of hardcoded acquisition.google_places.enabled
  enabled: boolean;

  available: boolean;

  reason?: ProviderUnavailableReason;
  description: string;

  disabledUntil?: Date | null;

  lastErrorAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export enum ProviderUnavailableReason {
  DAILY_QUOTA_EXHAUSTED = 'DAILY_QUOTA_EXHAUSTED',
  RATE_LIMITED = 'RATE_LIMITED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  PROVIDER_UNAVAILABLE = 'PROVIDER_UNAVAILABLE',
}

export const mapAcquisitionProvider = (
  document: AcquisitionProviderDocument,
): IAcquisitionProvider => ({
  name: document.name,
  enabled: document.enabled,
  available: document.available,
  reason: document.reason,
  description: document.description,
  disabledUntil: document.disabledUntil ?? null,
  lastErrorAt: document.lastErrorAt ?? null,
  createdAt: document.createdAt,
  updatedAt: document.updatedAt,
});
