export interface WhatsappCallbackPayload {
  type: 'message' | 'status';

  source: string;

  from?: string;

  text?: string;

  raw: any;
}
