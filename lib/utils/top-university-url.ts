/**
 * A university's Top pages live at /<url name>/… on the student site, where
 * the URL name is built from the university's full name
 * (Docs/plans/TOP_PAGES_UNIVERSITY_PLAN.md D2). That makes it the FIRST path
 * segment, so it shares a namespace with everything else the student site
 * serves there. The server can tell when two universities produce the same
 * URL name; only the Client knows its own routes, so that check lives here.
 */

// Folders directly under app/student — a real route always wins over the
// dynamic [university] segment, so a university with one of these URL names
// could never be reached. Keep in step with app/student/.
const STUDENT_ROUTES = new Set([
  "applications",
  "challenges",
  "companies",
  "discord",
  "forms",
  "l",
  "privacy",
  "profile",
  "register",
  "saved",
  "search",
  "super-listing",
  "terms",
]);

// next.config.mjs's host rewrite skips every path that STARTS WITH one of
// these (it is a prefix match with no boundary), so such a path never
// reaches app/student at all. Only the entries a lowercase, hyphenated URL
// name could begin with are listed. Keep in step with next.config.mjs.
const UNROUTED_PREFIXES = [
  "fonts",
  "og",
  "resume-loader",
  "maintenance",
  "student-preview",
  "hire-preview",
  "miro-preview",
  "super-listings",
];

/**
 * Why a university's URL name can't be used on the student site, or null if
 * it can. Shown in the god university grid, which locks such a row.
 */
export function topUniversityUrlProblem(slug: string): string | null {
  if (!slug) return "Its name gives no web address.";
  if (STUDENT_ROUTES.has(slug)) {
    return `"/${slug}" is already a page on the student site.`;
  }
  const prefix = UNROUTED_PREFIXES.find((entry) => slug.startsWith(entry));
  if (prefix) {
    return `Addresses starting with "${prefix}" are reserved by the site.`;
  }
  return null;
}
