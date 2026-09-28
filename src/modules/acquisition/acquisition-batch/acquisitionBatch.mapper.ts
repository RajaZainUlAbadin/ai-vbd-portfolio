import { IAcquisitionBatch } from './acquisitionBatch.interface';
import { AcquisitionBatchModel } from './acquisitionBatch.model';

export function mapAcquisitionBatch(
  doc: InstanceType<typeof AcquisitionBatchModel>,
): IAcquisitionBatch {
  return {
    id: doc._id.toString(),

    acquisitionExecutionId: doc.acquisitionExecutionId?.toString(),

    acquisitionSearchId: doc.acquisitionSearchId?.toString(),

    provider: doc.provider,
    query: doc.query,

    location: doc.location ?? undefined,

    traceId: doc.traceId ?? undefined,

    totalResults: doc.totalResults ?? undefined,

    rawResponse: doc.rawResponse,

    expiresAt: doc.expiresAt ?? undefined,

    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
