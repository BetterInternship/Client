/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-15 03:09:57
 * @ Modified time: 2026-04-30 01:43:35
 * @ Description:
 *
 * Server-only data loaders for refs tables.
 */

import "server-only";
import {
  College,
  University,
  JobType,
  JobMode,
  JobAllowance,
  JobPayFreq,
  AppStatus,
  Industry,
  JobCategory,
  Department,
} from "./db.types";
import { DB } from "@betterinternship/schema.base";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) throw new Error("[ERROR:ENV] Missing database url.");

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: DATABASE_URL,
    }),
  }),
});

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

// Setup the context
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

  get_degree: (id: string | null | undefined) => Degree | null;
  to_degree_name: (
    id: string | null | undefined,
    def?: string | null,
  ) => string | null;
  get_degree_by_name: (name: string | null | undefined) => Degree | null;

  get_departments_by_college: (college_id: string) => string[];
  get_colleges_by_university: (university_id: string) => string[];
  get_degrees_by_university: (university_id: string) => Degree[];
  getUniversityFromDomain: (domain: string) => string[];
  isNotNull: (ref: any) => boolean;
}

/**
 * Fetches all refs tables on the server and returns serializable data for clients.
 */
export const getRefsData = async (): Promise<RefsData> => {
  const [
    colleges,
    universities,
    job_types,
    job_modes,
    job_allowances,
    job_pay_freq,
    app_statuses,
    industries,
    job_categories,
    departments,
    domains,
  ] = await Promise.all([
    db.selectFrom("ref_colleges").selectAll().execute() as Promise<College[]>,
    db.selectFrom("ref_universities").selectAll().execute() as Promise<
      University[]
    >,
    db.selectFrom("ref_job_types").selectAll().execute() as Promise<JobType[]>,
    db.selectFrom("ref_job_modes").selectAll().execute() as Promise<JobMode[]>,
    db.selectFrom("ref_job_allowances").selectAll().execute() as Promise<
      JobAllowance[]
    >,
    db.selectFrom("ref_job_pay_freq").selectAll().execute() as Promise<
      JobPayFreq[]
    >,
    db.selectFrom("ref_app_statuses").selectAll().execute() as Promise<
      AppStatus[]
    >,
    db.selectFrom("ref_industries").selectAll().execute() as Promise<
      Industry[]
    >,
    db.selectFrom("ref_job_categories").selectAll().execute() as Promise<
      JobCategory[]
    >,
    db.selectFrom("ref_departments").selectAll().execute() as Promise<
      Department[]
    >,
    db.selectFrom("ref_domains").selectAll().execute() as Promise<RefDomain[]>,
  ]);

  return {
    colleges,
    departments,
    universities,
    job_types,
    job_modes,
    job_allowances,
    job_categories,
    job_pay_freq,
    app_statuses,
    industries,
    domains,
  };
};
