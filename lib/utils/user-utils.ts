import { Job, PublicUser } from "../db/db.types";

/**
 * Does not include the middle name.
 *
 * @param user
 * @returns
 */
export const getFullName = (
  user: Partial<PublicUser> | null | undefined
): string => {
  let name = "";
  if (!user) return name.slice(0, 32);
  if (!user.first_name && !user.last_name) return name.slice(0, 32);
  if (!user.first_name && user.last_name) name = user.last_name;
  if (user.first_name && !user.last_name) name = user.first_name;
  if (user.first_name && user.last_name)
    name = `${user.first_name ?? ""} ${user.last_name ?? ""}`;
  return name
    .replace(
      /\w\S*/g,
      (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    )
    .slice(0, 32);
};

/**
 * Gets a detailed breakdown of missing profile fields for application.
 * Returns an object with missing fields and user-friendly labels.
 */
export const getMissingProfileFields = (
  user: PublicUser | null
): {
  missing: string[];
  labels: Record<string, string>;
  canApply: boolean;
} => {
  const fieldLabels: Record<string, string> = {
    calendar_link: "Calendar Link",
    college: "College",
    degree: "Degree Program",
    department: "Department",
    email: "Email Address",
    first_name: "First Name",
    last_name: "Last Name",
    phone_number: "Phone Number",
    resume: "Resume",
    university: "University",
    year_level: "Year Level",
  };

  const not_null = (ref: any) => ref || ref === 0;
  const missing: string[] = [];

  if (!user) {
    return {
      missing: Object.keys(fieldLabels),
      labels: fieldLabels,
      canApply: false,
    };
  }

  // Check each required field
  const requiredFields = [
    "calendar_link",
    "college",
    "degree",
    "department",
    "email",
    "first_name",
    "last_name",
    "phone_number",
    "resume",
    "university",
    "year_level",
  ] as const;

  requiredFields.forEach((field) => {
    if (!not_null(user[field])) {
      missing.push(field);
    }
  });

  return {
    missing,
    labels: fieldLabels,
    canApply: missing.length === 0,
  };
};

/**
 * Returns whether or not the profile has been completed by the user.
 *
 * @param profile
 */
export const isCompleteProfile = (user: PublicUser | null): boolean => {
  const nullish = (val: any) => !(val || val === 0);
  if (!user) return false;

  if (
    !user.first_name?.trim() ||
    !user.last_name?.trim() ||
    !user.phone_number?.trim()
  )
    return false;

  if (
    nullish(user.university) ||
    nullish(user.college) ||
    nullish(user.department) ||
    nullish(user.degree) ||
    nullish(user.year_level)
  )
    return false;

  if (!user.calendar_link?.trim() || !user.resume?.trim()) return false;

  return true;
};

/**
 * Checks whether or not user quialifies for job.
 *
 * @param user
 * @param job
 */
export const profileQualifiesFor = (
  user: PublicUser | null,
  job: Job | null
): boolean => {
  if (!user) return false;
  if (!job) return false;

  if (job.require_github && !user.github_link?.trim()) return false;
  if (job.require_portfolio && !user.portfolio_link?.trim()) return false;

  return true;
};
