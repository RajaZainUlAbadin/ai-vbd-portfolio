import { simpleParser, AddressObject, Attachment } from 'mailparser';

export interface ParsedEmail {
  messageId: string | null;
  inReplyTo: string | null;
  references: string[];

  subject: string;
  text: string;
  html: string;

  from: string | null;
  to: string[];
  cc: string[];
  bcc: string[];

  date: Date | null;

  attachments: Attachment[];
}

function extractAddresses(address?: AddressObject | AddressObject[]): string[] {
  if (!address) return [];

  const addresses = Array.isArray(address)
    ? address.flatMap((a) => a.value)
    : address.value;

  return addresses.map((a) => a.address).filter((a): a is string => !!a);
}

function normalizeReferences(references?: string | string[]): string[] {
  if (!references) return [];

  if (Array.isArray(references)) {
    return references.filter((r): r is string => !!r);
  }

  return [references];
}

export class EmailParser {
  static async parse(rawEmail: string): Promise<ParsedEmail> {
    const parsed = await simpleParser(rawEmail);

    return {
      messageId: parsed.messageId ?? null,

      inReplyTo: parsed.inReplyTo ?? null,

      references: normalizeReferences(parsed.references),

      subject: parsed.subject ?? '',

      text: parsed.text ?? '',

      html: typeof parsed.html === 'string' ? parsed.html : '',

      from:
        parsed.from?.value
          .map((v) => v.address)
          .find((a): a is string => !!a) ?? null,

      to: extractAddresses(parsed.to),

      cc: extractAddresses(parsed.cc),

      bcc: extractAddresses(parsed.bcc),

      date: parsed.date ?? null,

      attachments: parsed.attachments,
    };
  }
}
