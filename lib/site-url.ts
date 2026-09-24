const baseUrl = (() => {
  const isProduction = process.env.NODE_ENV === "production";
  const fallbackBaseUrl = isProduction
    ? "https://www.betterinternship.com"
    : "https://dev.betterinternship.com";
  const rawConfiguredUrl = process.env.NEXT_PUBLIC_CLIENT_URL?.trim();
  const configuredUrl = rawConfiguredUrl
    ? /^https?:\/\//i.test(rawConfiguredUrl)
      ? rawConfiguredUrl
      : `https://${rawConfiguredUrl}`
    : undefined;

  // Prevent localhost OG/Twitter URLs so metadata always points to shareable domains.
  if (
    configuredUrl &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(configuredUrl)
  ) {
    return fallbackBaseUrl;
  }

  return configuredUrl || fallbackBaseUrl;
})().replace(/\/$/, "");

export { baseUrl };
