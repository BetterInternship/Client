import {
  DB,
  CareerRefColleges,
  CareerRefJobAllowances,
  CareerRefJobCategories,
  CareerRefJobModes,
  CareerRefJobTypes,
  CareerRefUniversities,
  CareerJobsChallenge,
  CareerRefJobPayFreq,
  CareerRefAppStatuses,
  CareerRefIndustries,
  CareerRefDepartments,
  CareerUsers,
  CareerEmployers,
  CareerEmployerUsers,
  CareerJobs,
  CareerApplications,
  CareerSavedJobs,
  CareerResumes,
} from "@betterinternship/schema";
import { Selectable } from "kysely";

export type Database = DB;
export type College = Selectable<CareerRefColleges>;
export type University = Selectable<CareerRefUniversities>;
export type JobType = Selectable<CareerRefJobTypes>;
export type JobAllowance = Selectable<CareerRefJobAllowances>;
export type JobCategory = Selectable<CareerRefJobCategories>;
export type JobPayFreq = Selectable<CareerRefJobPayFreq>;
export type JobMode = Selectable<CareerRefJobModes>;
export type JobChallenge = Selectable<CareerJobsChallenge>;
export type AppStatus = Selectable<CareerRefAppStatuses>;
export type Industry = Selectable<CareerRefIndustries>;
export type Department = Selectable<CareerRefDepartments>;
export type Resume = Selectable<CareerResumes>;
export type PrivateUser = Selectable<CareerUsers>;
export type PublicUser = Omit<
  PrivateUser,
  "verification_hash" | "internship_preferences"
> & {
  internship_preferences?: InternshipPreferences;
  signatureImage?: string | null;
};
// tin is hand-added: the installed @betterinternship/schema package here is
// pinned well behind the one API-Server/IOM-Server use and lacks the column
// (Docs/plans/CAREER_IOM_LINK_IMPLEMENTATION_PLAN.md §5-6) — the API already
// returns it on GET /employer/me, this just types what's already on the wire.
export type Employer = Partial<Selectable<CareerEmployers>> & {
  tin?: string | null;
  iom_company_id?: string | null;
  iom_account_email?: string | null;
  // God-only: employer_users rows for this employer, joined server-side
  // (GET /god/employers only — not a real employers column).
  team_emails?: { email: string; receives_applicant_digest: boolean }[] | null;
  // God-only: computed via a joined subquery (Career-Server gods.service.ts) —
  // not real employers columns either.
  last_session?: { owner_id: string; timestamp: Date | string } | null;
  application_count?: number | string | null;
};
export type User = Partial<Selectable<CareerUsers>>;
export type PrivateEmployerUser = Selectable<CareerEmployerUsers>;
export type PublicEmployerUser = Omit<PrivateEmployerUser, "is_deactivated">;

// Employer team accounts (Docs/plans/EMPLOYER_TEAM_ACCOUNTS_IMPLEMENTATION_PLAN.md).
// receives_applicant_digest/role(-casing)/status/is_owner are hand-added: the
// installed @betterinternship/schema package here is pinned at 0.0.0, well
// behind the one API-Server uses, and predates all of these — same reason
// `tin` is hand-added on Employer above. The API already returns them; this
// just types what's already on the wire. role is uppercase on every
// employer-users response (never the raw lowercase DB value).
export type EmployerUserRole = "ADMIN" | "MEMBER";
export type EmployerUserTeamStatus = "Pending" | "Disabled" | "Active";

export interface EmployerSelf extends Omit<PublicEmployerUser, "role"> {
  role: EmployerUserRole;
  is_owner: boolean;
  receives_applicant_digest: boolean;
  // Live teammates, excluding self, with the digest flag on
  // (Docs/plans/DIGEST_UNSUBSCRIBE_MODAL_PLAN.md §6.2) — lets the
  // Notifications tab know whether turning its own flag off would be the
  // last one, without the ADMIN-only listTeam endpoint.
  other_subscribed_recipients: number;
}

export interface EmployerTeamMember extends Omit<PrivateEmployerUser, "role"> {
  role: EmployerUserRole;
  is_owner: boolean;
  receives_applicant_digest: boolean;
  status: EmployerUserTeamStatus;
  // MAX(sessions.timestamp) WHERE subaccount_id = this user (plan D19). Null
  // pre-deploy or if they've never signed in since.
  last_active: string | null;
}

export type JobPauseReason = "dormant" | "unresponsive" | "neglected";
export type JobWaitlistRemovalReason = "notified" | "left" | "listing_deleted";

export interface Job extends Omit<
  Partial<Selectable<CareerJobs>>,
  "internship_preferences"
> {
  employer?: Partial<Employer>;
  employers?: Partial<Employer>;
  challenge?: Partial<JobChallenge> | null;
  internship_preferences?: ListingInternshipPreferences;
  // Last day applications are accepted (ms timestamp). Not a column on `jobs`
  // yet — the create form sends it only when the employer sets one.
  application_deadline?: number | null;
  // Merged in by the API from career.job_pauses — not columns on `jobs` itself.
  // Owner-only (from GET /jobs/owned): the reason/date behind the pause.
  paused?: boolean;
  pause_reason?: JobPauseReason | null;
  paused_at?: string | null;
  // Owner-only (from GET /jobs/owned): students currently waiting on this listing.
  waiting_count?: number | null;
  // Public annotation on every jobs endpoint — never carries the reason/date
  // (see paused_at/pause_reason above, which stay owner-only).
  hibernating?: boolean | null;
  // Computed server-side from the IOM chain, scoped to the viewer's own
  // university (career.moa is retired — plan §2.2). false/omitted when
  // anonymous or the viewer has no resolvable university.
  has_moa?: boolean | null;
}

