/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-15 03:09:57
 * @ Modified time: 2026-04-30 22:56:23
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
  RefDomain,
  RefsData,
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

/**
 * Fetches all refs tables on the server and returns serializable data for clients.
 */
const getRefsDataUncached = async (): Promise<RefsData> => {
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
    db.selectFrom("career.ref_colleges").selectAll().execute() as Promise<
      College[]
    >,
    db.selectFrom("career.ref_universities").selectAll().execute() as Promise<
      University[]
    >,
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
    db.selectFrom("career.ref_departments").selectAll().execute() as Promise<
      Department[]
    >,
    db.selectFrom("career.ref_domains").selectAll().execute() as Promise<
      RefDomain[]
    >,
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

// Cache refs data for seven days and catch repeat calls to reduce db calls.
// Seven days (not the old one hour) so it matches the Top pages' own
// `revalidate` (TOP_PAGES_REVALIDATE_SECONDS = 604800): Next caps a page's
// ISR lifetime at the shortest revalidate among its data dependencies, and
// this runs in every student/hire layout, so a shorter value here would drag
// the Top pages down with it. Trade-off: refs tables (universities, colleges,
// job types, …) are stale for up to a week — fine, they change rarely and
// only by hand. Revisit with a revalidateTag("refs-data") trigger if that
// ever becomes a problem.
export const getRefsData = cache(
  unstable_cache(getRefsDataUncached, ["refs-data"], {
    revalidate: 604800,
    tags: ["refs-data"],
  }),
);
