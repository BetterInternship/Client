import { Job, PublicUser } from "./db/db.types";

/**
 * Does not include the middle name.
 * For rendering purposes only.
 *
 * @param user
 * @returns
 */
export const getFullName = <
  T extends { first_name?: string | null; last_name?: string | null },
>(
  user?: T,
  titleCase: boolean = true,
): string => {
  let name = "";
  if (!user) return name.slice(0, 32);
  if (!user.first_name && !user.last_name) return name.slice(0, 32);
  if (!user.first_name && user.last_name) name = user.last_name;
  if (user.first_name && !user.last_name) name = user.first_name;
  if (user.first_name && user.last_name)
    name = `${user.first_name ?? ""} ${user.last_name ?? ""}`;
  name = name.slice(0, 32);

  // Change the case of the name
  if (titleCase) {
    name = name.replace(
      /\w\S*/g,
      (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
    );
  }

  return name;
};

/**
 * Checks most important fields of profile, EXCLUDING resume.
 *
 * @param profile
 * @returns
 */
export const isProfileBaseComplete = (profile?: PublicUser | null) => {
  if (!profile) return false;
  return (
    profile.first_name?.trim() &&
    profile.last_name?.trim() &&
    profile.university?.trim()
  );
};

/**
 * Checks if verified.
 *
 * @param profile
 * @returns
 */
export const isProfileVerified = (profile?: PublicUser | null) => {
  if (!profile) return false;
  return profile.edu_verification_email?.trim() && profile.is_verified;
};

/**
 * Use this in the future, maybe we shud require it again to apply
 *
 * @param profile
 * @returns
 */
export const isProfileApplyReady = (profile?: PublicUser | null) => {
  if (!profile) return false;

  const preferences = profile.internship_preferences;
  return !!preferences?.internship_type && !!preferences?.expected_start_date;
};

/**
 * Checks whether a user's profile satisfies a listing's requirements.
 * Returns `eligible: true` when every requirement is met, otherwise returns
 * the list of human-readable strings describing what's missing.
 */
export const isProfileEligibleForListing = (
  profile: PublicUser | null | undefined,
  job: Pick<Job, "internship_preferences">,
): { eligible: boolean; missing: string[] } => {
  const missing: string[] = [];
  const prefs = job.internship_preferences;
  if (!prefs) return { eligible: true, missing };

  if (prefs.require_github && !profile?.github_link?.trim()) {
    missing.push("GitHub profile link");
  }
  if (prefs.require_portfolio && !profile?.portfolio_link?.trim()) {
    missing.push("Portfolio link");
  }

  return { eligible: missing.length === 0, missing };
};
