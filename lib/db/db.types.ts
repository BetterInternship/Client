import { Database as _Database, Tables } from "./db.base-types.js";

export type Database = _Database;
export type Level = Tables<"ref_levels">;
export type College = Tables<"ref_colleges">;
export type University = Tables<"ref_universities">;
export type JobType = Tables<"ref_job_types">;
export type JobAllowance = Tables<"ref_job_allowances">;
export type JobCategory = Tables<"ref_job_categories">;
export type JobPayFreq = Tables<"ref_job_pay_freq">;
export type JobMode = Tables<"ref_job_modes">;
export type AppStatus = Tables<"ref_app_statuses">;
export type Industry = Tables<"ref_industries">;
export type Department = Tables<"ref_departments">;
export type Degree = Tables<"ref_degrees">;
export type Moa = Tables<"moa">;
export type PrivateUser = Tables<"users">;
export type PublicUser = Omit<Tables<"users">, "verification_hash">;
export type Employer = Partial<Tables<"employers">>;
export interface Conversation extends Tables<"conversations"> {
  employers?: Partial<Employer>;
  employer?: Partial<Employer>;
  users?: Partial<PublicUser>;
  user?: Partial<PublicUser>;
}
export type PrivateEmployerUser = Tables<"employer_users">;
export type PublicEmployerUser = Omit<
  Tables<"employer_users">,
  "is_deactivated"
>;
export interface MoA extends Partial<Tables<"moa">> {}

export interface Job extends Partial<Tables<"jobs">> {
  employer?: Partial<Employer>;
  employers?: Partial<Employer>;
}

export interface UserApplication extends Partial<Tables<"applications">> {
  job?: Partial<Job>;
  jobs?: Partial<Job>;
  employer?: Partial<Employer>;
  employers?: Partial<Employer>;
}

export interface EmployerApplication extends Partial<Tables<"applications">> {
  job?: Partial<Job>;
  jobs?: Partial<Job>;
  user?: Partial<PrivateUser>;
  users?: Partial<PrivateUser>;
}

export interface SavedJob extends Partial<Tables<"saved_jobs">> {
  job?: Partial<Job>;
  jobs?: Partial<Job>;
}
