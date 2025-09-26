import {
  Job,
  PublicUser,
  UserApplication,
  SavedJob,
  EmployerApplication,
  Employer,
  Conversation,
} from "@/lib/db/db.types";
import { APIClient, APIRoute } from "./api-client";
import { FetchResponse } from "@/lib/api/use-fetch";

interface EmployerResponse extends FetchResponse {
  employer: Partial<Employer>;
}

export const EmployerService = {
  async getMyProfile() {
    return APIClient.get<EmployerResponse>(
      APIRoute("employer").r("me").build()
    );
  },

  async getEmployerPfpURL(employer_id: string) {
    return APIClient.get<EmployerResponse>(
      APIRoute("employer").r(employer_id, "pic").build()
    );
  },

  async updateMyProfile(data: Partial<Employer>) {
    return APIClient.put<EmployerResponse>(
      APIRoute("employer").r("me").build(),
      data
    );
  },

  async updateMyPfp(file: Blob | null) {
    return APIClient.put<ResourceHashResponse>(
      APIRoute("employer").r("me", "pic").build(),
      file,
      "form-data"
    );
  },
};

// Auth Services
interface AuthResponse extends FetchResponse {
  success: boolean;
  user: Partial<PublicUser>;
}

interface EmailStatusResponse extends FetchResponse {
  existing_user: boolean;
  verified_user: boolean;
}

interface ResourceHashResponse {
  success?: boolean;
  message?: string;
  hash?: string;
}

export const AuthService = {
  async isLoggedIn() {
    return APIClient.post<AuthResponse>(APIRoute("auth").r("loggedin").build());
  },

  async register(user: Partial<PublicUser>) {
    return APIClient.post<AuthResponse>(
      APIRoute("auth").r("register").build(),
      user
    );
  },

  async login(email: string, password: string = "") {
    return APIClient.post<AuthResponse>(APIRoute("auth").r("login").build(), {
      email,
      password,
    });
  },

  async verify(user_id: string, key: string) {
    return APIClient.post<AuthResponse>(
      APIRoute("auth").r("verify-email").build(),
      {
        user_id,
        key,
      }
    );
  },

  async requestActivation(email: string) {
    return APIClient.post<ResourceHashResponse>(
      APIRoute("auth").r("activate").build(),
      { email }
    );
  },

  async activate(email: string, otp: string) {
    return APIClient.post<ResourceHashResponse>(
      APIRoute("auth").r("activate", "otp").build(),
      { email, otp }
    );
  },

  async logout() {
    await APIClient.post<FetchResponse>(APIRoute("auth").r("logout").build());
  },
};
interface UserResponse extends FetchResponse {
  user: PublicUser;
}

interface SaveJobResponse extends FetchResponse {
  job?: Job;
  success: boolean;
  message: string;
}

export const UserService = {
  async getMyProfile() {
    return APIClient.get<UserResponse>(APIRoute("users").r("me").build());
  },

  async updateMyProfile(data: Partial<PublicUser>) {
    return APIClient.put<UserResponse>(APIRoute("users").r("me").build(), data);
  },

  async parseResume(form: FormData) {
    return APIClient.post<UserResponse>(
      APIRoute("users").r("me", "extract-resume").build(),
      form,
      "form-data"
    );
  },

  async getMyResumeURL() {
    return APIClient.get<ResourceHashResponse>(
      APIRoute("users").r("me", "resume").build()
    );
  },

  async getMyPfpURL() {
    return APIClient.get<ResourceHashResponse>(
      APIRoute("users").r("me", "pic").build()
    );
  },

  async getUserPfpURL(user_id: string) {
    return APIClient.get<ResourceHashResponse>(
      APIRoute("users").r(user_id, "pic").build()
    );
  },

  async updateMyPfp(file: FormData) {
    return APIClient.put<ResourceHashResponse>(
      APIRoute("users").r("me", "pic").build(),
      file,
      "form-data"
    );
  },

  async getUserResumeURL(user_id: string) {
    return APIClient.get<ResourceHashResponse>(
      APIRoute("users").r(user_id, "resume").build()
    );
  },

  async updateMyResume(form: FormData) {
    return APIClient.put<Response>(
      APIRoute("users").r("me", "resume").build(),
      form,
      "form-data"
    );
  },

  async saveJob(job_id: string) {
    return APIClient.post<SaveJobResponse>(
      APIRoute("users").r("save-job").build(),
      { id: job_id }
    );
  },
};

// Job Services
interface JobResponse extends FetchResponse {
  job: Job;
}

