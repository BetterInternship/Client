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
