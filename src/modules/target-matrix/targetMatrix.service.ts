import { BusinessCategoryRepository } from '../search-matrix/business-category/businessCategory.repository';
import { SearchMatrixRepository } from '../search-matrix/searchMatrix.repository';

export class TargetMatrixService {
  static async create(data: any) {
    return SearchMatrixRepository.create({
      ...data,
      enabled: true,
      priority: data.priority ?? 1,
    });
  }

  static async getNextMatrix() {
    return SearchMatrixRepository.findNext();
  }
}
