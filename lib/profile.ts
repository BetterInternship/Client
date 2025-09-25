import { PublicUser } from "./db/db.types";

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