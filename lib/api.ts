import { APIClient, Job, User, Application, MockInterview } from "./api-client";
import { USE_MOCK_API } from "./mock/config";
import { mockApiService } from "./mock/api";

// API configuration and helper funcs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function for api routes
const APIRoute = (() => {
  interface Params {
    [key: string]: any;
  }

  // Generates a parameter string for query urls
  const search_params = (params: Params) => {
    const search_params = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "")
        search_params.append(key, value.toString());
    });
    return search_params.toString();
  };

  class APIRouteClass {
    routes: string[];
    params: Params | null;

    constructor(base: string) {
      this.routes = [base];
      this.params = null;
    }

    // Adds a subroute
    r(...route: string[]) {
      route.map((r) => this.routes.push(r));
      return this;
    }

    // Adds a list of params
    p(params: Params) {
      this.params = params;
      return this;
    }

    build() {
      if (!this.params) return `${API_BASE_URL}/${this.routes.join("/")}`;
      return `${API_BASE_URL}/${this.routes.join("/")}?${search_params(
        this.params
      )}`;
    }
  }

  return (route: string) => new APIRouteClass(route);
})();

// Warning
if (!API_BASE_URL) console.warn("[WARNING]: Base API URL is not set.");

// Generic Responses
interface NoResponse {}

interface StatusResponse {
  message: string;
  success: boolean;
}

interface ToggleResponse {
  message: string;
  state: boolean;
}

interface CheckResponse {
  state: boolean;
}

// Auth Services
interface AuthResponse {
  token: string;
  user: Partial<User>;
}

interface EmailStatusResponse {
  existing_user: boolean;
  verified_user: boolean;
}

interface SendOTPResponse {
  email: string;
}

export const auth_service = {
  async register(user: Partial<User>) {
    if (USE_MOCK_API) {
      return mockApiService.register(user);
    }
    return APIClient.post<AuthResponse>(
      APIRoute("auth").r("register").build(),
      user
    );
  },

  async login(email: string, password: string = '') {
    if (USE_MOCK_API) {
      return mockApiService.login(email);
    }
    return APIClient.post<AuthResponse>(
      APIRoute("auth").r("login").build(),
      { email, password }
    );
  },

  async verify(user_id: string, key: string) {
    if (USE_MOCK_API) {
      return mockApiService.verify(user_id, key);
    }
    return APIClient.post<AuthResponse>(APIRoute("auth").r("verify").build(), {
      user_id,
      key,
    });
  },

  async email_status(email: string) {
    if (USE_MOCK_API) {
      return mockApiService.emailStatus(email);
    }
    return APIClient.post<EmailStatusResponse>(
      APIRoute("auth").r("email-status").build(),
      { email }
    );
  },

  async send_otp_request(email: string) {
    if (USE_MOCK_API) {
      return mockApiService.sendOtpRequest(email);
    }
    return APIClient.post<SendOTPResponse>(
      APIRoute("auth").r("send-otp").build(),
      { email }
    );
  },

  async verify_otp(email: string, otp: string) {
    if (USE_MOCK_API) {
      return mockApiService.verifyOtp(email, otp);
    }
    return APIClient.post<AuthResponse>(
      APIRoute("auth").r("verify-otp").build(),
      { email, otp }
    );
  },

  // ! to implement
  async refresh_token() {},

  async logout() {
    // ! to remove
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }

    if (USE_MOCK_API) {
      return Promise.resolve();
    }
    return APIClient.post<NoResponse>(APIRoute("auth").r("logout").build());
  },
};

// User Services
interface UserResponse extends Partial<User> {}

interface DashboardResponse {
  applications: {
    total_applications: number;
    pending: number;
    reviewed: number;
    shortlisted: number;
    accepted: number;
    rejected: number;
  };
  saved_jobs_count: number;
  recent_activity: Array<{
    activity_type: string;
    created_at: string;
    metadata?: any;
  }>;
  profile_completeness: number;
}

