import { IOutreachMessage } from '../../outreach-message/model/outreachMessage.interface';

export interface DispatchMessageInput {
  recipient: string;
  message: IOutreachMessage;
}

export interface DispatchMessageResult {
  success: boolean;
  outreachMessage: IOutreachMessage;
  provider?: string;
  providerMessageId?: string;
  error?: string;
}
