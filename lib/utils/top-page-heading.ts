/**
 * "Top N {Name} Internships This Week" (plan D8), singular for N=1 (plan
 * defaults). Shared by the page view, its metadata and its OG image so all
 * three always agree.
 */
export function topHeading(count: number, name: string): string {
  return `Top ${count} ${name} Internship${count === 1 ? "" : "s"} This Week`;
}

/** The site's default accent when a page has no accent_hex (plan D10). */
export const DEFAULT_TOP_PAGE_ACCENT = "#2563eb";
