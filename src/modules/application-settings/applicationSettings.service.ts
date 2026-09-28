import { DeepPartial } from '@/shared/utils/object.utils';
import { IApplicationSettings } from './applicationSettings.interface';
import { ApplicationSettingsRepository } from './applicationSettings.repository';
import {
  ACQUISITION_PROVIDER_PRIORITY,
  LeadProvider,
} from '@/shared/constants';

export class ApplicationSettingsService {
  private static cache: IApplicationSettings | null = null;

  private static lastLoaded: number | null = null;

  private static readonly CACHE_TTL = 30 * 1000;

  static async getSettings(): Promise<IApplicationSettings> {
    const now = Date.now();

    if (
      this.cache &&
      this.lastLoaded &&
      now - this.lastLoaded < this.CACHE_TTL
    ) {
      return this.cache;
    }

    return this.refreshCache();
  }

  static async refreshCache(): Promise<IApplicationSettings> {
    const settings = await ApplicationSettingsRepository.get();

    this.cache = settings;

    this.lastLoaded = Date.now();

    return settings;
  }

  static async updateSettings(
    updates: DeepPartial<IApplicationSettings>,
  ): Promise<IApplicationSettings> {

    const updatedSettings = await ApplicationSettingsRepository.update(updates);
    await this.refreshCache();

    return updatedSettings;
  }

  static async isApplicationEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.enabled;
  }

  static async isAcquisitionEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.enabled && settings.acquisition.enabled;
  }

  static async isOutreachEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.enabled && settings.outreach.enabled;
  }

  static async isFollowupEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.enabled && settings.followup.enabled;
  }

  static async getDailyOutreachLimit(): Promise<number> {
    const settings = await this.getSettings();
    return settings.outreach.dailyLimit;
  }

  static async getMaxPendingLeads(): Promise<number> {
    const settings = await this.getSettings();
    return settings.acquisition.maxPendingLeads;
  }

  static async setAcquisitionEnabled(enabled: boolean): Promise<void> {
    return ApplicationSettingsRepository.setAcquisitionEnabled(enabled);
  }

  static async setOutreachEnabled(enabled: boolean): Promise<void> {
    return ApplicationSettingsRepository.setOutreachEnabled(enabled);
  }

  static async setFollowupsEnabled(enabled: boolean): Promise<void> {
    return ApplicationSettingsRepository.setFollowupsEnabled(enabled);
  }

  // Acquisition/Execution Providers Settings
  static async setAcquisitionProviderEnabled(
    provider: LeadProvider,
    enabled: boolean,
  ): Promise<void> {
    return ApplicationSettingsRepository.setAcquisitionProviderEnabled(
      provider,
      enabled,
    );
  }
  static async setExecutionProviderEnabled(
    provider: LeadProvider,
    enabled: boolean,
  ): Promise<void> {
    return ApplicationSettingsRepository.setExecutionProviderEnabled(
      provider,
      enabled,
    );
  }

  static async isProviderExecutionEnabled(
    provider: LeadProvider,
  ): Promise<boolean> {
    const settings = await ApplicationSettingsService.getSettings();

    return (
      settings.execution.providers[
        provider as keyof typeof settings.execution.providers
      ]?.enabled ?? false
    );
  }

  static getEnabledExecutionProviders(
    settings: IApplicationSettings,
  ): LeadProvider[] {
    return Object.entries(settings.execution.providers)
      .filter(([, config]) => config.enabled)
      .map(([provider]) => provider as LeadProvider);
  }

  static getDisabledExecutionProviders(
    settings: IApplicationSettings,
  ): LeadProvider[] {
    return Object.entries(settings.execution.providers)
      .filter(([, config]) => !config.enabled)
      .map(([provider]) => provider as LeadProvider);
  }

  static getFirstActiveAcquisitionProvider(
    settings: IApplicationSettings,
  ): LeadProvider | null {
    const provider = ACQUISITION_PROVIDER_PRIORITY.find(
      (provider) => settings.acquisition.providers[provider].enabled,
    );

    return provider ?? null;
  }
}
