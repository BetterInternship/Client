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
import { APIClient, APIRouteBuilder } from "./api-client";

interface EmployersResponse extends FetchResponse {
  success: boolean;
  employers: Employer[];
}

interface EmployerResponse extends FetchResponse {
  success: boolean;
  employer: Employer;
}

// god is merged onto the user object itself (auth.service.ts's toFullSelf),
// not a sibling field — /hire/login and /hire/loggedin are the only two
// routes that carry it; /employer-users/me does not.
interface AuthResponse extends FetchResponse {
  success: boolean;
  user: Partial<EmployerSelf> & { god?: boolean };
}

interface EmailStatusResponse extends FetchResponse {
  existing_user: boolean;
  verified_user: boolean;
}

interface OnboardStatusResponse extends FetchResponse {
  valid: boolean;
  needs_onboarding?: boolean;
  employer_name?: string;
}

export const EmployerAuthService = {
  async emailStatus(email: string) {
    return APIClient.post<EmailStatusResponse>(
      APIRouteBuilder("auth").r("hire", "email-status").build(),
      { email },
    );
  },

  async register(employer: Partial<Employer>) {
    return APIClient.post<AuthResponse>(
      APIRouteBuilder("auth").r("hire", "register").build(),
      employer,
      "form-data",
    );
  },

  async login(email: string, password: string) {
    return APIClient.post<AuthResponse>(
      APIRouteBuilder("auth").r("hire", "login").build(),
      { email, password },
    );
  },

  async loginAsEmployer(employer_id: string) {
    return APIClient.post<AuthResponse>(
      APIRouteBuilder("god").r("employers", employer_id, "proxy").build(),
    );
  },

  async logout() {
    await APIClient.post<FetchResponse>(
      APIRouteBuilder("auth").r("hire", "logout").build(),
    );
  },

  // Backs authctx's refreshAuthentication() — the one call that must survive
  // a full page load and still know both *who* is signed in and whether
  // they're a god (plan §6.2).
  async loggedIn() {
    return APIClient.post<AuthResponse>(
      APIRouteBuilder("auth").r("hire", "loggedin").build(),
    );
  },

  async getOnboardStatus(uid: string, hash: string) {
    return APIClient.get<OnboardStatusResponse>(
      APIRouteBuilder("auth").r("hire", "onboard", uid, hash).build(),
    );
  },

  async onboard(uid: string, hash: string, password: string) {
    return APIClient.post<FetchResponse>(
      APIRouteBuilder("auth").r("hire", "onboard").build(),
      { employer_user_id: uid, hash, password },
    );
  },

  async verifyEmployer(employer_id: string): Promise<EmployerResponse> {
    return APIClient.post<EmployerResponse>(
      APIRouteBuilder("god").r("employers", employer_id, "verify").build(),
    );
  },

  async unverifyEmployer(employer_id: string): Promise<EmployerResponse> {
    return APIClient.post<EmployerResponse>(
      APIRouteBuilder("god").r("employers", employer_id, "unverify").build(),
    );
  },
};
