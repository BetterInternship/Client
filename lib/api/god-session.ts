// A god request that comes back 401 means the god session has ended (expired,
// signed out elsewhere, or the god was removed). Send the browser to the
// login page (shared with employers until the tools site), which brings it
// back to the same page afterwards. OPAQUE_SESSIONS_MIGRATION_PLAN.md §4.6.

/** The god routes. /api/auth/god/* is deliberately not one: it answers 401 on every page load. */
export const isGodApiPath = (path: string) => /^\/api\/god(\/|$)/.test(path);

export const redirectToGodLogin = () => {
  if (
    typeof window === "undefined" ||
    window.location.pathname.startsWith("/login")
  )
    return;

  const here = `${window.location.pathname}${window.location.search}`;
  const next = window.location.pathname.startsWith("/god") ? here : "/god";
  window.location.assign(`/login?next=${encodeURIComponent(next)}`);
};
