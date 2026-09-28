import { WhatsAppProvider } from './base/WhatsAppProvider';

export class WhatsAppRegistry {
  private static providers = new Map<string, WhatsAppProvider>();

  static register(provider: WhatsAppProvider) {
    this.providers.set(provider.name, provider);
  }

  static get(name: string): WhatsAppProvider {
    const provider = this.providers.get(name);

    if (!provider) {
      throw new Error(`WhatsApp provider not found: ${name}`);
    }

    return provider;
  }
}
