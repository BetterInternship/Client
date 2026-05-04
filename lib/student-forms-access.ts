import type { PublicUser } from "./db/db.types";

export const NO_UNIVERSITY_ID = "00000000-0000-0000-0000-000000000000";

export const hasFormsEnabledUniversity = (profile?: PublicUser | null) => {
  return profile?.university !== NO_UNIVERSITY_ID;
};
