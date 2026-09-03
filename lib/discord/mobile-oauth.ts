/**
 * Converts Discord's browser OAuth URL into the desktop/mobile client scheme.
 * The URL is produced by our API, which is also where the signed OAuth state is
 * created; this function only changes the launch target.
 */
export const toDiscordAppAuthorizationUrl = (authorizationUrl: string) => {
  const url = new URL(authorizationUrl);

  if (
    url.protocol !== "https:" ||
    url.hostname !== "discord.com" ||
    url.pathname !== "/oauth2/authorize"
  ) {
    throw new Error("Invalid Discord authorization URL.");
  }

  return `discord://-${url.pathname}${url.search}${url.hash}`;
};
