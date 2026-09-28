import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';

export interface PhoneCountryProfile {
  isoCountry: CountryCode; // e.g. "AE"
  countryCode: string; // e.g. "+971"
  minLength: number;
  maxLength: number;
  localPrefixes: string[];
  mobilePrefixes: string[];
}

/** Strips scraper dedup suffixes like "-1", "-2" bleeding into the value */
function stripDedupSuffix(raw: string): string {
  return raw.replace(/-\d{1,2}$/, '');
}

/** All-same-digit, or a strict ascending/descending run, of any length */
function isLowEntropy(digits: string): boolean {
  if (/^(\d)\1+$/.test(digits)) return true;

  let ascending = true;
  let descending = true;
  for (let i = 1; i < digits.length; i++) {
    const diff = digits.charCodeAt(i) - digits.charCodeAt(i - 1);
    if (diff !== 1) ascending = false;
    if (diff !== -1) descending = false;
  }
  return ascending || descending;
}

/** Catches epoch-millis timestamps and YYYYMMDD(+suffix) style dates */
function looksLikeDateOrTimestamp(digits: string): boolean {
  if (digits.length === 13) {
    const year = new Date(Number(digits)).getFullYear();
    if (year > 2000 && year < 2100) return true;
  }
  return /^(20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(\d{0,2})$/.test(
    digits,
  );
}

const PLACEHOLDER_NUMBERS = new Set([
  '0501234567',
  '971501234567',
  '1234567890',
  '0123456789',
]);

export function isValidPhone(
  phone: string,
  country: PhoneCountryProfile,
): boolean {
  if (!phone || typeof phone !== 'string') return false;

  const cleaned = stripDedupSuffix(phone.trim());
  const digits = cleaned.replace(/\D/g, '');

  // basic length sanity (cheap first filter)
  if (digits.length < country.minLength || digits.length > country.maxLength) {
    return false;
  }

  if (isLowEntropy(digits)) return false;
  if (looksLikeDateOrTimestamp(digits)) return false;
  if (PLACEHOLDER_NUMBERS.has(digits)) return false;

  // --- real validation against actual numbering plans ---

  // Try as a fully-qualified international number first.
  const withPlus = cleaned.startsWith('+') ? cleaned : `+${digits}`;
  const intlParsed = parsePhoneNumberFromString(withPlus);
  if (intlParsed?.isValid()) return true;

  // Fall back to local/national parsing for this specific country.
  // localPrefixes/mobilePrefixes are used as a cheap pre-filter here,
  // not as the validation itself.
  const hasKnownPrefix =
    country.localPrefixes.some((p) => digits.startsWith(p.replace(/^0/, ''))) ||
    country.mobilePrefixes.some((p) => digits.startsWith(p.replace(/^0/, '')));

  if (!hasKnownPrefix) return false;

  const localParsed = parsePhoneNumberFromString(digits, country.isoCountry);
  return localParsed?.isValid() ?? false;
}
