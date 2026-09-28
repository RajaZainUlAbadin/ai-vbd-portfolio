export const classifyScrapeError = (error: Error) => {
  const message = error.message.toLowerCase();

  if (message.includes('timeout')) {
    return 'TIMEOUT';
  }

  if (message.includes('net::err_name_not_resolved')) {
    return 'DNS_FAILURE';
  }

  if (message.includes('ssl')) {
    return 'SSL_FAILURE';
  }

  if (message.includes('captcha') || message.includes('blocked')) {
    return 'ANTI_BOT';
  }

  return 'UNKNOWN';
};
