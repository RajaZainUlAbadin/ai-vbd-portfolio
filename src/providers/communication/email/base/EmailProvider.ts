export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  providerMessageId?: string;
}

export interface EmailProvider {
  name: string;
  sendEmail(input: EmailPayload): Promise<EmailResult>;
  // healthCheck(): Promise<boolean>;
}
