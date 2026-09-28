import { AcquisitionIdentityModel } from './acquisitionIdentity.model';
import { IAcquisitionIdentity } from './aqcuisitionIdentity.interface';

export function mapAcquisitionIdentity(
  doc: InstanceType<typeof AcquisitionIdentityModel>,
): IAcquisitionIdentity {
  return {
    id: doc._id.toString(),

    provider: doc.provider,

    externalId: doc.externalId,

    businessName: doc.businessName ?? undefined,

    website: doc.website ?? undefined,

    phone: doc.phone ?? undefined,

    leadId: doc.leadId?.toString(),

    firstSeenAt: doc.firstSeenAt,

    lastSeenAt: doc.lastSeenAt,

    lastProcessedAt: doc.lastProcessedAt ?? undefined,

    timesSeen: doc.timesSeen,

    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
