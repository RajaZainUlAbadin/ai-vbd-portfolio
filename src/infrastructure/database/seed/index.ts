import { logger } from '@/shared/logger/logger';
import { seedLocations } from './locations.seed';
import { seedBusinessCategories } from './business-categories.seed';
import { connectMongo, disconnectMongo } from '../mongo';
import { seedSearchMatrices } from './search-matrix.seed';
import { seedAcquisitionProviders } from './acquisitionProvider.seed';

type SeedFunction = () => Promise<void>;

const seeders: SeedFunction[] = [
  seedSearchMatrices,
  seedLocations,
  seedBusinessCategories,
  seedAcquisitionProviders,
  // seedApplicationSettings,
  // seedRoles,
  // seedPermissions,
];

export async function runDatabaseSeeds(): Promise<void> {
  logger.info('Running database seeders...');

  for (const seed of seeders) {
    await seed();
  }

  logger.info('Database seeding completed.');
}

async function main(): Promise<void> {
  try {
    await connectMongo();

    await runDatabaseSeeds();
  } catch (error) {
    logger.error({ err: error }, 'Database seeding failed');
    process.exitCode = 1;
  } finally {
    await disconnectMongo();
  }
}

main();
