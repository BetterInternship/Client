import type { PublicUser, University } from "./db/db.types";

const NO_UNIVERSITY_ID = "00000000-0000-0000-0000-000000000000";

export const isNoUniversity = (universityId?: string | null) => {
  return universityId === NO_UNIVERSITY_ID;
};

export const hasFormsEnabledUniversity = (profile?: PublicUser | null) => {
  return !isNoUniversity(profile?.university);
};

/**
 * Sorts them, with "Not a Uni Student" first, then alphabetical after.
 *
 * @param universities
 * @returns
 */
export const sortUniversityOptions = (universities: University[]) => {
  return universities
    .toSorted((a, b) => a.name.localeCompare(b.name))
    .toSorted((a, b) => {
      if (isNoUniversity(a.id)) return -1;
      if (isNoUniversity(b.id)) return 1;
      return 0;
    });
};

const ACRONYM_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "for",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
  "&",
]);

/**
 * Generates candidate search acronyms for a university name so that queries
 * like "dlsu" can match "De La Salle University".
 *
 * Returns two variants:
 * - strict: initials of capitalized words only ("Ateneo de Manila University" -> "amu")
 * - loose: also includes meaningful lowercase connectors like "de" ("admu")
 *
 * @param name The university name.
 * @returns Unique, lowercased acronym candidates (may be empty).
 */
export const universityAcronyms = (name: string): string[] => {
  const parts = name.split(/[\s-]+/).filter((p) => p.length > 0);
  const strict = parts
    .filter((p) => p[0] === p[0].toUpperCase())
    .map((p) => p[0].toUpperCase())
    .join("");
  const loose = parts
    .filter((p) => {
      const first = p[0];
      if (first === first.toUpperCase()) return true;
      return !ACRONYM_STOPWORDS.has(p.toLowerCase());
    })
    .map((p) => p[0].toUpperCase())
    .join("");
  return Array.from(
    new Set([strict, loose].filter(Boolean).map((a) => a.toLowerCase())),
  );
};
