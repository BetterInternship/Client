/**
 * The one place that turns generated route builders into URLs a browser
 * navigates to or loads as `src` (OAuth redirects, files). Nothing outside
 * `lib/api` writes `${NEXT_PUBLIC_API_URL}/...` by hand.
 */

import { apiUrl } from "./api-origin";
import {
  getAuthControllerGoogleOAuthUrl,
  getAuthControllerHandleSecureLinkUrl,
} from "./generated/endpoints/auth/auth";
import { getDiscordIntegrationControllerStartOAuthUrl } from "./generated/endpoints/discord-integration/discord-integration";
import { getEmployersControllerFindLogoUrl } from "./generated/endpoints/employer/employer";
import {
  getUsersControllerMyResumeUrl,
  getUsersControllerPfpByIdUrl,
  getUsersControllerResumeByIdUrl,
} from "./generated/endpoints/users/users";

export { apiUrl };

/** Where "Sign in with Google" sends the browser. */
export const googleLoginUrl = () => apiUrl(getAuthControllerGoogleOAuthUrl());

/** Where Discord's OAuth flow starts; `jobId` is dropped when empty. */
export const discordOAuthStartUrl = (jobId?: string) =>
  apiUrl(
    getDiscordIntegrationControllerStartOAuthUrl({
      job_id: jobId || undefined,
    }),
  );

/** The employer magic link, forwarded to Career-Server with the query intact. */
export const secureAccessUrl = (employerUserId: string, hash: string) =>
  apiUrl(
    getAuthControllerHandleSecureLinkUrl(
      encodeURIComponent(employerUserId),
      encodeURIComponent(hash),
    ),
  );

/**
 * URLs of files Career-Server streams, for `<img src>` and `<iframe src>`.
 * `hash` is the file's cache key from the matching `/pic` or `/url` call.
 */
export const fileUrls = {
  myResume: (hash: string, resumeId: string) =>
    apiUrl(getUsersControllerMyResumeUrl(resumeId, { hash })),
  userResume: (hash: string, userId: string, resumeId: string) =>
    apiUrl(getUsersControllerResumeByIdUrl(userId, resumeId, { hash })),
  userPfp: (hash: string, userId: string) =>
    apiUrl(getUsersControllerPfpByIdUrl(userId, { hash })),
  employerLogo: (hash: string, employerId: string) =>
    apiUrl(getEmployersControllerFindLogoUrl(employerId, { hash })),
};