interface SavedJobsResponse {
  savedJobs: Array<{
    savedId: string;
    savedAt: string;
    job: Job;
  }>;
  totalPages: number;
  currentPage: number;
  total: number;
}

export const user_service = {
  async get_profile() {
    if (USE_MOCK_API) {
      return mockApiService.getProfile();
    }
    return APIClient.get<UserResponse>(APIRoute("users").r("profile").build());
  },

  async update_profile(data: Partial<User>) {
    if (USE_MOCK_API) {
      return mockApiService.updateProfile(data);
    }
    return APIClient.put<UserResponse>(
      APIRoute("users").r("profile").build(),
      data
    );
  },

  async get_dashboard_stats() {
    if (USE_MOCK_API) {
      return mockApiService.getDashboardStats();
    }
    return APIClient.get<DashboardResponse>(
      APIRoute("users").r("dashboard-stats").build()
    );
  },

  async get_saved_jobs(page = 1, limit = 10) {
    if (USE_MOCK_API) {
      return mockApiService.getSavedJobs(page, limit);
    }
    return APIClient.get<SavedJobsResponse>(
      APIRoute("users").r("saved-jobs").p({ page, limit }).build()
    );
  },

  async save_job(job_id: string) {
    if (USE_MOCK_API) {
      return mockApiService.saveJob(job_id);
    }
    return APIClient.post<ToggleResponse>(
      APIRoute("users").r("save-job", job_id).build()
    );
  },

  async check_saved(job_id: string) {
    if (USE_MOCK_API) {
      return mockApiService.checkSaved(job_id);
    }
    return APIClient.get<CheckResponse>(
      APIRoute("users").r("check-saved", job_id).build()
    );
  },
};

// Job Services
interface JobResponse extends Job {}

interface JobsResponse {
  jobs: Job[];
  totalPages: number;
  currentPage: number;
  total: number;
}

type CategoriesResponse = Array<{
  category: string;
  count: number;
}>;

type SuggestionsResponse = Array<{
  type: "job_title" | "company" | "category";
  value: string;
}>;

export const job_service = {
  async get_jobs(
    params: {
      page?: number;
      limit?: number;
      category?: string;
      type?: string;
      mode?: string;
      search?: string;
      location?: string;
    } = {}
  ) {
    if (USE_MOCK_API) {
      return mockApiService.getJobs(params);
    }
    return APIClient.get<JobsResponse>(APIRoute("jobs").p(params).build());
  },

  async get_job_by_id(job_id: string) {
    if (USE_MOCK_API) {
      return mockApiService.getJobById(job_id);
    }
    return APIClient.get<JobResponse>(
      APIRoute("jobs").r("detail", job_id).build()
    );
  },

  async get_recommended_jobs(limit = 10) {
    if (USE_MOCK_API) {
      return mockApiService.getRecommendedJobs(limit);
    }
    return APIClient.get<JobsResponse>(
      APIRoute("jobs").r("recommended").p({ limit }).build()
    );
  },

  async get_categories() {
    if (USE_MOCK_API) {
      return mockApiService.getCategories();
    }
    return APIClient.get<CategoriesResponse>(
      APIRoute("jobs").r("categories").build()
    );
  },

  async track_view(job_id: string) {
    if (USE_MOCK_API) {
      return mockApiService.trackJobView(job_id);
    }
    return APIClient.post<NoResponse>(
      APIRoute("jobs").r(job_id, "track-view").build()
    );
  },

  async get_search_suggestions(params: { [key: string]: any }) {
    if (USE_MOCK_API) {
      return mockApiService.getSearchSuggestions(params.q || '');
    }
    return APIClient.get<SuggestionsResponse>(
      APIRoute("jobs").r("search", "suggestions").p(params).build()
    );
  },
};

// Application Services
interface ApplicationsResponse {
  applications: Application[];
  totalPages: number;
  currentPage: number;
  total: number;
}

interface ApplicationResponse extends Application {}

interface CreateApplicationResponse {
  message: string;
  application: Application;
}

