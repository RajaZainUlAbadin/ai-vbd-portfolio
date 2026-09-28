import { EmailProvider } from "./base/EmailProvider";

export class EmailRegistry {
  private static providers = new Map<string, EmailProvider>();

  static register(provider: EmailProvider) {
    this.providers.set(provider.name, provider);
  }

  static get(name: string): EmailProvider {
    const provider = this.providers.get(name);

    if (!provider) {
      throw new Error(`Email provider not found: ${name}`);
    }

    return provider;
  }
}