interface JobsResponse extends FetchResponse {
  jobs?: Job[];
}

interface SavedJobsResponse extends FetchResponse {
  jobs?: SavedJob[];
}

interface OwnedJobsResponse extends FetchResponse {
  jobs: Job[];
}

export const JobService = {
  async getAllJobs(params: { last_update: number }) {
    return APIClient.get<JobsResponse>(APIRoute("jobs").p(params).build());
  },

  async getJobById(job_id: string) {
    return APIClient.get<JobResponse>(APIRoute("jobs").r(job_id).build());
  },

  async getSavedJobs() {
    return APIClient.get<SavedJobsResponse>(
      APIRoute("jobs").r("saved").build()
    );
  },

  async get_owned_jobs() {
    return APIClient.get<OwnedJobsResponse>(
      APIRoute("jobs").r("owned").build()
    );
  },

  async create_job(job: Partial<Job>) {
    return APIClient.post<FetchResponse>(
      APIRoute("jobs").r("create").build(),
      job
    );
  },

  async update_job(job_id: string, job: Partial<Job>) {
    return APIClient.put<FetchResponse>(
      APIRoute("jobs").r(job_id).build(),
      job
    );
  },

  async delete_job(job_id: string) {
    return APIClient.delete<FetchResponse>(APIRoute("jobs").r(job_id).build());
  },
};

interface ConversationResponse extends FetchResponse {
  conversation?: Conversation;
}

interface ConversationsResponse extends FetchResponse {
  conversations?: Conversation[];
}

export const EmployerConversationService = {
  async sendToUser(conversationId: string, message: string) {
    return APIClient.post<any>(
      APIRoute("conversations").r("send-to-user").build(),
      {
        conversation_id: conversationId,
        message,
      }
    );
  },

  async createConversation(userId: string) {
    return APIClient.post<ConversationResponse>(
      APIRoute("conversations").r("create").build(),
      { user_id: userId }
    );
  },
};

export const UserConversationService = {
  async sendToEmployer(conversationId: string, message: string) {
    return APIClient.post<any>(
      APIRoute("conversations").r("send-to-employer").build(),
      {
        conversation_id: conversationId,
        message,
      }
    );
  },
};

// Application Services
interface UserApplicationsResponse extends FetchResponse {
  applications: UserApplication[];
}

interface EmployerApplicationsResponse extends FetchResponse {
  applications: EmployerApplication[];
}

interface UserApplicationResponse extends FetchResponse {
  application: UserApplication;
}

interface EmployerApplicationResponse extends FetchResponse {
  application: EmployerApplication;
}

interface CreateApplicationResponse extends FetchResponse {
  application: UserApplication;
}

export const ApplicationService = {
  async getApplications(
    params: {
      page?: number;
      limit?: number;
      status?: string;
    } = {}
  ) {
    return APIClient.get<UserApplicationsResponse>(
      APIRoute("applications").p(params).build()
    );
  },

  async createApplication(data: { job_id: string; cover_letter?: string }) {
    return APIClient.post<CreateApplicationResponse>(
      APIRoute("applications").r("create").build(),
      data
    );
  },

  async get_application_by_id(id: string): Promise<UserApplicationResponse> {
    return APIClient.get<UserApplicationResponse>(
      APIRoute("applications").r(id).build()
    );
  },

  async get_employer_applications(): Promise<EmployerApplicationsResponse> {
    return APIClient.get<EmployerApplicationsResponse>(
      APIRoute("employer").r("applications").build()
    );
  },

  async update_application(
    id: string,
    data: {
      coverLetter?: string;
      githubLink?: string;
      portfolioLink?: string;
      resumeFilename?: string;
    }
  ) {
    return APIClient.put<UserApplicationResponse>(
      APIRoute("applications").r(id).build(),
      data
    );
  },

  async withdraw_application(id: string) {
    return APIClient.delete<FetchResponse>(
      APIRoute("applications").r(id).build()
    );
  },

  async review_application(
    id: string,
    review_options: { review?: string; notes?: string; status?: number }
  ) {
    return APIClient.post<FetchResponse>(
      APIRoute("applications").r(id, "review").build(),
      review_options
    );
  },
};

// Error handling utility
export const handleApiError = (error: any) => {
  console.error("API Error:", error);

  if (error.message === "Unauthorized") {
    // Already handled by apiClient
    return;
  }

  // You can add more specific error handling here
  // For example, show toast notifications

  return error.message || "An unexpected error occurred";
};
