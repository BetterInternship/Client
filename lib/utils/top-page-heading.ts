/**
 * "Top N {Name} Internships This Week" (plan D8), singular for N=1 (plan
 * defaults). Shared by the page's OG image and the god tools so they agree
 * with the page's own heading.
 */
export function topHeading(count: number, name: string): string {
  return `Top ${count} ${name} Internship${count === 1 ? "" : "s"} This Week`;
}

/**
 * The second line of a Top page's heading, naming the university whose link
 * this is (Docs/plans/TOP_PAGES_UNIVERSITY_PLAN.md D11).
 */
export function topUniversityLine(universityName: string): string {
  return `${TOP_UNIVERSITY_LINE.before}${universityName}${TOP_UNIVERSITY_LINE.after}`;
}

/**
 * The words around the name in that line, for where the name is styled on
 * its own (the page's heading colours it). `topUniversityLine` is built from
 * these, so the wording lives in one place.
 */
export const TOP_UNIVERSITY_LINE = {
  before: "for ",
  after: " students",
} as const;

/**
 * The browser / search-result title of a university's category page (D11):
 * "Top 5 Data Science Internships for De La Salle University - Manila
 * Students".
 */
export function topUniversityPageTitle(
  count: number,
  pageName: string,
  universityName: string,
): string {
  return `Top ${count} ${pageName} Internship${
    count === 1 ? "" : "s"
  } for ${universityName} Students`;
}

/** The heading and title of a university's landing page (D12). */
export function topUniversityHeading(universityName: string): string {
  return `Internships for ${universityName} students`;
}

/** The site's default accent when a university has no colour set. */
export const DEFAULT_TOP_PAGE_ACCENT = "#2563eb";
