import { ScrapeStatus } from '../model/scrape.status';

export interface ScrapeDetectionInput {
  responseStatus?: number;
  finalUrl?: string;

  title: string;
  html: string;
  visibleText: string;

  loadError?: Error;

  forms: number;
  h1Count: number;
}

export function detectScrapeStatus(input: ScrapeDetectionInput): ScrapeStatus {
  const {
    responseStatus,
    title,
    html,
    visibleText,
    loadError,
    forms,
    h1Count,
  } = input;

  // Navigation failures
  if (loadError) {
    const message = loadError.message.toLowerCase();

    if (message.includes('timeout')) {
      return ScrapeStatus.TIMEOUT;
    }

    if (
      message.includes('dns') ||
      message.includes('name not resolved') ||
      message.includes('err_name_not_resolved')
    ) {
      return ScrapeStatus.DNS_ERROR;
    }

    return ScrapeStatus.FAILED;
  }

  // HTTP failures

  if (responseStatus === 401) {
    return ScrapeStatus.LOGIN_REQUIRED;
  }

  if (responseStatus === 403) {
    return ScrapeStatus.ACCESS_DENIED;
  }

  if (responseStatus === 404) {
    return ScrapeStatus.FAILED;
  }

  // Successful business page?
  // If we extracted meaningful content, trust that over challenge keywords.

  const hasGoodContent =
    visibleText.trim().length > 500 || h1Count > 0 || forms > 0;

  if (hasGoodContent) {
    return ScrapeStatus.SUCCESS;
  }

  // Only now inspect challenge pages

  const text = `${title} ${visibleText} ${html}`.toLowerCase();

  if (
    text.includes('just a moment') ||
    text.includes('checking your browser') ||
    text.includes('cf-browser-verification') ||
    text.includes('challenge-platform')
  ) {
    return ScrapeStatus.CLOUDFLARE;
  }

  if (text.includes('captcha')) {
    return ScrapeStatus.CAPTCHA;
  }

  if (!visibleText.trim()) {
    return ScrapeStatus.EMPTY;
  }

  return ScrapeStatus.PARTIAL;
}
