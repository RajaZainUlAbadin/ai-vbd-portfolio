import { AcquisitionExecutionModel } from './acquisitionExecution.model';
import {
  AcquisitionExecutionStatus,
  CreateAcquisitionExecutionInput,
  IAcquisitionExecution,
} from './acquisitionExecution.interface';
import { mapAcquisitionExecution } from './acquisitionExecution.mapper';

export class AcquisitionExecutionRepository {
  static async create(
    data: CreateAcquisitionExecutionInput,
  ): Promise<IAcquisitionExecution> {
    const document = await AcquisitionExecutionModel.create({
      ...data,
      searchesExecuted: 0,
      leadsFound: 0,
      newLeads: 0,
      qualifiedLeads: 0,
      totalCost: 0,
    });
    return mapAcquisitionExecution(document);
  }

  static async findById(id: string): Promise<IAcquisitionExecution | null> {
    const document = await AcquisitionExecutionModel.findById(id);
    if (!document) {
      return null;
    }

    return mapAcquisitionExecution(document);
  }

  static async findByLeadId(
    leadId: string,
  ): Promise<IAcquisitionExecution | null> {
    const document = await AcquisitionExecutionModel.findById({
      leadId: leadId,
    });
    if (!document) {
      return null;
    }

    return mapAcquisitionExecution(document);
  }

  static async getAll(): Promise<IAcquisitionExecution[]> {
    const documents = await AcquisitionExecutionModel.find();

    return documents.map(mapAcquisitionExecution);
  }

  // Updates
  static async update(
    id: string,
    data: Partial<
      Omit<IAcquisitionExecution, 'id' | 'createdAt' | 'updatedAt'>
    >,
  ): Promise<IAcquisitionExecution | null> {
    const document = await AcquisitionExecutionModel.findByIdAndUpdate(
      id,
      data,
      {
        returnDocument: 'after',
      },
    );

    if (!document) {
      return null;
    }

    return mapAcquisitionExecution(document);
  }

  // Pipeline helpers
  static async markRunning(id: string): Promise<IAcquisitionExecution | null> {
    const document = await AcquisitionExecutionModel.findByIdAndUpdate(
      id,
      {
        status: AcquisitionExecutionStatus.RUNNING,
        startedAt: new Date(),
      },
      {
        returnDocument: 'after',
      },
    );

    return document ? mapAcquisitionExecution(document) : null;
  }

  static async incrementSearches(
    id: string,
    count = 1,
  ): Promise<IAcquisitionExecution | null> {
    const document = await AcquisitionExecutionModel.findByIdAndUpdate(
      id,
      {
        $inc: {
          searchesExecuted: count,
        },
      },
      {
        returnDocument: 'after',
      },
    );

    return document ? mapAcquisitionExecution(document) : null;
  }

  static async incrementLeadsFound(
    id: string,
    count = 1,
  ): Promise<IAcquisitionExecution | null> {
    const document = await AcquisitionExecutionModel.findByIdAndUpdate(
      id,
      {
        $inc: {
          leadsFound: count,
        },
      },
      {
        returnDocument: 'after',
      },
    );

    return document ? mapAcquisitionExecution(document) : null;
  }

  static async incrementNewLeads(
    id: string,
    count = 1,
  ): Promise<IAcquisitionExecution | null> {
    const document = await AcquisitionExecutionModel.findByIdAndUpdate(
      id,
      {
        $inc: {
          newLeads: count,
        },
      },
      {
        returnDocument: 'after',
      },
    );

    return document ? mapAcquisitionExecution(document) : null;
  }

  static async incrementQualifiedLeads(
    id: string,
    count = 1,
  ): Promise<IAcquisitionExecution | null> {
    const document = await AcquisitionExecutionModel.findByIdAndUpdate(
      id,
      {
        $inc: {
          qualifiedLeads: count,
        },
      },
      {
        returnDocument: 'after',
      },
    );

    return document ? mapAcquisitionExecution(document) : null;
  }

  static async addCost(
    id: string,
    amount: number,
  ): Promise<IAcquisitionExecution | null> {
    const document = await AcquisitionExecutionModel.findByIdAndUpdate(
      id,
      {
        $inc: {
          totalCost: amount,
        },
      },
      {
        returnDocument: 'after',
      },
    );

    return document ? mapAcquisitionExecution(document) : null;
  }

  static async complete(id: string): Promise<IAcquisitionExecution | null> {
    const document = await AcquisitionExecutionModel.findByIdAndUpdate(
      id,
      {
        status: AcquisitionExecutionStatus.COMPLETED,
        completedAt: new Date(),
      },
      {
        returnDocument: 'after',
      },
    );

    return document ? mapAcquisitionExecution(document) : null;
  }

  static async fail(id: string): Promise<IAcquisitionExecution | null> {
    const document = await AcquisitionExecutionModel.findByIdAndUpdate(
      id,
      {
        status: AcquisitionExecutionStatus.FAILED,
        completedAt: new Date(),
      },
      {
        returnDocument: 'after',
      },
    );

    return document ? mapAcquisitionExecution(document) : null;
  }
}
