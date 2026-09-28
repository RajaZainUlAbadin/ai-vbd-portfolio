import { LocationModel } from '@/modules/search-matrix/location/location.model';
import { logger } from '@/shared/logger/logger';

const DEFAULT_LOCATIONS = [
  {
    city: 'Dubai',
    area: 'Downtown Dubai',
    country: 'UAE',
    priority: 10,
  },
];

export async function seedLocations() {
  const count = await LocationModel.countDocuments();

  if (count > 0) {
    logger.info('Locations already seeded earlier');

    return;
  }

  await LocationModel.insertMany(DEFAULT_LOCATIONS);

  logger.info('Locations seeded');
}
