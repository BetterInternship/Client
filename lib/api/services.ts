import { FormTemplate } from "../db/forms-db.types";
import {
  CreateJobChallengeListingPayload,
  UpdateJobChallengeListingPayload,
  Employer,
  EmployerSelf,
  EmployerTeamMember,
  EmployerUserRole,
  Job,
  JobWaitlist,
  PublicUser,
  SavedJob,
  UserApplication,
  User,
  EmployerApplication,
} from "@/lib/db/db.types";
import {
  applicationsControllerCreate,
  applicationsControllerGetOwn,
  applicationsControllerMarkViewed,
  applicationsControllerUpdate,
} from "./generated/endpoints/applications/applications";
import {
  jobsControllerCreate,
  jobsControllerCreateSuper,
  jobsControllerDeactivateBulk,
  jobsControllerDelete,
  jobsControllerFindAllListed,
  jobsControllerFindOne,
  jobsControllerFindOneActive,
  jobsControllerGetOwned,
  jobsControllerGetSaved,
  jobsControllerGetWaitlisted,
  jobsControllerJoinWaitlist,
  jobsControllerLeaveWaitlist,
  jobsControllerSearch,
  jobsControllerShareLink,
  jobsControllerUnpause,
  jobsControllerUnpauseAll,
  jobsControllerUpdate,
} from "./generated/endpoints/jobs/jobs";
import {
  employersControllerApplicants,
  employersControllerAutoLinkIomAccount,
  employersControllerFindEmployer,
  employersControllerFindLogo,
  employersControllerMoaUniversities,
  employersControllerSelf,
  employersControllerStartIomLogin,
  employersControllerStartIomRegistration,
  employersControllerUpdateSelf,
  getEmployersControllerUpdateLogoUrl,
  getEmployersControllerUploadMoaDocumentUrl,
} from "./generated/endpoints/employer/employer";
import { careerFetch } from "./career-fetch";
import { linksControllerResolve } from "./generated/endpoints/links/links";
import {
  authControllerActivateAccount,
  authControllerRegister,
  authControllerRegisterStatus,
  authControllerRequestActivation,
  authControllerSignOut,
} from "./generated/endpoints/auth/auth";
import {
  employerUsersControllerChangeRole,
  employerUsersControllerDeactivate,
  employerUsersControllerGetMe,
  employerUsersControllerInvite,
  employerUsersControllerListTeam,
  employerUsersControllerReactivate,
  employerUsersControllerResendInvite,
  employerUsersControllerUpdateMe,
  employerUsersControllerUpdateMemberNotifications,
  employerUsersControllerUpdateMyNotifications,
} from "./generated/endpoints/employer-users/employer-users";
import {
  getUsersControllerUpdateLogoUrl,
  getUsersControllerUploadResumeUrl,
  usersControllerCancelForm,
  usersControllerCorrectFormRecipient,
  usersControllerDeleteResume,
  usersControllerFilloutForm,
  usersControllerGetCorrectFormRecipientContext,
  usersControllerGetMqJob,
  usersControllerGetMyFormTemplate,
  usersControllerGetMyFormTemplates,
  usersControllerGetMyGeneratedForms,
  usersControllerInitiateForm,
  usersControllerJoinFormGroup,
  usersControllerMyPfp,
  usersControllerMyResumes,
  usersControllerMyResumeUrl,
  usersControllerPfpById,
  usersControllerResendForm,
  usersControllerResumeUrlById,
  usersControllerSelf,
  usersControllerSetDefaultResume,
  usersControllerToggleSaveJob,
  usersControllerUpdateResume,
  usersControllerUpdateSelf,
  usersControllerUploadSignatureImage,
  usersControllerUserById,
} from "./generated/endpoints/users/users";
import type {
  CreateJobChallengeListingDto,
  CreateJobDto,
  InitiateFormDto,
  RegisterUserDto,
  UpdateJobDto,
  UpdateUserDto,
} from "./generated/models";
import { clearSessionHint, setSessionHint } from "@/lib/session-hint";
import { FetchResponse } from "@/lib/api/use-fetch";
import { IFormMetadata, IFormSigningParty } from "@betterinternship/core/forms";

