const CTA_PATTERNS = [
  'contact us',
  'get started',
  'book consultation',
  'book demo',
  'book now',
  'request quote',
  'request a quote',
  'schedule call',
  'schedule consultation',
  'talk to us',
  'speak with us',
  'call now',
  'learn more',
  'start now',
  'sign up',
  'join now',
  'free trial',
];

export function detectCTAs(text: string): string[] {
  const lower = text.toLowerCase();

  const found = CTA_PATTERNS.filter((cta) => lower.includes(cta));

  return [...new Set(found)];
}
