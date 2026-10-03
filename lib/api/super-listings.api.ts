/**
 * Routes behind the public super-listing pages (app/student/super-listing/*).
 * Both are anonymous, protected by a Cloudflare Turnstile token in the body
 * (`cf-token`), and answer with the plain `{ success, message }` envelope.
 */

import {
  superListingsControllerRegisterUnlock,
  superListingsControllerSubmitByCompany,
} from "./generated/endpoints/super-listings/super-listings";
import type {
  SuperListingSubmissionDto,
  SuperListingUnlockRegisterDto,
} from "./generated/models";

export const SuperListingService = {
  /**
   * `payload` differs per company (FFF asks for a different form from the
   * rest), so it is not narrowed to the one DTO the spec documents.
   */
  async submit(company: string, payload: Record<string, unknown>) {
    return superListingsControllerSubmitByCompany(
      company,
      payload as unknown as SuperListingSubmissionDto,
    );
  },

  async registerUnlock(
    company: string,
    payload: Pick<SuperListingUnlockRegisterDto, "email" | "cf-token">,
  ) {
    return superListingsControllerRegisterUnlock(company, payload);
  },
};
