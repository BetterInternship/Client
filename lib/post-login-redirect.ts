const STORAGE_KEY = "post_login_redirect";

function isSafeInternalPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//");
}

export function savePostLoginRedirect(path: string) {
  if (!isSafeInternalPath(path)) return;
  window.sessionStorage.setItem(STORAGE_KEY, path);
}

export function getPostLoginRedirect() {
  if (typeof window === "undefined") return null;
  const path = window.sessionStorage.getItem(STORAGE_KEY);
  return path && isSafeInternalPath(path) ? path : null;
}

export function clearPostLoginRedirect() {
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function consumePostLoginRedirect(fallback = "/search") {
  const path = getPostLoginRedirect();
  clearPostLoginRedirect();
  return path || fallback;
}

export function isDiscordSetupRedirect(path: string | null) {
  return (
    path === "/discord/setup" || Boolean(path?.startsWith("/discord/setup?"))
  );
}
