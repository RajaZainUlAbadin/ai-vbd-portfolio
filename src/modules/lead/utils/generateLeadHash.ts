import crypto from 'node:crypto';

export interface LeadIdentityInput {
  businessName?: string;
  website?: string;
  phone?: string;
  address?: string;
}

function hash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function normalizeDomain(value?: string): string {
  if (!value) {
    return '';
  }

  let normalized = value.trim().toLowerCase();

  if (!normalized) {
    return '';
  }

  // Handle values such as:
  // example.com
  // www.example.com
  // https://example.com
  // http://www.example.com/path
  try {
    if (
      !normalized.startsWith('http://') &&
      !normalized.startsWith('https://')
    ) {
      normalized = `https://${normalized}`;
    }

    const url = new URL(normalized);

    let hostname = url.hostname.toLowerCase();

    // Remove www. because:
    // www.example.com === example.com
    hostname = hostname.replace(/^www\./, '');

    return hostname;
  } catch {
    // Fallback for malformed domains
    normalized = normalized
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .split('?')[0]
      .split('#')[0]
      .trim();

    return normalized;
  }
}

export function normalizePhone(value?: string): string {
  if (!value) {
    return '';
  }

  return value
    .trim()
    .replace(/[^\d+]/g, '')
    .replace(/(?!^)\+/g, '');
}

export function normalizeBusinessName(value?: string): string {
  if (!value) {
    return '';
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
}

export function normalizeAddress(value?: string): string {
  if (!value) {
    return '';
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
}

export function generateLeadDedupeHash(data: LeadIdentityInput): string {
  const domain = normalizeDomain(data.website);

  if (domain) {
    return hash(`domain:${domain}`);
  }

  const phone = normalizePhone(data.phone);

  if (phone) {
    return hash(`phone:${phone}`);
  }

  const businessName = normalizeBusinessName(data.businessName);
  const address = normalizeAddress(data.address);

  if (!businessName) {
    throw new Error(
      'Unable to generate lead dedupe hash: businessName is required',
    );
  }

  return hash(`business:${businessName}:${address}`);
}
