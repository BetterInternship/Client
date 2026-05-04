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
  CareerMoa as _Moa,
  CareerUsers,
  CareerEmployers,
  CareerConversations,
  CareerEmployerUsers,
  CareerJobs,
  CareerApplications,
  CareerSavedJobs,
  CareerResumes,
} from "@betterinternship/schema.base";
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
export type Moa = Selectable<_Moa>;
export type Resume = Selectable<CareerResumes>;
export type PrivateUser = Selectable<CareerUsers>;
export type PublicUser = Omit<
  PrivateUser,
  "verification_hash" | "internship_preferences"
> & {
  internship_preferences?: InternshipPreferences;
};
export type Employer = Partial<Selectable<CareerEmployers>>;
export type User = Partial<Selectable<CareerUsers>>;
export interface Conversation extends Selectable<CareerConversations> {
  employers?: Partial<Employer>;
  employer?: Partial<Employer>;
  users?: Partial<PublicUser>;
  user?: Partial<PublicUser>;
}
export type PrivateEmployerUser = Selectable<CareerEmployerUsers>;
export type PublicEmployerUser = Omit<PrivateEmployerUser, "is_deactivated">;

export interface Job extends Omit<
  Partial<Selectable<CareerJobs>>,
  "internship_preferences"
> {
  employer?: Partial<Employer>;
  employers?: Partial<Employer>;
  challenge?: Partial<JobChallenge> | null;
  internship_preferences?: ListingInternshipPreferences;
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
  require_cover_letter?: boolean | null;
};

export interface RefDomain {
  id: string;
  name: string;
  university_id: string;
}

export interface RefsData {
  colleges: College[];
  departments: Department[];
  universities: University[];
  job_types: JobType[];
  job_modes: JobMode[];
  job_allowances: JobAllowance[];
  job_categories: JobCategory[];
  job_pay_freq: JobPayFreq[];
  app_statuses: AppStatus[];
  industries: Industry[];
  domains: RefDomain[];
}

export interface IRefsContext extends RefsData {
  ref_loading: boolean;

  get_college: (id: string | null | undefined) => College | null;
  to_college_name: (
    id: string | null | undefined,
    def?: string | null,
  ) => string | null;
  get_college_by_name: (name: string | null | undefined) => College | null;

  get_university: (id: string | null | undefined) => University | null;
  to_university_name: (
    id: string | null | undefined,
    def?: string | null,
  ) => string | null;
  get_university_by_name: (
    name: string | null | undefined,
  ) => University | null;

  get_job_type: (id: number | null | undefined) => JobType | null;
  to_job_type_name: (
    id: number | null | undefined,
    def?: string | null,
  ) => string | null;
  get_job_type_by_name: (name: string | null | undefined) => JobType | null;

  get_job_mode: (id: number | null | undefined) => JobMode | null;
  to_job_mode_name: (
    id: number | null | undefined,
    def?: string | null,
  ) => string | null;
  get_job_mode_by_name: (name: string | null | undefined) => JobMode | null;

  get_job_allowance: (id: number | null | undefined) => JobAllowance | null;
  to_job_allowance_name: (
    id: number | null | undefined,
    def?: string | null,
  ) => string | null;
  get_job_allowance_by_name: (
    name: string | null | undefined,
  ) => JobAllowance | null;

  get_job_pay_freq: (id: number | null | undefined) => JobPayFreq | null;
  to_job_pay_freq_name: (
    id: number | null | undefined,
    def?: string | null,
  ) => string | null;
  get_job_pay_freq_by_name: (
    name: string | null | undefined,
  ) => JobPayFreq | null;

  get_app_status: (id: number | null | undefined) => AppStatus | null;
  to_app_status_name: (
    id: number | null | undefined,
    def?: string | null,
  ) => string | null;
  get_app_status_by_name: (name: string | null | undefined) => AppStatus | null;

  get_industry: (id: string | null | undefined) => Industry | null;
  to_industry_name: (
    id: string | null | undefined,
    def?: string | null,
  ) => string | null;
  get_industry_by_name: (name: string | null | undefined) => Industry | null;

  get_job_category: (id: string | null | undefined) => JobCategory | null;
  to_job_category_name: (
    id: string | null | undefined,
    def?: string | null,
  ) => string | null;
  get_job_category_by_name: (
    name: string | null | undefined,
  ) => JobCategory | null;

  get_department: (id: string | null | undefined) => Department | null;
  to_department_name: (
    id: string | null | undefined,
    def?: string | null,
  ) => string | null;
  get_department_by_name: (
    name: string | null | undefined,
  ) => Department | null;

  get_departments_by_college: (college_id: string) => string[];
  get_colleges_by_university: (university_id: string) => string[];
  getUniversityFromDomain: (domain: string) => string[];
  isNotNull: (ref: any) => boolean;
}
