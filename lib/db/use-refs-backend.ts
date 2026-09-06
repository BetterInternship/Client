/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-15 03:09:57
 * @ Modified time: 2026-04-30 22:56:23
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
  RefDomain,
  RefsData,
} from "./db.types";
import { DB } from "@betterinternship/schema";
import { Kysely, PostgresDialect } from "kysely";
import { unstable_cache } from "next/cache";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) throw new Error("[ERROR:ENV] Missing database url.");

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: DATABASE_URL,
      // A Vercel instance gets its own pool. Keep this tiny so scaling the
      // frontend cannot exhaust the database's regular connection slots.
      max: 1,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
    }),
  }),
});

/**
 * Fetches all refs tables on the server and returns serializable data for clients.
 */
const loadRefsData = async (): Promise<RefsData> => {
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

// Reference tables change rarely. Sharing this result through Next's data
// cache prevents every layout render from opening a database connection.
export const getRefsData = unstable_cache(loadRefsData, ["refs-data"], {
  revalidate: 3600,
});
