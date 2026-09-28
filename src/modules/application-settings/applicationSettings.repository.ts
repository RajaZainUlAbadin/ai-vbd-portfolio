import { DeepPartial, flattenObject } from '@/shared/utils/object.utils';
import { IApplicationSettings } from './applicationSettings.interface';
import { ApplicationSettingsModel } from './applicationSettings.model';
import { LeadProvider } from '@/shared/constants';

export class ApplicationSettingsRepository {
  static async get(): Promise<IApplicationSettings> {
    const settings = await ApplicationSettingsModel.findOne();

    if (settings) {
      return settings.toObject() as IApplicationSettings;
    }

    return this.createDefaults();
  }

  static async resetDefaults(): Promise<IApplicationSettings> {
    await ApplicationSettingsModel.deleteMany({});

    return this.createDefaults();
  }

  static async createDefaults(): Promise<IApplicationSettings> {
    const settings = await ApplicationSettingsModel.create({});

    return settings.toObject() as IApplicationSettings;
  }

  static async exists(): Promise<boolean> {
    const count = await ApplicationSettingsModel.countDocuments();
    return count > 0;
  }

  static async update(
    updates: DeepPartial<IApplicationSettings>,
  ): Promise<IApplicationSettings> {
    // const flattenedUpdates = flattenObject(updates);
    const flattenedUpdates = flattenObject(updates as Record<string, unknown>);

    if (Object.keys(flattenedUpdates).length === 0) {
      const settings = await ApplicationSettingsModel.findOne({}).lean();

      if (!settings) {
        throw new Error('Application settings not found');
      }

      return settings as IApplicationSettings;
    }

    const settings = await ApplicationSettingsModel.findOneAndUpdate(
      {},
      {
        $set: flattenedUpdates,
      },
      {
        returnDocument: 'after',
        upsert: true,
        runValidators: true,
      },
    );

    return settings!.toObject() as IApplicationSettings;
  }

  static async isAcquisitionEnabled(): Promise<boolean> {
    const settings = await ApplicationSettingsModel.findOne(
      {},
      {
        'acquisition.enabled': 1,
      },
    ).lean();

    if (!settings) {
      throw new Error('Application settings not found');
    }

    return settings.acquisition?.enabled ?? false;
  }

  static async setAcquisitionEnabled(enabled: boolean): Promise<void> {
    const result = await ApplicationSettingsModel.updateOne(
      {},
      {
        $set: {
          'acquisition.enabled': enabled,
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new Error('Application settings not found');
    }
  }

  static async setOutreachEnabled(enabled: boolean): Promise<void> {
    const result = await ApplicationSettingsModel.updateOne(
      {},
      {
        $set: {
          'outreach.enabled': enabled,
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new Error('Application settings not found');
    }
  }

  static async setFollowupsEnabled(enabled: boolean): Promise<void> {
    const result = await ApplicationSettingsModel.updateOne(
      {},
      {
        $set: {
          'followup.enabled': enabled,
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new Error('Application settings not found');
    }
  }

  // Acquisition/Execution Providers Settings
  static async setAcquisitionProviderEnabled(
    provider: LeadProvider,
    enabled: boolean,
  ): Promise<void> {
    const path = `acquisition.providers.${provider}.enabled`;

    const result = await ApplicationSettingsModel.updateOne(
      {},
      {
        $set: {
          [path]: enabled,
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new Error('Application settings not found');
    }
  }

  static async setExecutionProviderEnabled(
    provider: LeadProvider,
    enabled: boolean,
  ): Promise<void> {
    const path = `execution.providers.${provider}.enabled`;

    const result = await ApplicationSettingsModel.updateOne(
      {},
      {
        $set: {
          [path]: enabled,
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new Error('Application settings not found');
    }
  }
}
