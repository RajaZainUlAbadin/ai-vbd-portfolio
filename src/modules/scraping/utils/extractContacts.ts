import { ContactPhone, PhoneSource } from '../model/scrapeResult.model';
import { isValidPhone, PhoneCountryProfile } from './isValidPhone';

export const UAE_PHONE_PROFILE: PhoneCountryProfile = {
  isoCountry: 'AE',
  countryCode: '+971',
  minLength: 9,
  maxLength: 12,
  localPrefixes: ['05'],
  mobilePrefixes: ['050', '052', '054', '055', '056', '058'],
};

export interface ContactExtractionInput {
  html: string;
  home: string;
  about: string;
  contact: string;
  services: string;
  links: string[] | [];
}

export interface ContactExtractionResult {
  emails: string[];
  phones: ContactPhone[];
}

/* ----------------------------
   MAIN FUNCTION
-----------------------------*/

export function extractContacts(
  input: ContactExtractionInput,
  country: PhoneCountryProfile = UAE_PHONE_PROFILE,
): ContactExtractionResult {
  const emails = new Set<string>();
  const phones = new Map<string, ContactPhone>();

  const sources = buildSources(input);

  extractEmails(sources, emails);

  extractTelLinks(input.links, phones, country);
  extractJsonLdPhones(sources, phones, country);
  extractWhatsappLinks(input.links, phones, country);
  // extractContextualPhones(sources, phones, country);
  // extractRegexFallbackPhones(sources, phones, country);

  return {
    emails: [...emails],
    phones: rankPhones([...phones.values()]),
  };
}

function buildSources(input: ContactExtractionInput): string[] {
  return [
    input.html,
    input.home,
    input.about,
    input.contact,
    input.services,
  ].filter(Boolean);
}

/* ----------------------------
   EMAIL EXTRACTION
-----------------------------*/

function extractEmails(sources: string[], emails: Set<string>) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  for (const text of sources) {
    const matches = text.match(emailRegex) || [];
    matches.forEach((e) => emails.add(e.toLowerCase()));
  }
}

/* ----------------------------
   TEL LINKS (HIGHEST CONFIDENCE)
-----------------------------*/

function extractTelLinks(
  links: string[],
  phones: Map<string, ContactPhone>,
  country: PhoneCountryProfile,
) {
  for (const link of links || []) {
    const lower = link.toLowerCase();

    if (!lower.startsWith('tel:')) continue;

    const raw = normalizePhone(lower.replace('tel:', ''), country);
    if (!isValidPhone(raw, country)) continue;

    upsertPhone(phones, {
      number: raw,
      confidence: 100,
      source: PhoneSource.TEL,
    });
  }
}

/* ----------------------------
   WHATSAPP LINKS (VERY HIGH CONFIDENCE FOR OUTREACH)
   wa.me/971501234567 or api.whatsapp.com/send?phone=971501234567
   These are worth as much as tel: links for your use case — a working
   WhatsApp link is a live, monitored number, which is exactly what you
   want for outreach conversions.
-----------------------------*/

function extractWhatsappLinks(
  links: string[],
  phones: Map<string, ContactPhone>,
  country: PhoneCountryProfile,
) {
  for (const link of links || []) {
    const lower = link.toLowerCase();

    const waMeMatch = lower.match(/wa\.me\/(\d+)/);
    const apiMatch = lower.match(/[?&]phone=(\d+)/);
    const digitsFound = waMeMatch?.[1] || apiMatch?.[1];

    if (!digitsFound) continue;

    const raw = normalizePhone(digitsFound, country);
    if (!isValidPhone(raw, country)) continue;

    upsertPhone(phones, {
      number: raw,
      confidence: 95,
      source: PhoneSource.TEL, // treat as tel-equivalent; swap for a
      // dedicated PhoneSource.WHATSAPP if you want to track the channel
      // separately for outreach sequencing
    });
  }
}

/* ----------------------------
   JSON-LD EXTRACTION
-----------------------------*/

