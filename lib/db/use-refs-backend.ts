/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-15 03:09:57
 * @ Modified time: 2026-10-18 00:00:00
 * @ Description:
 *
 * Server-only data loaders for refs tables.
 */

import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
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
  JobRefsData,
  SchoolsRefsData,
} from "./db.types";
import { DB } from "@betterinternship/schema";
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

export const JOB_REFS_TAG = "refs:job";
export const SCHOOLS_REFS_TAG = "refs:schools";

/**
 * Fetches the job refs tables. These are server-rendered by the layouts.
 */
const getJobRefsUncached = async (): Promise<JobRefsData> => {
  const [
    job_types,
    job_modes,
    job_allowances,
    job_pay_freq,
    app_statuses,
    industries,
    job_categories,
  ] = await Promise.all([
    db.selectFrom("career.ref_job_types").selectAll().execute() as Promise<
      JobType[]
    >,
    db.selectFrom("career.ref_job_modes").selectAll().execute() as Promise<
      JobMode[]
    >,
    db.selectFrom("career.ref_job_allowances").selectAll().execute() as Promise<
      JobAllowance[]
    >,
    db.selectFrom("career.ref_job_pay_freq").selectAll().execute() as Promise<
      JobPayFreq[]
    >,
    db.selectFrom("career.ref_app_statuses").selectAll().execute() as Promise<
      AppStatus[]
    >,
    db.selectFrom("career.ref_industries").selectAll().execute() as Promise<
      Industry[]
    >,
    db.selectFrom("career.ref_job_categories").selectAll().execute() as Promise<
      JobCategory[]
    >,
  ]);

  return {
    job_types,
    job_modes,
    job_allowances,
    job_categories,
    job_pay_freq,
    app_statuses,
    industries,
  };
};

/**
 * Fetches the schools refs tables. These are served by /api/refs/schools.
 */
const getSchoolsRefsUncached = async (): Promise<SchoolsRefsData> => {
  const [colleges, universities, departments] = await Promise.all([
    db.selectFrom("career.ref_colleges").selectAll().execute() as Promise<
      College[]
    >,
    db.selectFrom("career.ref_universities").selectAll().execute() as Promise<
      University[]
    >,
    db.selectFrom("career.ref_departments").selectAll().execute() as Promise<
      Department[]
    >,
  ]);

  return { colleges, departments, universities };
};

// Cache job refs for seven days and catch repeat calls to reduce db calls.
// Seven days so it matches the Top pages' own `revalidate`
// (TOP_PAGES_REVALIDATE_SECONDS = 604800): Next caps a page's ISR lifetime at
// the shortest revalidate among its data dependencies, and this runs in every
// student/hire layout, so a shorter value here would drag the Top pages down
// with it. Job refs change rarely and only by hand; clear JOB_REFS_TAG if one
// ever needs to show up sooner.
export const getJobRefs = cache(
  unstable_cache(getJobRefsUncached, ["refs:job"], {
    revalidate: 604800,
    tags: [JOB_REFS_TAG],
  }),
);

// Schools refs are only read by the /api/refs/schools route, so no page
// depends on this entry. One hour covers manual DB edits; the god-site
// Universities page clears SCHOOLS_REFS_TAG through
// POST /api/refs/schools/revalidate after every save.
export const getSchoolsRefs = cache(
  unstable_cache(getSchoolsRefsUncached, ["refs:schools"], {
    revalidate: 3600,
    tags: [SCHOOLS_REFS_TAG],
  }),
);
