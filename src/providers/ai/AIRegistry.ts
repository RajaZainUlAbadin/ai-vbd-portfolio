import { AIProvider } from './base/AIProvider';

export class AIRegistry {
  private static providers = new Map<string, AIProvider>();

  static register(provider: AIProvider) {
    this.providers.set(provider.name, provider);
  }

  static get(name: string) {
    const provider = this.providers.get(name);

    if (!provider) {
      throw new Error(`AI provider not found: ${name}`);
    }

    return provider;
  }
}