interface ApplicationJobResponse {
  hasApplied: boolean;
  applicationId?: string;
  status?: string;
  appliedAt?: string;
}

interface ApplicationStatsResponse {
  total_applications: number;
  pending: number;
  reviewed: number;
  shortlisted: number;
  accepted: number;
  rejected: number;
}

export const application_service = {
  async get_applications(
    params: {
      page?: number;
      limit?: number;
      status?: string;
    } = {}
  ) {
    if (USE_MOCK_API) {
      return mockApiService.getApplications(params);
    }
    return APIClient.get<ApplicationsResponse>(
      APIRoute("applications").p(params).build()
    );
  },

  async create_application(data: {
    jobId: string;
    coverLetter?: string;
    githubLink?: string;
    portfolioLink?: string;
    resumeFilename?: string;
  }) {
    if (USE_MOCK_API) {
      return mockApiService.createApplication(data);
    }
    return APIClient.post<CreateApplicationResponse>(
      APIRoute("applications").build(),
      data
    );
  },

  async get_application_by_id(id: string): Promise<ApplicationResponse> {
    if (USE_MOCK_API) {
      return mockApiService.getApplicationById(id);
    }
    return APIClient.get<ApplicationResponse>(
      APIRoute("applications").r(id).build()
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
    if (USE_MOCK_API) {
      return mockApiService.updateApplication(id, data);
    }
    return APIClient.put<ApplicationResponse>(
      APIRoute("applications").r(id).build(),
      data
    );
  },

  async withdraw_application(id: string) {
    if (USE_MOCK_API) {
      return mockApiService.withdrawApplication(id);
    }
    return APIClient.delete<StatusResponse>(
      APIRoute("applications").r(id).build()
    );
  },

  async check_application(job_id: string) {
    if (USE_MOCK_API) {
      return mockApiService.checkApplication(job_id);
    }
    return APIClient.get<ApplicationJobResponse>(
      APIRoute("applications").r("check", job_id).build()
    );
  },

  async get_stats() {
    if (USE_MOCK_API) {
      return mockApiService.getApplicationStats();
    }
    return APIClient.get<ApplicationStatsResponse>(
      APIRoute("applications").r("stats").build()
    );
  },
};

// Error handling utility
export const handle_api_error = (error: any) => {
  console.error("API Error:", error);
  console.error("Error details:", {
    message: error.message,
    stack: error.stack,
    response: error.response
  });

  if (error.message === "Unauthorized") {
    // Already handled by apiClient
    return "Authentication required";
  }

  // Parse validation errors
  if (error.message && error.message.includes("Invalid input")) {
    return "Data validation error: " + error.message;
  }

  // You can add more specific error handling here
  // For example, show toast notifications

  return error.message || "An unexpected error occurred";
};

// File Services
interface FileUploadResponse {
  message: string;
  file: {
    filename: string;
    url: string;
    size: number;
    originalName: string;
  };
}

export const file_service = {
  async upload_resume(file: File) {
    if (USE_MOCK_API) {
      return mockApiService.uploadResume(file);
    }
    const formData = new FormData();
    formData.append("resume", file);

    return APIClient.uploadFile<FileUploadResponse>(
      APIRoute("files").r("upload", "resume").build(),
      formData
    );
  },

  async upload_profile_picture(file: File) {
    if (USE_MOCK_API) {
      return mockApiService.uploadProfilePicture(file);
    }
    const formData = new FormData();
    formData.append("profilePicture", file);

    return APIClient.uploadFile<FileUploadResponse>(
      APIRoute("files").r("upload", "profile-picture").build(),
      formData
    );
  },

  async delete_resume() {
    if (USE_MOCK_API) {
      return mockApiService.deleteResume();
    }
    return APIClient.delete<StatusResponse>(
      APIRoute("files").r("resume").build()
    );
  },

  async delete_profile_picture() {
    if (USE_MOCK_API) {
      return mockApiService.deleteProfilePicture();
    }
    return APIClient.delete<StatusResponse>(
      APIRoute("files").r("profile-picture").build()
    );
  },
};
