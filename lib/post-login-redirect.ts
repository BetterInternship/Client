/**
 * Remembers where to return after login: save a safe internal path before
 * leaving, then read and clear it after login. Defaults to /search.
 * Does not perform login, check the session, or submit job actions.
 */
const STORAGE_KEY = "post_login_redirect";

function isSafeInternalPath(path: string) {
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    [...path].some((char) => char.charCodeAt(0) <= 32)
  )
    return false;
  try {
    // The URL parser needs a full address to resolve a path like /forms.
    // This fake address is only used to check that the result stays on the
    // same site. Nothing connects to student.invalid.
    // Pls dont be confoos...
    return (
      new URL(path, "https://student.invalid").origin ===
      "https://student.invalid"
    );
  } catch {
    return false;
  }
}

export function savePostLoginRedirect(path: string) {
  if (!isSafeInternalPath(path)) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, path);
  } catch {
    /* Login still works without storage. */
  }
}

function getPostLoginRedirect() {
  if (typeof window === "undefined") return null;
  try {
    const path = window.sessionStorage.getItem(STORAGE_KEY);
    return path && isSafeInternalPath(path) ? path : null;
  } catch {
    return null;
  }
}

function clearPostLoginRedirect() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Optional storage. */
  }
}

export function consumePostLoginRedirect(fallback = "/search") {
  const path = getPostLoginRedirect();
  clearPostLoginRedirect();
  return path || fallback;
}
