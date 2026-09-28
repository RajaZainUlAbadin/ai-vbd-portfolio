import { BusinessCategoryModel } from '@/modules/search-matrix/business-category/businessCategory.model';
import { logger } from '@/shared/logger/logger';

const DEFAULT_BUSINESS_CATEGORIES = [
  {
    name: 'business setup consultant',
    targetAudience: ['Founder / Business Owner'],
    priority: 10,
  },
];

export async function seedBusinessCategories() {
  const count = await BusinessCategoryModel.countDocuments();

  if (count > 0) {
    logger.info('Business categories already seeded earlier');
    return;
  }

  await BusinessCategoryModel.insertMany(DEFAULT_BUSINESS_CATEGORIES);

  logger.info('Business categories seeded');
}
