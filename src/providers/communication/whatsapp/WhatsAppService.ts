import { WhatsappPayload, WhatsappResult } from './base/WhatsAppProvider';
import { WhatsAppRegistry } from './WhatsAppRegistry';

export class WhatsAppService {
  static async send(payload: WhatsappPayload): Promise<
    WhatsappResult & {
      provider: string;
    }
  > {
    const provider = WhatsAppRegistry.get('meta');

    const result = await provider.sendMessage(payload);

    return {
      ...result,
      provider: 'meta',
    };
  }
}
