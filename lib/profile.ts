import { PublicUser } from "./db/db.types";

/**
 * Does not include the middle name.
 *
 * @param user
 * @returns
 */
export const getFullName = (
  user: Partial<PublicUser> | null | undefined,
  titleCase: boolean = true
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
      (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
  }

  return name;
};

export const isProfileBaseComplete = (profile?: PublicUser | null) => {
	if (!profile) return false;
	return (
		profile.first_name?.trim() &&
		profile.last_name?.trim() && 
		profile.university?.trim() && 
		profile.phone_number?.trim() && 
		profile.degree?.trim()
	)
}

export const isProfileVerified = (profile?: PublicUser | null) => {
	if (!profile) return false;
	return profile.edu_verification_email?.trim() && profile.is_verified
}

export const isProfileResume = (profile?: PublicUser | null) => {
	if (!profile) return false;
	return !!profile.resume?.trim();
}