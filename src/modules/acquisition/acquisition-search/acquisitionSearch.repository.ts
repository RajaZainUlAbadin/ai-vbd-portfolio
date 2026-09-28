import {
  CreateAcquisitionSearch,
  IAcquisitionSearch,
} from './acquisitionSearch.interface';
import { AcquisitionSearchModel } from './acquisitionSearch.model';
import { mapAcquisitionSearch } from './acquisitionSearch.mapper';
import mongoose from 'mongoose';

export class AcquisitionSearchRepository {
  static async findByHash(
    searchHash: string,
  ): Promise<IAcquisitionSearch | null> {
    const document = await AcquisitionSearchModel.findOne({
      searchHash,
    });

    return document ? mapAcquisitionSearch(document) : null;
  }

  static async create(
    data: CreateAcquisitionSearch,
  ): Promise<IAcquisitionSearch> {
    const document = await AcquisitionSearchModel.create(data);

    return mapAcquisitionSearch(document);
  }

  static async update(
    id: string,
    data: Partial<Omit<IAcquisitionSearch, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<IAcquisitionSearch | null> {
    const document = await AcquisitionSearchModel.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
    });

    return document ? mapAcquisitionSearch(document) : null;
  }

  static async incrementExecution(id: string): Promise<IAcquisitionSearch> {
    const document = await AcquisitionSearchModel.findByIdAndUpdate(
      id,
      {
        $inc: {
          timesExecuted: 1,
        },

        $set: {
          lastFetchedAt: new Date(),
        },
      },
      {
        returnDocument: 'after',
      },
    );

    if (!document) {
      throw new Error(`AcquisitionSearch ${id} not found`);
    }

    return mapAcquisitionSearch(document);
  }

  static async updatePaginationToken(
    id: string,
    nextPageToken?: string,
  ): Promise<IAcquisitionSearch | null> {
    const document = await AcquisitionSearchModel.findByIdAndUpdate(
      id,
      {
        $set: {
          nextPageToken,
        },
      },
      {
        returnDocument: 'after',
      },
    );

    return document ? mapAcquisitionSearch(document) : null;
  }

  static async updateResults(
    id: string,
    totalResults: number,
    durationMs?: number,
  ): Promise<IAcquisitionSearch | null> {
    const document = await AcquisitionSearchModel.findByIdAndUpdate(
      id,
      {
        $set: {
          totalResults,
          durationMs,
        },
      },
      {
        returnDocument: 'after',
      },
    );

    return document ? mapAcquisitionSearch(document) : null;
  }

  static async getAll(): Promise<IAcquisitionSearch[]> {
    const documents = await AcquisitionSearchModel.find();

    return documents.map(mapAcquisitionSearch);
  }

  static async findLastExecutedBySearchMatrixIds(searchMatrixIds: string[]) {
    return AcquisitionSearchModel.aggregate([
      {
        $match: {
          searchMatrixId: {
            $in: searchMatrixIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: '$searchMatrixId',
          lastExecutedAt: {
            $first: '$createdAt',
          },
        },
      },
      {
        $project: {
          _id: 0,
          searchMatrixId: {
            $toString: '$_id',
          },
          lastExecutedAt: 1,
        },
      },
    ]);
  }
}
