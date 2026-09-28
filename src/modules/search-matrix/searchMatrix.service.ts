import { CreateSearchMatrixDTO } from './dto/createSearchMatrix.dto';
import { ISearchMatrix } from './searchMatrix.interface';
import { SearchMatrixRepository } from './searchMatrix.repository';
import { BusinessCategoryRepository } from './business-category/businessCategory.repository';
import { LocationRepository } from './location/location.repository';
import { Types } from 'mongoose';
import { mapSearchMatrix } from './searchMatrix.mapper';
import { AcquisitionSearchRepository } from '../acquisition/acquisition-search/acquisitionSearch.repository';
import { logger } from '@/shared/logger/logger';

export class SearchMatrixService {
  static async create(data: CreateSearchMatrixDTO) {
    return SearchMatrixRepository.create({
      ...data,
      businessCategoryId: data.businessCategoryId,
      locationId: data.locationId,
    });
  }

  static async update(id: string, data: Partial<ISearchMatrix>) {
    return SearchMatrixRepository.update(id, data);
  }

  static async changeStatus(id: string) {
    const matrix = await SearchMatrixRepository.findById(id);

    if (!matrix) {
      return null;
    }

    return SearchMatrixRepository.update(id, {
      enabled: !matrix.enabled,
    });
  }

  static async getNextSearchMatrix(): Promise<ISearchMatrix | null> {
    try {
      return await SearchMatrixRepository.findNext();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error(
        {
          module: 'search-matrix',
          event: 'search.matrix.next.failed',
          error: err,
          stack: err.stack,
        },
        'Failed to get next search matrix',
      );

      throw err;
    }
  }

  static async markExecuted(matrixId: string): Promise<void> {
    return SearchMatrixRepository.markExecuted(matrixId);
  }
}