// A student's waitlist ("job alert") episode row, as returned by
// GET /jobs/waitlisted. Display/dedupe logic lives client-side — see
// useWaitlistsData in student.data.api.ts.
export interface JobWaitlist {
  id: string;
  job_id: string;
  created_at: string;
  removed_at: string | null;
  removal_reason: JobWaitlistRemovalReason | null;
  notified_at: string | null;
  job: {
    id: string;
    title: string | null;
    is_active: boolean | null;
    is_deleted: boolean | null;
    hibernating: boolean;
    employer: { id: string; name: string | null } | null;
  };
}

export type JobChallengePayload = {
  title: string;
  description?: string | null;
};

export type CreateJobChallengeListingPayload = Partial<Job> & {
  challenge: JobChallengePayload;
};

export type UpdateJobChallengeListingPayload = Partial<Job> & {
  challenge?: JobChallengePayload | Partial<JobChallenge> | null;
};

export interface UserApplication extends Partial<
  Selectable<CareerApplications>
> {
  job?: Partial<Job>;
  jobs?: Partial<Job>;
  employer?: Partial<Employer>;
  employers?: Partial<Employer>;
  resume?: Partial<Resume>;
}

export interface EmployerApplication extends Partial<
  Selectable<CareerApplications>
> {
  job?: Partial<Job>;
  jobs?: Partial<Job>;
  user?: Partial<PrivateUser>;
  users?: Partial<PrivateUser>;
  resume_id: string;
  challenge_submission?: string | null;
}

export interface SavedJob extends Partial<Selectable<CareerSavedJobs>> {
  job?: Partial<Job>;
  jobs?: Partial<Job>;
}

// Preferences set by student accounts for which listings they'd prefer
export type InternshipPreferences = {
  job_setup_ids?: string[];
  internship_type?: "credited" | "voluntary";
  job_category_ids?: string[];
  job_commitment_ids?: string[];
  expected_start_date?: number | null;
  expected_duration_hours?: number | null;
};

// These are preferences set by the employer for which applicants jobs are tailored for
export type ListingInternshipPreferences = {
  internship_types?: ("credited" | "voluntary")[];
  job_setup_ids?: number[];
  job_category_ids?: string[];
  job_commitment_ids?: number[];
  expected_start_date?: number | null; // If this is null, it means as soon as possible
  require_github?: boolean | null;
  require_portfolio?: boolean | null;
};

// Server-rendered into every page by the student and hire layouts.
export interface JobRefsData {
  job_types: JobType[];
  job_modes: JobMode[];
  job_allowances: JobAllowance[];
  job_categories: JobCategory[];
  job_pay_freq: JobPayFreq[];
  app_statuses: AppStatus[];
  industries: Industry[];
}

// Fetched in the browser from /api/refs/schools.
export interface SchoolsRefsData {
  colleges: College[];
  departments: Department[];
  universities: University[];
}

export type RefsData = JobRefsData & SchoolsRefsData;

export interface IRefsContext extends RefsData {
  refLoading: boolean;

  getCollege: (id: string | null | undefined) => College | null;
  toCollegeName: (
    id: string | null | undefined,
    def?: string | null,
  ) => string | null;
  getCollegeByName: (name: string | null | undefined) => College | null;

  getUniversity: (id: string | null | undefined) => University | null;
  toUniversityName: (
    id: string | null | undefined,
    def?: string | null,
  ) => string | null;
  getUniversityByName: (name: string | null | undefined) => University | null;

  getJobType: (id: number | null | undefined) => JobType | null;
  toJobTypeName: (
    id: number | null | undefined,
    def?: string | null,
  ) => string | null;
  getJobTypeByName: (name: string | null | undefined) => JobType | null;

  getJobMode: (id: number | null | undefined) => JobMode | null;
  toJobModeName: (
    id: number | null | undefined,
    def?: string | null,
  ) => string | null;
  getJobModeByName: (name: string | null | undefined) => JobMode | null;

  getJobAllowance: (id: number | null | undefined) => JobAllowance | null;
  toJobAllowanceName: (
    id: number | null | undefined,
    def?: string | null,
  ) => string | null;
  getJobAllowanceByName: (
    name: string | null | undefined,
  ) => JobAllowance | null;

  getJobPayFreq: (id: number | null | undefined) => JobPayFreq | null;
  toJobPayFreqName: (
    id: number | null | undefined,
    def?: string | null,
  ) => string | null;
  getJobPayFreqByName: (name: string | null | undefined) => JobPayFreq | null;

  getAppStatus: (id: number | null | undefined) => AppStatus | null;
  toAppStatusName: (
    id: number | null | undefined,
    def?: string | null,
  ) => string | null;
  getAppStatusByName: (name: string | null | undefined) => AppStatus | null;

  getIndustry: (id: string | null | undefined) => Industry | null;
  toIndustryName: (
    id: string | null | undefined,
    def?: string | null,
  ) => string | null;
  getIndustryByName: (name: string | null | undefined) => Industry | null;

  getJobCategory: (id: string | null | undefined) => JobCategory | null;
  toJobCategoryName: (
    id: string | null | undefined,
    def?: string | null,
  ) => string | null;
  getJobCategoryByName: (name: string | null | undefined) => JobCategory | null;

  getDepartment: (id: string | null | undefined) => Department | null;
  toDepartmentName: (
    id: string | null | undefined,
    def?: string | null,
  ) => string | null;
  getDepartmentByName: (name: string | null | undefined) => Department | null;

  isNotNull: (ref: any) => boolean;
}