interface EmployerResponse extends FetchResponse {
  employer: Partial<Employer>;
}

interface MoaUniversitiesResponse extends FetchResponse {
  universityIds: string[];
}

interface IomStartResponse extends FetchResponse {
  url: string;
}

export interface MqJobQueuedResponse {
  jobId?: string;
  success: boolean;
  message?: string;
}

export type MqJobStatus = "queued" | "processing" | "done" | "failed";

export interface MqJobDto {
  id: string;
  type: string;
  status: MqJobStatus;
  progress?: { total: number; done: number; failed: number };
  result?: unknown;
  error?: string;
}

export interface MqJobResponse {
  job?: MqJobDto;
  success: boolean;
  message?: string;
}

export const EmployerService = {
  async getMyProfile() {
    return employersControllerSelf() as unknown as Promise<EmployerResponse>;
  },

  async getEmployerById(employerId: string) {
    return employersControllerFindEmployer(
      employerId,
    ) as unknown as Promise<EmployerResponse>;
  },

  async getEmployerPfpURL(employerId: string) {
    return employersControllerFindLogo(
      employerId,
      {} as unknown as import("./generated/models").EmployersControllerFindLogoParams,
    ) as unknown as Promise<EmployerResponse>;
  },

  async updateMyProfile(data: Partial<Employer>) {
    return employersControllerUpdateSelf(
      data as unknown as import("./generated/models").UpdateEmployerDto,
    ) as unknown as Promise<EmployerResponse>;
  },

  async updateMyPfp(file: FormData | Blob | null) {
    // The old FetchClient sent whatever was passed as the raw body in
    // "form-data" mode, unwrapped — including FormData, which callers
    // (company-tab.tsx, the hire register verify page) build themselves. The
    // generated employersControllerUpdateLogo always wraps its argument in a
    // *new* FormData under a "logo" field, which isn't the same wire body, so
    // this bypasses it and calls the mutator directly to keep the body as-is.
    return careerFetch<ResourceHashResponse>(
      getEmployersControllerUpdateLogoUrl(),
      { method: "PUT", body: file ?? undefined },
    );
  },

  async getMoaUniversities() {
    return employersControllerMoaUniversities() as unknown as Promise<MoaUniversitiesResponse>;
  },

  async startIomLogin() {
    return employersControllerStartIomLogin() as unknown as Promise<IomStartResponse>;
  },

  async uploadMoaDocument(formData: FormData) {
    // Same pass-through reasoning as updateMyPfp above: the caller's whole
    // FormData (which may carry extra fields beyond "file") goes out as-is,
    // rather than through the generated wrapper's single-field reshape.
    return careerFetch<FetchResponse & { moa?: any; error?: string }>(
      getEmployersControllerUploadMoaDocumentUrl(),
      { method: "POST", body: formData },
    );
  },

  async startIomRegistration() {
    return employersControllerStartIomRegistration() as unknown as Promise<IomStartResponse>;
  },

  async autoLinkIomAccount(token: string) {
    return employersControllerAutoLinkIomAccount({
      token,
    }) as unknown as Promise<FetchResponse>;
  },
};

interface EmployerSelfResponse extends FetchResponse {
  user: EmployerSelf;
}

// A listing named in the 409 body (or, on success, actually closed) by the
// last-subscriber cascade (Docs/plans/DIGEST_UNSUBSCRIBE_MODAL_PLAN.md §6.3).
export interface EligibleListing {
  id: string;
  title: string;
}

