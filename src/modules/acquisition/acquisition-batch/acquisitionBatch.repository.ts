import { IAcquisitionBatch } from './acquisitionBatch.interface';
import { AcquisitionBatchModel } from './acquisitionBatch.model';
import { mapAcquisitionBatch } from './acquisitionBatch.mapper';

export class AcquisitionBatchRepository {
  static async create(
    data: Omit<IAcquisitionBatch, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<IAcquisitionBatch> {
    const document = await AcquisitionBatchModel.create(data);

    return mapAcquisitionBatch(document);
  }

  static async findById(id: string): Promise<IAcquisitionBatch | null> {
    const document = await AcquisitionBatchModel.findById(id);

    if (!document) {
      return null;
    }

    return mapAcquisitionBatch(document);
  }

  static async getAll(): Promise<IAcquisitionBatch[]> {
    const documents = await AcquisitionBatchModel.find();

    return documents.map(mapAcquisitionBatch);
  }
}
