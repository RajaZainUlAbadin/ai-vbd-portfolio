const SERVICE_KEYWORDS = [
  'web development',
  'website development',
  'mobile app development',
  'seo',
  'search engine optimization',
  'digital marketing',
  'social media marketing',
  'branding',
  'graphic design',
  'ui ux design',
  'software development',
  'cloud services',
  'cyber security',
  'it consulting',
  'crm development',
  'erp implementation',
  'ecommerce',
  'online store',
  'logistics',
  'shipping',
  'construction',
  'real estate',
  'property management',
  'legal services',
  'accounting',
  'tax consulting',
  'medical services',
  'dental services',
];

export function detectServices(servicesPageText: string): string[] {
  if (!servicesPageText) {
    return [];
  }

  const source = servicesPageText.toLowerCase();

  const detectedKeywords = SERVICE_KEYWORDS.filter((keyword) =>
    source.includes(keyword),
  );

  const extractedServices = servicesPageText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => {
      const words = line.split(/\s+/).length;

      return words >= 2 && words <= 8 && line.length <= 80;
    });

  return [...new Set([...detectedKeywords, ...extractedServices])].slice(0, 50);
}
