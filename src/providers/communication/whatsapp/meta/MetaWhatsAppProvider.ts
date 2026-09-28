import axios from 'axios';
import {
  WhatsAppProvider,
  WhatsappPayload,
  WhatsappResult,
} from '../base/WhatsAppProvider';
import { env } from '@/app/config/env';

export class MetaWhatsAppProvider implements WhatsAppProvider {
  private token = env.WHATSAPP_ACCESS_TOKEN!;
  private version = env.WHATSAPP_API_VERSION || 'v21.0';
  private phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID!;

  name = 'meta';
  async sendMessage({ to, message }: WhatsappPayload): Promise<WhatsappResult> {
    const url = `https://graph.facebook.com/${this.version}/${this.phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    };

    const res = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    const providerMessageId = res.data.messages?.[0]?.id;
    return { success: true, providerMessageId };
  }
}
