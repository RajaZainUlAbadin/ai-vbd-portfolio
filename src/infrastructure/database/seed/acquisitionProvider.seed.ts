import { AcquisitionProviderRepository } from '@/modules/acquisition/acquisition-provider/acquisition-provider.repository';
import { LeadProvider } from '@/shared/constants/system-providers';
import { logger } from '@/shared/logger/logger';

const providers = ['Online'];
export async function seedAcquisitionProviders() {
  for (const provider of providers) {
    await AcquisitionProviderRepository.upsert(provider);
  }

  logger.info('Acquisition providers seeded');
}
