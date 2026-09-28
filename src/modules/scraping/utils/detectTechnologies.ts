export const detectTechnologies = (
  html: string,
  scripts: string[] = [],
): string[] => {
  const source = (html + ' ' + scripts.join(' ')).toLowerCase();

  const tech = new Set<string>();

  // CMS
  if (source.includes('wp-content')) tech.add('WordPress');
  if (source.includes('woocommerce')) tech.add('WooCommerce');
  if (source.includes('shopify')) tech.add('Shopify');
  if (source.includes('elementor')) tech.add('Elementor');

  // Frameworks (more precise)
  if (source.includes('_next/static')) tech.add('Next.js');

  if (
    source.includes('react') &&
    (source.includes('reactdom') || source.includes('data-reactroot'))
  ) {
    tech.add('React');
  }

  if (source.includes('ng-version')) tech.add('Angular');
  if (source.includes('vue')) tech.add('Vue.js');

  // Builders
  if (source.includes('webflow')) tech.add('Webflow');
  if (source.includes('wix')) tech.add('Wix');
  if (source.includes('squarespace')) tech.add('Squarespace');

  // Analytics
  if (source.includes('gtag') || source.includes('google-analytics'))
    tech.add('Google Analytics');

  if (source.includes('fbq(')) tech.add('Meta Pixel');

  // Infra
  if (source.includes('cloudflare')) tech.add('Cloudflare');

  return Array.from(tech);
};
