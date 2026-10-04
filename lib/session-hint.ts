/**
 * A browser-side hint that a student session probably exists
 * (Docs/plans/TOP_PAGES_STATIC_GENERATION_PLAN.md D10).
 *
 * The session cookie belongs to the API's domain, so the student site cannot
 * read it. Top pages are cached static pages that most visitors see logged
 * out, and asking the API "who am I?" on every such view costs a request that
 * can only come back 401. This flag lets those routes skip the question for
 * visitors who have never been signed in on this browser.
 *
 * It is a hint, not proof: set when a profile request succeeds anywhere on the
 * student site, cleared on logout or when a profile request fails. A stale
 * hint costs one failed request, which clears it.
 */

const STORAGE_KEY = "bi_session_hint";
const CHANGE_EVENT = "bi:session-hint";

export function readSessionHint(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeSessionHint(present: boolean) {
  if (typeof window === "undefined") return;
  if (readSessionHint() === present) return;
  try {
    if (present) window.localStorage.setItem(STORAGE_KEY, "1");
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export const setSessionHint = () => writeSessionHint(true);
export const clearSessionHint = () => writeSessionHint(false);

/** Subscribes to hint changes from this tab and from other tabs. */
export function subscribeSessionHint(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
