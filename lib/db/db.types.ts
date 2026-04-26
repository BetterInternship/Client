import {
  DB,
  RefColleges,
  RefJobAllowances,
  RefJobCategories,
  RefJobModes,
  RefJobTypes,
  RefUniversities,
  JobsChallenge,
  RefJobPayFreq,
  RefAppStatuses,
  RefIndustries,
  RefDepartments,
  Moa as _Moa,
  Users,
  Employers,
  Conversations,
  EmployerUsers,
  Jobs,
  Applications,
  SavedJobs,
} from "@betterinternship/schema.base";
import { Selectable } from "kysely";

export type Database = DB;
export type College = Selectable<RefColleges>;
export type University = Selectable<RefUniversities>;
export type JobType = Selectable<RefJobTypes>;
export type JobAllowance = Selectable<RefJobAllowances>;
export type JobCategory = Selectable<RefJobCategories>;
export type JobPayFreq = Selectable<RefJobPayFreq>;
export type JobMode = Selectable<RefJobModes>;
export type JobChallenge = Selectable<JobsChallenge>;
export type AppStatus = Selectable<RefAppStatuses>;
export type Industry = Selectable<RefIndustries>;
export type Department = Selectable<RefDepartments>;
export type Moa = Selectable<_Moa>;
export type PrivateUser = Selectable<Users>;
export type PublicUser = Omit<
  PrivateUser,
  "verification_hash" | "internship_preferences"
> & {
  internship_preferences?: InternshipPreferences;
};
export type Employer = Partial<Selectable<Employers>>;
export type User = Partial<Selectable<Users>>;
export interface Conversation extends Selectable<Conversations> {
  employers?: Partial<Employer>;
  employer?: Partial<Employer>;
  users?: Partial<PublicUser>;
  user?: Partial<PublicUser>;
}
export type PrivateEmployerUser = Selectable<EmployerUsers>;
export type PublicEmployerUser = Omit<PrivateEmployerUser, "is_deactivated">;

export interface Job extends Omit<
  Partial<Selectable<Jobs>>,
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

export interface UserApplication extends Partial<Selectable<Applications>> {
  job?: Partial<Job>;
  jobs?: Partial<Job>;
  employer?: Partial<Employer>;
  employers?: Partial<Employer>;
}

export interface EmployerApplication extends Partial<Selectable<Applications>> {
  job?: Partial<Job>;
  jobs?: Partial<Job>;
  user?: Partial<PrivateUser>;
  users?: Partial<PrivateUser>;
  challenge_submission?: string | null;
}

export interface SavedJob extends Partial<Selectable<SavedJobs>> {
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
