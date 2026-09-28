import { IAcquisitionSearch } from './acquisitionSearch.interface';
import { AcquisitionSearchModel } from './acquisitionSearch.model';

export function mapAcquisitionSearch(
  doc: InstanceType<typeof AcquisitionSearchModel>,
): IAcquisitionSearch {
  return {
    id: doc._id.toString(),

    acquisitionExecutionId: doc.acquisitionExecutionId?.toString(),

    searchMatrixId: doc.searchMatrixId.toString(),

    provider: doc.provider,

    query: doc.query,

    location: doc.location ?? undefined,

    searchHash: doc.searchHash,

    timesExecuted: doc.timesExecuted,

    totalResults: doc.totalResults ?? undefined,

    durationMs: doc.durationMs ?? undefined,

    lastFetchedAt: doc.lastFetchedAt ?? undefined,

    nextPageToken: doc.nextPageToken ?? undefined,

    rawResponse: doc.rawResponse,

    createdAt: doc.createdAt,

    updatedAt: doc.updatedAt,
  };
}
