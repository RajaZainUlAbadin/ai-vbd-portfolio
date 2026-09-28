import {
  CreateSearchMatrixDTO,
  UpdateSearchMatrixDTO,
} from './dto/createSearchMatrix.dto';
import { ISearchMatrix } from './searchMatrix.interface';
import { mapSearchMatrix } from './searchMatrix.mapper';
import { SearchMatrixModel } from './searchMatrix.model';

export class SearchMatrixRepository {
  static async create(
    data: CreateSearchMatrixDTO,
  ): Promise<ISearchMatrix | null> {
    const matrix = await SearchMatrixModel.create(data);

    return mapSearchMatrix(matrix.toObject());
  }

  static async findNext(): Promise<ISearchMatrix | null> {
    const matrix = await SearchMatrixModel.findOne({
      enabled: true,
    })
      .sort({
        priority: -1,
        lastExecutedAt: 1,
        createdAt: 1,
      })
      .lean();

    return mapSearchMatrix(matrix);
  }

  static async findById(id: string): Promise<ISearchMatrix | null> {
    const matrix = await SearchMatrixModel.findById(id).lean();

    return mapSearchMatrix(matrix);
  }

  static async update(
    id: string,
    data: UpdateSearchMatrixDTO,
  ): Promise<ISearchMatrix | null> {
    const matrix = await SearchMatrixModel.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
    }).lean();

    return mapSearchMatrix(matrix);
  }

  static async markExecuted(matrixId: string): Promise<void> {
    const matrix = await SearchMatrixModel.findByIdAndUpdate(
      matrixId,
      {
        $set: {
          lastExecutedAt: new Date(),
        },
      },
      {
        new: false,
      },
    ).lean();

    if (!matrix) {
      throw new Error(`Search matrix not found: ${matrixId}`);
    }
  }

  static async enable(
    id: string,
    enabled: boolean,
  ): Promise<ISearchMatrix | null> {
    const matrix = await SearchMatrixModel.findByIdAndUpdate(
      id,
      { $set: { enabled } },
      { new: true },
    ).lean();

    return mapSearchMatrix(matrix);
  }
}