interface UpdateNotificationsResponse extends EmployerSelfResponse {
  // Present on a 409: this write would leave zero subscribed recipients with
  // active listings still open. Absent on success.
  eligible_listings?: EligibleListing[];
  // Present on success when close_active_listings actually triggered a
  // cascade; otherwise [].
  closed_listing_ids?: string[];
}

interface EmployerTeamResponse extends FetchResponse {
  users: EmployerTeamMember[];
}

interface EmployerTeamMemberResponse extends FetchResponse {
  user: EmployerTeamMember;
}

export const EmployerUserService = {
  // ── Self-service ────────────────────────────────────────────────────

  async getMe() {
    return employerUsersControllerGetMe() as unknown as Promise<EmployerSelfResponse>;
  },

  async updateMe(data: {
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;
  }) {
    return employerUsersControllerUpdateMe(
      data,
    ) as unknown as Promise<EmployerSelfResponse>;
  },

  async updateMyNotifications(
    receives_applicant_digest: boolean,
    close_active_listings?: boolean,
  ) {
    return employerUsersControllerUpdateMyNotifications({
      receives_applicant_digest,
      close_active_listings,
    }) as unknown as Promise<UpdateNotificationsResponse>;
  },

  // ── Team management (ADMIN) ────────────────────────────────────────

  async getTeam() {
    return employerUsersControllerListTeam() as unknown as Promise<EmployerTeamResponse>;
  },

  async invite(email: string, role: EmployerUserRole) {
    return employerUsersControllerInvite({
      email,
      role: role as unknown as import("./generated/models").InviteEmployerUserDtoRole,
    }) as unknown as Promise<EmployerTeamMemberResponse>;
  },

  async resendInvite(userId: string) {
    return employerUsersControllerResendInvite(
      userId,
    ) as unknown as Promise<FetchResponse>;
  },

  async changeRole(userId: string, role: EmployerUserRole) {
    return employerUsersControllerChangeRole(userId, {
      role: role as unknown as import("./generated/models").UpdateEmployerUserRoleDtoRole,
    }) as unknown as Promise<EmployerTeamMemberResponse>;
  },

  async deactivateMember(userId: string) {
    return employerUsersControllerDeactivate(
      userId,
    ) as unknown as Promise<EmployerTeamMemberResponse>;
  },

  async reactivateMember(userId: string) {
    return employerUsersControllerReactivate(
      userId,
    ) as unknown as Promise<EmployerTeamMemberResponse>;
  },

  async updateMemberNotifications(
    userId: string,
    receives_applicant_digest: boolean,
  ) {
    return employerUsersControllerUpdateMemberNotifications(userId, {
      receives_applicant_digest,
    }) as unknown as Promise<EmployerTeamMemberResponse>;
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
  error?: string;
  hash?: string;
}

interface SignedFileUrlResponse extends FetchResponse {
  url?: string;
}

export const AuthService = {
  async register(user: Partial<PublicUser>) {
    return authControllerRegister(
      user as unknown as RegisterUserDto,
    ) as unknown as Promise<AuthResponse>;
  },

  // whether the browser holds a valid registration cookie (set by the OAuth callback)
  async registerStatus() {
    return authControllerRegisterStatus() as unknown as Promise<ResourceHashResponse>;
  },

  async requestActivation(email: string) {
    return authControllerRequestActivation({
      email,
    }) as unknown as Promise<ResourceHashResponse>;
  },

  async activate(email: string, otp: string) {
    return authControllerActivateAccount({
      email,
      otp,
    }) as unknown as Promise<ResourceHashResponse>;
  },

  async logout() {
    await authControllerSignOut();
    clearSessionHint();
  },
};
interface UserResponse extends FetchResponse {
  user: PublicUser;
}

interface StudentResponse extends FetchResponse {
  users: User[];
}

interface SaveJobResponse extends FetchResponse {
  job?: Job;
  success: boolean;
  message: string;
}

interface JoinFormGroupResponse extends FetchResponse {
  success: boolean;
  message?: string;
}

export type ApproveSignatoryRequest = {
  pendingDocumentId: string;
  signatoryName: string;
  signatoryTitle: string;
  party: "student" | "entity" | "student-guardian" | "university";
  values?: Record<string, string>;
};

export type ApproveSignatoryResponse = {
  message?: string;
  signedDocumentId?: string;
  signedDocumentUrl?: string;
  [k: string]: any;
};

export type UploadSignatureImageResponse = {
  success?: boolean;
  message?: string;
  value?: string;
  asset?: {
    filename: string;
    url: string;
    mimeType: string;
    sizeBytes: number;
  };
};

/**
 * `poll` fn for `<MQJobsProvider>` (`@betterinternship/components`) — the
 * package knows no URL or response envelope, so this adapts Career-Server's
 * `{success, job, message}` wrapper into the bare job the hook expects.
 */
export const pollMqJob = async (jobId: string): Promise<MqJobDto> => {
  const response = await FormService.getMqJob(jobId);
  if (!response.success || !response.job)
    throw new Error(response.message ?? "Job not found.");
  return response.job;
};

export const FormService = {
  async uploadSignatureImage(data: {
    source: "draw" | "upload";
    dataUrl: string;
  }) {
    return usersControllerUploadSignatureImage(
      data,
    ) as unknown as Promise<UploadSignatureImageResponse>;
  },

  async initiateForm(data: {
    formName: string;
    formVersion: number;
    values: Record<string, string>;
    audit: any;
  }) {
    // Docs-Server now queues this (docs-signing RabbitMQ migration plan §6.2)
    // and returns `{ success, jobId }` — poll it via `getMqJob` below.
    return usersControllerInitiateForm(
      data,
    ) as unknown as Promise<MqJobQueuedResponse>;
  },

  async filloutForm(data: {
    formName: string;
    formVersion: number;
    values: Record<string, string>;
    disableEsign?: boolean;
  }) {
    // The server's body class has no `audit` or `disableEsign` field; the old
    // client sent `data` as given, which is what this still does.
    return usersControllerFilloutForm(
      data as unknown as InitiateFormDto,
    ) as unknown as Promise<MqJobQueuedResponse>;
  },

  async getMqJob(jobId: string) {
    return usersControllerGetMqJob(jobId) as unknown as Promise<MqJobResponse>;
  },

  async getMyFormTemplates() {
    const response = (await usersControllerGetMyFormTemplates()) as unknown as {
      formGroupDescription: string;
      formTemplates: FormTemplate[];
    };
    return response;
  },

  async getMyGeneratedForms() {
    const { forms } =
      (await usersControllerGetMyGeneratedForms()) as unknown as {
        forms: {
          form_label: string | null;
          form_name: string;
          form_process_id: string;
          form_process_status: string | null;
          timestamp: string;
          form_processes: {
            prefilled_document_id?: string;
            pending_document_id?: string;
            signed_document_id?: string;
            latest_document_url?: string;
            signing_parties?: IFormSigningParty[];
            rejection_reason?: string;
          };
        }[];
      };
    return forms ?? [];
  },

  async getForm(formName: string) {
    const form = (await usersControllerGetMyFormTemplate({
      name: formName,
    })) as unknown as {
      formTemplate: {
        name: string;
        label: string;
        version: number;
        base_document_id: string;
      };
      formMetadata: IFormMetadata;
      documentUrl: string;
    } & FetchResponse;
    return form;
  },

  async resendForm(formProcessId: string) {
    const form = (await usersControllerResendForm({
      formProcessId,
    })) as unknown as FetchResponse;
    return form;
  },

  async cancelForm(formProcessId: string) {
    const form = (await usersControllerCancelForm({
      formProcessId,
    })) as unknown as FetchResponse;
    return form;
  },
};

// Shape the resume endpoints actually put on the wire — narrower than the DB's
// `Resume` (Selectable<CareerResumes>) type, which has a `Date`-typed `uploaded_at`
// and requires `is_deleted`/`user_id` that the API never sends here.
export interface ResumeDTO {
  id: string;
  label: string;
  filename: string;
  uploaded_at: string;
}

interface UploadResumeResponse {
  resume: ResumeDTO;
  default_resume?: string;
  success?: boolean;
  message?: string;
}

interface ResumeArrayResponse {
  resumes: ResumeDTO[];
  default_resume: string | null;
  success?: boolean;
  message?: string;
}

interface DefaultResumeResponse extends FetchResponse {
  default_resume: string;
}

export const UserService = {
  async getMyProfile(options: RequestInit = {}) {
    const result = (await usersControllerSelf(
      options,
    )) as unknown as UserResponse;
    // Keep the browser's session hint in step with what the API just said
    // (session-hint.ts). A failure of any kind clears it: a stale hint is
    // cheap, but one that never clears would keep asking.
    if (result?.success && result.user) setSessionHint();
    else clearSessionHint();
    return result;
  },

  async updateMyProfile(data: Partial<PublicUser>) {
    return usersControllerUpdateSelf(
      data as unknown as UpdateUserDto,
    ) as unknown as Promise<UserResponse>;
  },

  async joinFormGroup(code: string) {
    return usersControllerJoinFormGroup({
      code,
    }) as unknown as Promise<JoinFormGroupResponse>;
  },

  async correctFormRecipient(eventId: string, recipientEmail: string) {
    return usersControllerCorrectFormRecipient({
      eventId,
      recipientEmail,
    }) as unknown as Promise<FetchResponse>;
  },

  async getCorrectFormRecipientContext(eventId: string) {
    return usersControllerGetCorrectFormRecipientContext({
      eventId,
    }) as unknown as Promise<
      FetchResponse & {
        context?: {
          eventId: string;
          formLabel: string;
          signingPartyTitle: string;
          oldEmail: string;
          targetSigningPartyId: string;
          signingParties: {
            id: string;
            title: string;
            email: string;
          }[];
        };
      }
    >;
  },

  async getMyResumes() {
    return usersControllerMyResumes() as unknown as Promise<ResumeArrayResponse>;
  },

  async getMyResumeURL(resumeId: string) {
    return usersControllerMyResumeUrl(
      resumeId,
    ) as unknown as Promise<SignedFileUrlResponse>;
  },

  async getMyPfpURL() {
    return usersControllerMyPfp() as unknown as Promise<ResourceHashResponse>;
  },

  async getUserPfpURL(userId: string) {
    return usersControllerPfpById(
      userId,
    ) as unknown as Promise<ResourceHashResponse>;
  },

  async updateMyPfp(file: FormData) {
    // Same pass-through as EmployerService.updateMyPfp: the caller builds the
    // FormData (field name and all), so it goes out as-is rather than through
    // the generated wrapper, which would rebuild it under its own field name.
    return careerFetch<ResourceHashResponse>(
      getUsersControllerUpdateLogoUrl(),
      { method: "PUT", body: file },
    );
  },

  async getUserResumeURL(userId: string, resumeId: string) {
    return usersControllerResumeUrlById(
      userId,
      resumeId,
    ) as unknown as Promise<SignedFileUrlResponse>;
  },

  async uploadMyResume(form: FormData) {
    // Pass-through again: the caller's FormData carries the file and its label.
    return careerFetch<UploadResumeResponse>(
      getUsersControllerUploadResumeUrl(),
      { method: "PUT", body: form },
    );
  },

  async updateMyResume(resumeId: string, label: string) {
    return usersControllerUpdateResume(resumeId, {
      label: label,
    }) as unknown as Promise<UploadResumeResponse>;
  },

  async setDefaultResume(resumeId: string) {
    return usersControllerSetDefaultResume({
      resume_id: resumeId,
    }) as unknown as Promise<DefaultResumeResponse>;
  },

  async deleteMyResume(resumeId: string) {
    return usersControllerDeleteResume(
      resumeId,
    ) as unknown as Promise<UploadResumeResponse>;
  },

  async saveJob(jobId: string) {
    return usersControllerToggleSaveJob({
      id: jobId,
    }) as unknown as Promise<SaveJobResponse>;
  },

  async getUserById(userId: string): Promise<StudentResponse> {
    return usersControllerUserById(
      userId,
    ) as unknown as Promise<StudentResponse>;
  },
};

// Job Services
interface JobResponse extends FetchResponse {
  job: Job;
}

interface JobsResponse extends FetchResponse {
  jobs?: Job[];
}

interface JobSearchResponse extends FetchResponse {
  jobs?: Job[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface JobSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  mode?: string[];
  workload?: string[];
  position?: string[];
  allowance?: string[];
  moa?: string[];
  university?: string;
}

interface SavedJobsResponse extends FetchResponse {
  jobs?: SavedJob[];
}

interface OwnedJobsResponse extends FetchResponse {
  jobs: Job[];
}

interface WaitlistedJobsResponse extends FetchResponse {
  waitlisted?: JobWaitlist[];
}

interface DeactivateBulkResponse extends FetchResponse {
  job_ids: string[];
}

export interface ShareLinkResponse extends FetchResponse {
  url?: string;
}

// Short links (/l/<slug>) resolve to the page they stand for.
export const LinkService = {
  async resolve(slug: string, options: RequestInit = {}) {
    return linksControllerResolve(slug, options);
  },
};

export const JobService = {
  // `options` lets server components pass Next's `{ next: { revalidate } }`.
  async getAllJobs(options: RequestInit = {}) {
    return jobsControllerFindAllListed(
      options,
    ) as unknown as Promise<JobsResponse>;
  },

  async searchJobs(params: JobSearchParams = {}) {
    const join = (values?: string[]) =>
      values?.length ? values.join(",") : undefined;

    return jobsControllerSearch({
      page: params.page,
      limit: params.limit,
      // The old APIRouteBuilder dropped empty-string params entirely; the
      // generated URL builder only drops undefined, so an empty search is
      // normalized here to keep that same query string.
      search: params.search || undefined,
      mode: join(params.mode),
      workload: join(params.workload),
      position: join(params.position),
      allowance: join(params.allowance),
      moa: join(params.moa),
      university: params.university || undefined,
    }) as unknown as Promise<JobSearchResponse>;
  },

  // !! this only fetches an *active* job.
  async getJobById(jobId: string) {
    return jobsControllerFindOneActive(
      jobId,
    ) as unknown as Promise<JobResponse>;
  },

  // sorry for confusing name
  // the one above existed prior and i don't want to break anything that depends on it
  // this one gets a single job, whether it is active or not.
  async getAnyJobById(jobId: string) {
    return jobsControllerFindOne(jobId) as unknown as Promise<JobResponse>;
  },

  async getSavedJobs() {
    return jobsControllerGetSaved() as unknown as Promise<SavedJobsResponse>;
  },

  async getOwnedJobs() {
    return jobsControllerGetOwned() as unknown as Promise<OwnedJobsResponse>;
  },

  async createJob(job: Partial<Job>) {
    // The generated DTO requires the core listing fields; the old facade
    // accepted any partial job object, same as the rest of this batch's
    // request-side casts (see the batch's plan notes on Date-vs-string too).
    return jobsControllerCreate(
      job as unknown as CreateJobDto,
    ) as unknown as Promise<FetchResponse>;
  },

  async createSuperJob(job: CreateJobChallengeListingPayload) {
    return jobsControllerCreateSuper(
      job as unknown as CreateJobChallengeListingDto,
    ) as unknown as Promise<FetchResponse>;
  },

  async updateJob(jobId: string, job: UpdateJobChallengeListingPayload) {
    return jobsControllerUpdate(
      jobId,
      job as unknown as UpdateJobDto,
    ) as unknown as Promise<FetchResponse>;
  },

  async deleteJob(jobId: string) {
    return jobsControllerDelete(jobId) as unknown as Promise<FetchResponse>;
  },

  async unpauseJob(jobId: string) {
    return jobsControllerUnpause(jobId) as unknown as Promise<FetchResponse>;
  },

  async unpauseAllJobs() {
    return jobsControllerUnpauseAll() as unknown as Promise<FetchResponse>;
  },

  async deactivateBulk(jobIds: string[]) {
    return jobsControllerDeactivateBulk({
      job_ids: jobIds,
    }) as unknown as Promise<DeactivateBulkResponse>;
  },

  async joinWaitlist(jobId: string) {
    return jobsControllerJoinWaitlist(
      jobId,
    ) as unknown as Promise<FetchResponse>;
  },

  async leaveWaitlist(jobId: string) {
    return jobsControllerLeaveWaitlist(
      jobId,
    ) as unknown as Promise<FetchResponse>;
  },

  async getWaitlistedJobs() {
    return jobsControllerGetWaitlisted() as unknown as Promise<WaitlistedJobsResponse>;
  },

  async mintShareLink(jobId: string) {
    return jobsControllerShareLink(
      jobId,
    ) as unknown as Promise<ShareLinkResponse>;
  },
};

// Application Services
interface UserApplicationsResponse extends FetchResponse {
  applications: UserApplication[];
}

interface EmployerApplicationsResponse extends FetchResponse {
  applications: EmployerApplication[];
}

interface CreateApplicationResponse extends FetchResponse {
  application: UserApplication;
}

export const ApplicationService = {
  // GET /applications reads no query parameters, so the paging and status
  // filters this used to accept were never applied and are no longer sent.
  async getApplications(
    _params: {
      page?: number;
      limit?: number;
      status?: string;
    } = {},
  ) {
    // The generated model types dates as the strings they are on the wire;
    // UserApplication (db.types) types them as Date. The facade keeps its old
    // return type until callers move to the generated models.
    return applicationsControllerGetOwn() as unknown as Promise<UserApplicationsResponse>;
  },

  async createApplication(data: {
    job_id: string;
    resume_id: string;
    challenge_submission?: string;
    source?: "mass";
    // Attribution for an apply made from a Top page (plan D20).
    top_page_id?: string;
    // The university whose Top page link (/<university>/top/<slug>) the
    // apply came from.
    top_page_university_id?: string;
  }) {
    // Same Date-vs-string difference as getApplications above.
    return applicationsControllerCreate(
      data,
    ) as unknown as Promise<CreateApplicationResponse>;
  },

  async getEmployerApplications(): Promise<EmployerApplicationsResponse> {
    return employersControllerApplicants() as unknown as Promise<EmployerApplicationsResponse>;
  },

  async reviewApplication(
    id: string,
    review_options: {
      review?: string;
      notes?: string;
      status?: number;
      acceptance_message?: string;
    },
  ): Promise<FetchResponse> {
    return applicationsControllerUpdate(id, review_options);
  },

  async markApplicationViewed(id: string): Promise<FetchResponse> {
    return applicationsControllerMarkViewed(id);
  },
};

// Error handling utility
export const handleApiError = (error: any) => {
  console.error("API Error:", error);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (error.message === "Unauthorized") {
    // Already handled by apiClient
    return;
  }

  // ! Show toast notifications here
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return error.message || "An unexpected error occurred";
};

// update application status
export const updateApplicationStatus = async (
  id: string,
  newStatus: number,
) => {
  try {
    console.log(`Updating application ${id} to status ${newStatus}`);
    const response = await ApplicationService.reviewApplication(id, {
      status: newStatus,
    });

    console.log("API Response: ", response);
    return response;
  } catch (error: any) {
    console.error("Error updating application" + id + ". " + error);
    throw error;
  }
};
