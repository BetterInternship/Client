import { FetchResponse } from "@/lib/api/use-fetch";
import {
  Conversation,
  Employer,
  EmployerApplication,
  Job,
  PublicUser,
  SavedJob,
  UserApplication,
} from "@/lib/db/db.types";
import { APIClient, APIRouteBuilder } from "./api-client";

interface EmployerResponse extends FetchResponse {
  employer: Partial<Employer>;
}

export const EmployerService = {
  async getMyProfile() {
    return APIClient.get<EmployerResponse>(
      APIRouteBuilder("employer").r("me").build(),
    );
  },

  async getEmployerPfpURL(employerId: string) {
    return APIClient.get<EmployerResponse>(
      APIRouteBuilder("employer").r(employerId, "pic").build(),
    );
  },

  async updateMyProfile(data: Partial<Employer>) {
    return APIClient.put<EmployerResponse>(
      APIRouteBuilder("employer").r("me").build(),
      data,
    );
  },

  async updateMyPfp(file: Blob | null) {
    return APIClient.put<ResourceHashResponse>(
      APIRouteBuilder("employer").r("me", "pic").build(),
      file,
      "form-data",
    );
  },

  async signMoaWithSignature(data: {
    moaFieldsId: string;
    companyLegalName: string;
    companyAddress: string;
    companyRepresentative: string;
    companyRepresentativePosition: string;
    companyType: string;
  }) {
    return APIClient.post<{ success: boolean; message?: string }>(
      APIRouteBuilder("student/moa").r("sign").build({ moaServer: true }),
      data,
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
      APIRouteBuilder("auth").r("register").build(),
      user,
    );
  },

  async login(email: string, password: string = "") {
    return APIClient.post<AuthResponse>(
      APIRouteBuilder("auth").r("login").build(),
      {
        email,
        password,
      },
    );
  },

  async verify(userId: string, key: string) {
    return APIClient.post<AuthResponse>(
      APIRouteBuilder("auth").r("verify-email").build(),
      {
        user_id: userId,
        key,
      },
    );
  },

  async requestActivation(email: string) {
    return APIClient.post<ResourceHashResponse>(
      APIRouteBuilder("auth").r("activate").build(),
      { email },
    );
  },

  async activate(email: string, otp: string) {
    return APIClient.post<ResourceHashResponse>(
      APIRouteBuilder("auth").r("activate", "otp").build(),
      { email, otp },
    );
  },

  async logout() {
    await APIClient.post<FetchResponse>(
      APIRouteBuilder("auth").r("logout").build(),
    );
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
    return APIClient.get<UserResponse>(
      APIRouteBuilder("users").r("me").build(),
    );
  },

  async updateMyProfile(data: Partial<PublicUser>) {
    return APIClient.put<UserResponse>(
      APIRouteBuilder("users").r("me").build(),
      data,
    );
  },

  async updateMyDocData(data: Partial<PublicUser>) {
    return APIClient.put<UserResponse>(
      APIRouteBuilder("users").r("my-doc-data").build(),
      data,
    );
  },

  // ! todo, add a way for the route to be able to tell if request is valid or not
  // ! we can't generate signed forms out of nowhere
  async submitSignedForm(data: {
    formName: string;
    values: Record<string, string>;
    parties?: {
      userId?: string;
      employerId?: string;
      universityId?: string;
    };
  }) {
    return APIClient.post<{
      success?: boolean;
      pendingDocumentUrl: string;
      pendingDocumentId: string;
      internshipFormId: string;
    }>(APIRouteBuilder("forms").r("signed").build({ moaServer: true }), data);
  },

  async submitPendingForm(data: {
    formName: string;
    values: Record<string, string>;
    parties?: {
      userId?: string;
      employerId?: string;
      universityId?: string;
    };
  }) {
    return APIClient.post<{
      success?: boolean;
      pendingDocumentUrl: string;
      pendingDocumentId: string;
      internshipFormId: string;
    }>(APIRouteBuilder("forms").r("pending").build({ moaServer: true }), data);
  },

  async requestEmployerAssist(id: string, recipient: string) {
    alert("this route isnt implemented yet");
    return Promise.resolve({});
  },

  async parseResume(form: FormData) {
    return APIClient.post<UserResponse>(
      APIRouteBuilder("users").r("me", "extract-resume").build(),
      form,
      "form-data",
    );
  },

  async getMyResumeURL() {
    return APIClient.get<ResourceHashResponse>(
      APIRouteBuilder("users").r("me", "resume").build(),
    );
  },

  // ! remove hardcoded mapping
  async getEntityList() {
    const response = await APIClient.get<{
      entities: { id: string; display_name: string }[];
    }>(APIRouteBuilder("entities").r("list").build({ moaServer: true }));

    return {
      employers: response.entities.map((e) => ({
        id: e.id,
        legal_entity_name: e.display_name,
      })),
    };
  },

  async getMyPfpURL() {
    return APIClient.get<ResourceHashResponse>(
      APIRouteBuilder("users").r("me", "pic").build(),
    );
  },

  async getUserPfpURL(userId: string) {
    return APIClient.get<ResourceHashResponse>(
      APIRouteBuilder("users").r(userId, "pic").build(),
    );
  },

  async updateMyPfp(file: FormData) {
    return APIClient.put<ResourceHashResponse>(
      APIRouteBuilder("users").r("me", "pic").build(),
      file,
      "form-data",
    );
  },

  async getUserResumeURL(userId: string) {
    return APIClient.get<ResourceHashResponse>(
      APIRouteBuilder("users").r(userId, "resume").build(),
    );
  },

  async updateMyResume(form: FormData) {
    return APIClient.put<Response>(
      APIRouteBuilder("users").r("me", "resume").build(),
      form,
      "form-data",
    );
  },

  async saveJob(jobId: string) {
    return APIClient.post<SaveJobResponse>(
      APIRouteBuilder("users").r("save-job").build(),
      { id: jobId },
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
  async getAllJobs() {
    return APIClient.get<JobsResponse>(APIRouteBuilder("jobs").build());
  },

  async getJobById(jobId: string) {
    return APIClient.get<JobResponse>(APIRouteBuilder("jobs").r(jobId).build());
  },

  async getSavedJobs() {
    return APIClient.get<SavedJobsResponse>(
      APIRouteBuilder("jobs").r("saved").build(),
    );
  },

  async getOwnedJobs() {
    return APIClient.get<OwnedJobsResponse>(
      APIRouteBuilder("jobs").r("owned").build(),
    );
  },

  async createJob(job: Partial<Job>) {
    return APIClient.post<FetchResponse>(
      APIRouteBuilder("jobs").r("create").build(),
      job,
    );
  },

  async updateJob(jobId: string, job: Partial<Job>) {
    return APIClient.put<FetchResponse>(
      APIRouteBuilder("jobs").r(jobId).build(),
      job,
    );
  },

  async deleteJob(jobId: string) {
    return APIClient.delete<FetchResponse>(
      APIRouteBuilder("jobs").r(jobId).build(),
    );
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
      APIRouteBuilder("conversations").r("send-to-user").build(),
      {
        conversation_id: conversationId,
        message,
      },
    );
  },

  async createConversation(userId: string) {
    return APIClient.post<ConversationResponse>(
      APIRouteBuilder("conversations").r("create").build(),
      { user_id: userId },
    );
  },
};

export const UserConversationService = {
  async sendToEmployer(conversationId: string, message: string) {
    return APIClient.post<any>(
      APIRouteBuilder("conversations").r("send-to-employer").build(),
      {
        conversation_id: conversationId,
        message,
      },
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
    } = {},
  ) {
    return APIClient.get<UserApplicationsResponse>(
      APIRouteBuilder("applications").p(params).build(),
    );
  },

  async createApplication(data: { job_id: string; cover_letter?: string }) {
    return APIClient.post<CreateApplicationResponse>(
      APIRouteBuilder("applications").r("create").build(),
      data,
    );
  },

  async getApplicationById(id: string): Promise<UserApplicationResponse> {
    return APIClient.get<UserApplicationResponse>(
      APIRouteBuilder("applications").r(id).build(),
    );
  },

  async getEmployerApplications(): Promise<EmployerApplicationsResponse> {
    return APIClient.get<EmployerApplicationsResponse>(
      APIRouteBuilder("employer").r("applications").build(),
    );
  },

  async updateApplication(
    id: string,
    data: {
      coverLetter?: string;
      githubLink?: string;
      portfolioLink?: string;
      resumeFilename?: string;
    },
  ) {
    return APIClient.put<UserApplicationResponse>(
      APIRouteBuilder("applications").r(id).build(),
      data,
    );
  },

  async withdrawApplication(id: string) {
    return APIClient.delete<FetchResponse>(
      APIRouteBuilder("applications").r(id).build(),
    );
  },

  async reviewApplication(
    id: string,
    review_options: { review?: string; notes?: string; status?: number },
  ) {
    return APIClient.post<FetchResponse>(
      APIRouteBuilder("applications").r(id, "review").build(),
      review_options,
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
