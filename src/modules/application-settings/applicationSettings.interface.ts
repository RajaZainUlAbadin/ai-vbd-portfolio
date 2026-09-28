import { LeadProvider } from '@/shared/constants';

export enum OutreachSpreadStrategy {
  RANDOM = 'RANDOM',
  EVEN = 'EVEN',
  BURST = 'BURST',
}

export type ProviderToggleSettings = {
  enabled: boolean;
};

export type AcquisitionProvidersSettings = {
  [LeadProvider.GOOGLE_PLACES]: ProviderToggleSettings;
  [LeadProvider.LINKEDIN]: ProviderToggleSettings;
  [LeadProvider.YELLOWPAGES]: ProviderToggleSettings;
};

export type ExecutionProvidersSettings = {
  [LeadProvider.GOOGLE_PLACES]: ProviderToggleSettings;
  [LeadProvider.WEBSITE]: ProviderToggleSettings;
  [LeadProvider.LINKEDIN]: ProviderToggleSettings;
  [LeadProvider.YELLOWPAGES]: ProviderToggleSettings;
  [LeadProvider.CSV_IMPORT]: ProviderToggleSettings;
};

export type AcquisitionProvider =
  | LeadProvider.GOOGLE_PLACES
  | LeadProvider.LINKEDIN
  | LeadProvider.YELLOWPAGES;

export interface IApplicationSettings {
  id: string;

  enabled: boolean;

  acquisition: {
    enabled: boolean;

    maxPendingLeads: number;
    providers: AcquisitionProvidersSettings;
    defaultProvider: AcquisitionProvider;
  };

  execution: {
    batchSize: number;
    providers: ExecutionProvidersSettings;
  };

  outreach: {
    enabled: boolean;

    dailyLimit: number;

    sendWindowStart: string;

    sendWindowEnd: string;

    maxSequence: number;

    timezone: string;

    spreadStrategy: OutreachSpreadStrategy;
  };

  followup: {
    enabled: boolean;

    defaultDelay: number;

    maxFollowUps: number;
  };

  notifications: {
    emailOnReply: boolean;
    emailOnReplyAt: string[] | null;

    emailOnError: boolean;
    emailOnErrorAt: string[] | null;

    dailyDigest: boolean;
    dailyDigestAt: string[] | null;
  };

  createdAt: Date;

  updatedAt: Date;
}
