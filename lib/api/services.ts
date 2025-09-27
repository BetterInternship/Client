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

  async getEmployerPfpURL(employerId: string) {
    return APIClient.get<EmployerResponse>(
      APIRoute("employer").r(employerId, "pic").build()
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

interface ResourceHashResponse {
  success?: boolean;
  message?: string;
  hash?: string;
}

export const AuthService = {
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

  async verify(userId: string, key: string) {
    return APIClient.post<AuthResponse>(
      APIRoute("auth").r("verify-email").build(),
      {
        user_id: userId,
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

  async getUserPfpURL(userId: string) {
    return APIClient.get<ResourceHashResponse>(
      APIRoute("users").r(userId, "pic").build()
    );
  },

  async updateMyPfp(file: FormData) {
    return APIClient.put<ResourceHashResponse>(
      APIRoute("users").r("me", "pic").build(),
      file,
      "form-data"
    );
  },

  async getUserResumeURL(userId: string) {
    return APIClient.get<ResourceHashResponse>(
      APIRoute("users").r(userId, "resume").build()
    );
  },

  async updateMyResume(form: FormData) {
    return APIClient.put<Response>(
      APIRoute("users").r("me", "resume").build(),
      form,
      "form-data"
    );
  },

  async saveJob(jobId: string) {
    return APIClient.post<SaveJobResponse>(
      APIRoute("users").r("save-job").build(),
      { id: jobId }
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

  async getJobById(jobId: string) {
    return APIClient.get<JobResponse>(APIRoute("jobs").r(jobId).build());
  },

  async getSavedJobs() {
    return APIClient.get<SavedJobsResponse>(
      APIRoute("jobs").r("saved").build()
    );
  },

  async getOwnedJobs() {
    return APIClient.get<OwnedJobsResponse>(
      APIRoute("jobs").r("owned").build()
    );
  },

  async createJob(job: Partial<Job>) {
    return APIClient.post<FetchResponse>(
      APIRoute("jobs").r("create").build(),
      job
    );
  },

  async updateJob(jobId: string, job: Partial<Job>) {
    return APIClient.put<FetchResponse>(APIRoute("jobs").r(jobId).build(), job);
  },

  async deleteJob(jobId: string) {
    return APIClient.delete<FetchResponse>(APIRoute("jobs").r(jobId).build());
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

  async getApplicationById(id: string): Promise<UserApplicationResponse> {
    return APIClient.get<UserApplicationResponse>(
      APIRoute("applications").r(id).build()
    );
  },

  async getEmployerApplications(): Promise<EmployerApplicationsResponse> {
    return APIClient.get<EmployerApplicationsResponse>(
      APIRoute("employer").r("applications").build()
    );
  },

  async updateApplication(
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

  async withdrawApplication(id: string) {
    return APIClient.delete<FetchResponse>(
      APIRoute("applications").r(id).build()
    );
  },

  async reviewApplication(
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

  // ! Show toast notifications here
  return error.message || "An unexpected error occurred";
};