function extractJsonLdPhones(
  sources: string[],
  phones: Map<string, ContactPhone>,
  country: PhoneCountryProfile,
) {
  const jsonLdRegex = /"telephone"\s*:\s*"([^"]+)"/g;

  for (const text of sources) {
    const matches = [...text.matchAll(jsonLdRegex)];

    for (const m of matches) {
      const raw = normalizePhone(m[1], country);

      if (!isValidPhone(raw, country)) continue;

      upsertPhone(phones, {
        number: raw,
        confidence: 95,
        source: PhoneSource.JSONLD,
      });
    }
  }
}

/* ----------------------------
   CONTEXTUAL EXTRACTION (VERY IMPORTANT)
-----------------------------*/

function extractContextualPhones(
  sources: string[],
  phones: Map<string, ContactPhone>,
  country: PhoneCountryProfile,
) {
  const contextualRegex =
    /(phone|tel|telephone|mobile|call|whatsapp|reservation|reservations)[:\s]*([+]?\d[\d\s().-]{7,}\d)/gi;

  for (const text of sources) {
    const matches = [...text.matchAll(contextualRegex)];

    for (const m of matches) {
      const raw = normalizePhone(m[2], country);

      if (!isValidPhone(raw, country)) continue;

      upsertPhone(phones, {
        number: raw,
        confidence: 85,
        source: PhoneSource.CONTEXT,
      });
    }
  }
}

/* ----------------------------
   NORMALIZATION (COUNTRY AWARE)
-----------------------------*/

function normalizePhone(raw: string, country: PhoneCountryProfile): string {
  let digits = raw.replace(/[^\d+]/g, '');

  // collapse multiple '+' down to a single leading one
  digits = '+' + digits.replace(/\+/g, '');
  if (digits === '+') digits = '';

  // remove 00 international prefix
  if (digits.startsWith('+00')) {
    digits = '+' + digits.slice(3);
  }

  // UAE handling (key improvement)
  if (country.isoCountry === 'AE') {
    // strip the leading '+' back off for the pattern checks below —
    // they're written against bare digit strings
    let bare = digits.replace(/^\+/, '');

    // 05XXXXXXXX → +9715XXXXXXXX
    if (bare.startsWith('05')) {
      return '+971' + bare.slice(1);
    }

    // 5XXXXXXXX (missing leading 0)
    if (/^5\d{8}$/.test(bare)) {
      return '+971' + bare;
    }

    // 971... or +971... → normalize to +971...
    if (bare.startsWith('971')) {
      return '+' + bare;
    }

    // Uncertain shape for a UAE profile: do NOT blindly prepend '+'.
    // Doing so can accidentally collide with a real foreign calling
    // code (+50x, +52, +54, +55, +56, +58 all overlap with '05x' once
    // the leading 0 is stripped) and get validated as a completely
    // different country's number. Return bare digits instead — the
    // prefix + local-parse check in isValidPhone will correctly
    // reject this rather than false-matching against another country.
    return bare;
  }

  return digits || raw.replace(/\D/g, '');
}

/* ----------------------------
   UPSERT + CONFIDENCE MERGE
-----------------------------*/

function upsertPhone(
  phones: Map<string, ContactPhone>,
  newPhone: ContactPhone,
) {
  const existing = phones.get(newPhone.number);

  if (!existing) {
    phones.set(newPhone.number, newPhone);
    return;
  }

  phones.set(newPhone.number, {
    number: newPhone.number,
    confidence: Math.max(existing.confidence, newPhone.confidence),
    source:
      existing.source === PhoneSource.TEL ? PhoneSource.TEL : newPhone.source,
  });
}

/* ----------------------------
   FINAL SORTING
-----------------------------*/

function rankPhones(phones: ContactPhone[]): ContactPhone[] {
  return phones.sort((a, b) => {
    // prioritize TEL > JSONLD > CONTEXT > REGEX
    const score = (p: ContactPhone) => {
      const sourceBoost =
        p.source === PhoneSource.TEL
          ? 40
          : p.source === PhoneSource.JSONLD
            ? 30
            : p.source === PhoneSource.CONTEXT
              ? 20
              : 10;

      return p.confidence + sourceBoost;
    };

    return score(b) - score(a);
  });
}
