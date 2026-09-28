export interface WhatsappPayload {
  to: string;
  message: string;
}

export interface WhatsappResult {
  success: boolean;
  providerMessageId?: string;
}

export interface WhatsAppProvider {
  name: string;
  sendMessage(payload: WhatsappPayload): Promise<WhatsappResult>;
}
