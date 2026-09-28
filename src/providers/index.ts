import { ProviderRegistry } from './lead-sources/ProviderRegistry';
import { MockProvider } from './lead-sources/mock/MockProvider';
import { ScraperRegistry } from './scrapers/ScraperRegistry';
import { PlaywrightScraperProvider } from './scrapers/playwright/PlaywrightScraperProvider';
import { AIRegistry } from './ai/AIRegistry';
import { OpenAIProvider } from './ai/openai/OpenAIProvider';
import { GoogleMapsProvider } from './lead-sources/google/GoogleMapsProvider';
import { WhatsAppRegistry } from './communication/whatsapp/WhatsAppRegistry';
import { MetaWhatsAppProvider } from './communication/whatsapp/meta/MetaWhatsAppProvider';
import { EmailRegistry } from './communication/email/EmailRegistry';
import { AwsSesProvider } from './communication/email/aws-ses/AwsSesProvider';

export const registerProviders = () => {
  ProviderRegistry.register(new MockProvider());
  ProviderRegistry.register(new GoogleMapsProvider());

  ScraperRegistry.register(new PlaywrightScraperProvider());

  AIRegistry.register(new OpenAIProvider());

  EmailRegistry.register(new AwsSesProvider());
  WhatsAppRegistry.register(new MetaWhatsAppProvider());
};
