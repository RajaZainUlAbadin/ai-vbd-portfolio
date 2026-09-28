export interface BusinessSignals {
  hasWhatsapp: boolean;
  hasLiveChat: boolean;
  hasBookingSystem: boolean;
  hasEcommerce: boolean;

  hasAnalytics: boolean;
  hasMetaPixel: boolean;
  hasGoogleMapsEmbed: boolean;
  hasNewsletter: boolean;
}

export function detectBusinessSignals(
  html: string = '',
  links: string[] = [],
  visibleText: string = '',
): BusinessSignals {
  const h = html.toLowerCase();
  const t = visibleText.toLowerCase();
  const l = links.map((x) => x.toLowerCase());

  const hasWhatsapp =
    l.some((x) => x.includes('wa.me') || x.includes('whatsapp')) ||
    h.includes('whatsapp');

  const hasLiveChat = [
    'tawk',
    'intercom',
    'zendesk',
    'crisp',
    'drift',
    'livechat',
  ].some((x) => h.includes(x));

  const hasBookingSystem =
    ['calendly', 'acuity', 'setmore', 'booksy', 'simplybook'].some((x) =>
      h.includes(x),
    ) ||
    t.includes('book appointment') ||
    t.includes('schedule a call');

  const hasEcommerce =
    (h.includes('checkout') && h.includes('cart')) ||
    h.includes('woocommerce') ||
    h.includes('shopify');

  const hasAnalytics = h.includes('gtag') || h.includes('google-analytics');

  const hasMetaPixel = h.includes('fbq(');

  const hasGoogleMapsEmbed =
    h.includes('google.com/maps') || h.includes('maps/embed');

  const hasNewsletter = t.includes('subscribe') || t.includes('newsletter');

  return {
    hasWhatsapp,
    hasLiveChat,
    hasBookingSystem,
    hasEcommerce,
    hasAnalytics,
    hasMetaPixel,
    hasGoogleMapsEmbed,
    hasNewsletter,
  };
}
