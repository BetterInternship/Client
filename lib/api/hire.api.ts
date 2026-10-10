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
  authControllerGodLoggedIn,
  authControllerGodSignOut,
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

export type { GodSelf } from "./generated/models";

interface EmployerResponse extends FetchResponse {
  success: boolean;
  employer: Employer;
}

// `god` on the employer user is a constant false now: a god is signed in by
// their own session (GodAuthService), never by the employer one. The field
// stays only because the server still sends it.
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

  // Undoes loginAsEmployer: drops the employer cookie. The god's own session
  // is separate and untouched, so there is no account to restore.
  async exitProxy() {
    return godsControllerExitProxy();
  },

  async logout() {
    await authControllerEmployerSignOut();
  },

  // Backs authctx's refreshAuthentication() — the one call that must survive
  // a full page load and still know who is signed in as an employer.
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

// The god realm: its own session cookie, separate from the employer one
// (OPAQUE_SESSIONS_MIGRATION_PLAN.md §4.6). Gods sign in through
// EmployerAuthService.verifyLoginOtp, which the server answers as a god login
// for a god email (temporary, until the tools site).
export const GodAuthService = {
  // Backs authctx's refreshGod(); 401 when there is no live god session.
  async loggedIn() {
    return authControllerGodLoggedIn();
  },

  async logout() {
    return authControllerGodSignOut();
  },
};
