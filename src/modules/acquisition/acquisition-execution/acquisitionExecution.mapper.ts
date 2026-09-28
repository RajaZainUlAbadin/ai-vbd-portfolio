import { IAcquisitionExecution } from './acquisitionExecution.interface';

import { AcquisitionExecutionModel } from './acquisitionExecution.model';

export function mapAcquisitionExecution(
  doc: InstanceType<typeof AcquisitionExecutionModel>,
): IAcquisitionExecution {
  return {
    id: doc._id.toString(),

    status: doc.status,

    source: doc.source,

    targetMatrixId: doc.targetMatrixId?.toString(),

    providers: doc.providers ?? [],

    searchesExecuted: doc.searchesExecuted ?? 0,

    leadsFound: doc.leadsFound ?? 0,

    newLeads: doc.newLeads ?? 0,

    qualifiedLeads: doc.qualifiedLeads ?? 0,

    totalCost: doc.totalCost ?? 0,

    startedAt: doc.startedAt ?? undefined,

    completedAt: doc.completedAt ?? undefined,

    createdAt: doc.createdAt,

    updatedAt: doc.updatedAt,
  };
}
