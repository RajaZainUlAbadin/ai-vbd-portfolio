import { AcquisitionIdentityModel } from './acquisitionIdentity.model';
import {
  CreateAcquisitionIdentityInput,
  IAcquisitionIdentity,
} from './aqcuisitionIdentity.interface';
import { mapAcquisitionIdentity } from './acquisitionIdentity.mapper';

export class AcquisitionIdentityRepository {
  static async findByProviderIdentity(
    provider: string,
    externalId: string,
  ): Promise<IAcquisitionIdentity | null> {
    const document = await AcquisitionIdentityModel.findOne({
      provider,
      externalId,
    });

    return document ? mapAcquisitionIdentity(document) : null;
  }

  static async create(
    data: CreateAcquisitionIdentityInput,
  ): Promise<IAcquisitionIdentity> {
    const document = await AcquisitionIdentityModel.create(data);

    return mapAcquisitionIdentity(document);
  }

  static async updateSeen(id: string): Promise<IAcquisitionIdentity | null> {
    const document = await AcquisitionIdentityModel.findByIdAndUpdate(
      id,
      {
        $inc: {
          timesSeen: 1,
        },

        $set: {
          lastSeenAt: new Date(),
        },
      },
      {
        returnDocument: 'after',
      },
    );

    return document ? mapAcquisitionIdentity(document) : null;
  }

  static async markProcessed(id: string): Promise<IAcquisitionIdentity | null> {
    const document = await AcquisitionIdentityModel.findByIdAndUpdate(
      id,
      {
        $set: {
          lastProcessedAt: new Date(),
        },
      },
      {
        returnDocument: 'after',
      },
    );

    return document ? mapAcquisitionIdentity(document) : null;
  }

  static async linkLead(
    id: string,
    leadId: string,
  ): Promise<IAcquisitionIdentity | null> {
    const document = await AcquisitionIdentityModel.findByIdAndUpdate(
      id,
      {
        $set: {
          leadId,
        },
      },
      {
        returnDocument: 'after',
      },
    );

    return document ? mapAcquisitionIdentity(document) : null;
  }

  static async getAll(): Promise<IAcquisitionIdentity[]> {
    const documents = await AcquisitionIdentityModel.find();

    return documents.map(mapAcquisitionIdentity);
  }
}
