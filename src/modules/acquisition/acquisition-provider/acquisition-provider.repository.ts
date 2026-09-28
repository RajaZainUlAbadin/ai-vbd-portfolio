import { LeadProvider } from '@/shared/constants';

import { AcquisitionProviderModel } from './acquisition-provider.model';
import {
  IAcquisitionProvider,
  ProviderUnavailableReason,
  mapAcquisitionProvider,
} from './acquisition-provider.types';

export class AcquisitionProviderRepository {
  static async create(
    data: Partial<IAcquisitionProvider> & {
      name: LeadProvider;
    },
  ): Promise<IAcquisitionProvider> {
    const provider = await AcquisitionProviderModel.create({
      name: data.name,
      enabled: data.enabled ?? true,
      available: data.available ?? true,
      reason: data.reason,
      disabledUntil: data.disabledUntil ?? null,
      lastErrorAt: data.lastErrorAt ?? null,
    });

    return mapAcquisitionProvider(provider.toObject());
  }

  static async upsert(
    name: LeadProvider,
    data: Partial<
      Pick<
        IAcquisitionProvider,
        'enabled' | 'available' | 'reason' | 'disabledUntil' | 'lastErrorAt'
      >
    > = {},
  ): Promise<IAcquisitionProvider> {
    const provider = await AcquisitionProviderModel.findOneAndUpdate(
      { name },
      {
        $set: data,
        $setOnInsert: {
          name,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
      },
    ).lean();

    return mapAcquisitionProvider(provider);
  }

  static async findByName(
    name: LeadProvider,
  ): Promise<IAcquisitionProvider | null> {
    const provider = await AcquisitionProviderModel.findOne({
      name,
    }).lean();

    if (!provider) {
      return null;
    }

    return mapAcquisitionProvider(provider);
  }

  static async findAll(): Promise<IAcquisitionProvider[]> {
    const providers = await AcquisitionProviderModel.find({})
      .sort({ name: 1 })
      .lean();

    return providers.map(mapAcquisitionProvider);
  }

  static async update(
    name: LeadProvider,
    data: Partial<
      Pick<
        IAcquisitionProvider,
        | 'enabled'
        | 'available'
        | 'reason'
        | 'description'
        | 'disabledUntil'
        | 'lastErrorAt'
      >
    >,
  ): Promise<IAcquisitionProvider | null> {
    const provider = await AcquisitionProviderModel.findOneAndUpdate(
      { name },
      {
        $set: data,
      },
      {
        returnDocument: 'after',
      },
    ).lean();

    if (!provider) {
      return null;
    }

    return mapAcquisitionProvider(provider);
  }

  static async delete(name: LeadProvider): Promise<boolean> {
    const result = await AcquisitionProviderModel.deleteOne({
      name,
    });

    return result.deletedCount === 1;
  }

  static async setUnavailable(
    name: LeadProvider,
    reason: ProviderUnavailableReason,
    description?: string,
    disabledUntil?: Date | null,
  ): Promise<IAcquisitionProvider | null> {
    return this.update(name, {
      available: false,
      reason,
      description: description ?? undefined,
      disabledUntil: disabledUntil ?? null,
      lastErrorAt: new Date(),
    });
  }

  static async setAvailable(
    name: LeadProvider,
  ): Promise<IAcquisitionProvider | null> {
    return this.update(name, {
      available: true,
      disabledUntil: null,
      //   reason: undefined,
    });
  }

  static async isAvailable(name: LeadProvider): Promise<boolean> {
    const provider = await AcquisitionProviderModel.findOne({
      name,
    }).lean();

    if (!provider) {
      return false;
    }

    if (!provider.enabled) {
      return false;
    }

    if (provider.available) {
      return true;
    }

    const now = new Date();

    const hasExpired = provider.disabledUntil && provider.disabledUntil <= now;

    if (!hasExpired) {
      return false;
    }

    await AcquisitionProviderModel.updateOne(
      {
        name,
        available: false,
        disabledUntil: {
          $lte: now,
        },
      },
      {
        $set: {
          available: true,
          disabledUntil: null,
        },
        $unset: {
          reason: 1,
        },
      },
    );

    return true;
  }
}
