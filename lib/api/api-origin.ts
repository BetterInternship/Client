// Generated paths start with the server's global prefix (`/api/applications`),
// and NEXT_PUBLIC_API_URL already ends in `/api`. Strip that suffix once so the
// two do not join into `/api/api`.
export const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

/** Turns a generated path (`/api/jobs/1`) into the URL to fetch or navigate to. */
export const apiUrl = (path: string) =>
  /^https?:\/\//.test(path) ? path : `${API_ORIGIN}${path}`;
