import { SearchMatrixModel } from '@/modules/search-matrix/searchMatrix.model';
import { logger } from '@/shared/logger/logger';

const DEFAULT_SEARCH_MATRICES = [
  {
    name: 'Commercial Real Estate, Business Bay',
    businessCategory: 'commercial real estate agency',
    location: 'Business Bay, Dubai, UAE',
    query: 'commercial real estate agencies in Business Bay Dubai',
    priority: 100,
  },
];
export async function seedSearchMatrices() {
  const count = await SearchMatrixModel.countDocuments();

  if (count > 0) {
    logger.info('Search-matrices already seeded earlier');

    return;
  }

  await SearchMatrixModel.insertMany(DEFAULT_SEARCH_MATRICES);

  logger.info('Search-matrices seeded');
}
