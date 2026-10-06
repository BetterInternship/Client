/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-22 19:43:25
 * @ Modified time: 2025-10-19 07:02:48
 * @ Description:
 *
 * Routes used by employers
 */

import { FetchResponse } from "@/lib/api/use-fetch";
import { Employer, EmployerSelf } from "../db/db.types";
import { careerFetch } from "./career-fetch";
import {
  authControllerActivateHireAccount,
  authControllerEmployerLoggedIn,
  authControllerEmployerSignOut,
  authControllerRequestHireActivation,
  authControllerRequestHireLoginOtp,
  authControllerVerifyHireLoginOtp,
  getAuthControllerEmployerRegisterUrl,
} from "./generated/endpoints/auth/auth";
import {
  godsControllerSignInAs,
  godsControllerExitProxy,
  godsControllerVerifyEmployer,
  godsControllerUnverifyEmployer,
  godsControllerGenerateMagicLink,
} from "./generated/endpoints/gods/gods";

interface EmployerResponse extends FetchResponse {
  success: boolean;
  employer: Employer;
}

// god is merged onto the user object itself (auth.service.ts's toFullSelf),
// not a sibling field — /hire/login and /hire/loggedin are the only two
// routes that carry it; /employer-users/me does not.
export interface AuthResponse extends FetchResponse {
  success: boolean;
  user?: Partial<EmployerSelf> & { god?: boolean };
  pending_verification?: boolean;
  account_exists?: boolean;
  login_url?: string;
}

export const EmployerAuthService = {
  // The caller builds its own FormData, so this skips the generated wrapper
  // (which would assemble a fresh one field by field) and sends it as given.
  async register(employer: Partial<Employer> | FormData) {
    return careerFetch<AuthResponse>(getAuthControllerEmployerRegisterUrl(), {
      method: "POST",
      body: employer as FormData,
    });
  },

  async requestLoginOtp(email: string) {
    return authControllerRequestHireLoginOtp({
      email,
    }) as unknown as Promise<AuthResponse>;
  },

  async verifyLoginOtp(email: string, otp: string) {
    return authControllerVerifyHireLoginOtp({
      email,
      otp,
    }) as unknown as Promise<AuthResponse>;
  },

  async requestActivation(email: string) {
    return authControllerRequestHireActivation({
      email,
    }) as unknown as Promise<AuthResponse>;
  },

  async activate(email: string, otp: string) {
    return authControllerActivateHireAccount({
      email,
      otp,
    }) as unknown as Promise<AuthResponse>;
  },

  async loginAsEmployer(employer_id: string) {
    return godsControllerSignInAs(employer_id) as unknown as Promise<AuthResponse>;
  },

  // Undoes loginAsEmployer — restores the acting god's own account.
  async exitProxy() {
    return godsControllerExitProxy() as unknown as Promise<AuthResponse>;
  },

  async logout() {
    await authControllerEmployerSignOut();
  },

  // Backs authctx's refreshAuthentication() — the one call that must survive
  // a full page load and still know both *who* is signed in and whether
  // they're a god (plan §6.2).
  async loggedIn() {
    return authControllerEmployerLoggedIn() as unknown as Promise<AuthResponse>;
  },

  // A god mints a one-click sign-in link for an employer's owner.
  async generateMagicLink(employer_id: string) {
    return godsControllerGenerateMagicLink({
      employer_id,
    }) as unknown as Promise<FetchResponse & { magicLink: string }>;
  },

  async verifyEmployer(employer_id: string): Promise<EmployerResponse> {
    return godsControllerVerifyEmployer(
      employer_id,
    ) as unknown as Promise<EmployerResponse>;
  },

  async unverifyEmployer(employer_id: string): Promise<EmployerResponse> {
    return godsControllerUnverifyEmployer(
      employer_id,
    ) as unknown as Promise<EmployerResponse>;
  },
};
