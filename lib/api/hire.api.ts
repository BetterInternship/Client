/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-22 19:43:25
 * @ Modified time: 2025-09-27 18:30:55
 * @ Description:
 *
 * Routes used by employers
 */

import { FetchResponse } from "@/lib/api/use-fetch";
import { Employer, PublicEmployerUser } from "../db/db.types";
import { APIClient, APIRouteBuilder } from "./api-client";

interface EmployersResponse extends FetchResponse {
  success: boolean;
  employers: Employer[];
}

interface EmployerResponse extends FetchResponse {
  success: boolean;
  employer: Employer;
}

interface AuthResponse extends FetchResponse {
  success: boolean;
  user: Partial<PublicEmployerUser>;
}

interface EmailStatusResponse extends FetchResponse {
  existing_user: boolean;
  verified_user: boolean;
}

export const EmployerAuthService = {
  async emailStatus(email: string) {
    return APIClient.post<EmailStatusResponse>(
      APIRouteBuilder("auth").r("hire", "email-status").build(),
      { email }
    );
  },

  async register(employer: Partial<Employer>) {
    return APIClient.post<AuthResponse>(
      APIRouteBuilder("auth").r("hire", "register").build(),
      employer,
      "form-data"
    );
  },

  async login(email: string, password: string) {
    return APIClient.post<AuthResponse>(
      APIRouteBuilder("auth").r("hire", "login").build(),
      { email, password }
    );
  },

  async loginAsEmployer(employer_id: string) {
    return APIClient.post<AuthResponse>(
      APIRouteBuilder("employer").r("proxy", employer_id).build()
    );
  },

  async getAllUsers() {
    return APIClient.get<AuthResponse>(
      APIRouteBuilder("employer").r("all-users").build()
    );
  },

  async getAllEmployers() {
    return APIClient.get<EmployersResponse>(
      APIRouteBuilder("employer").r("all").build()
    );
  },

  async logout() {
    await APIClient.post<FetchResponse>(
      APIRouteBuilder("auth").r("hire", "logout").build()
    );
  },

  async verifyEmployer(employer_id: string): Promise<EmployerResponse> {
    return APIClient.post<EmployerResponse>(
      APIRouteBuilder("employer").r("verify", employer_id).build()
    );
  },

  async unverifyEmployer(employer_id: string): Promise<EmployerResponse> {
    return APIClient.post<EmployerResponse>(
      APIRouteBuilder("employer").r("unverify", employer_id).build()
    );
  },
};
