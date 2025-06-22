/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-15 03:09:57
 * @ Modified time: 2025-06-22 21:18:55
 * @ Description:
 *
 * The actual backend connection to provide the refs data
 */

import { useState, useEffect, useCallback } from "react";
import {
  Level,
  College,
  University,
  JobType,
  JobMode,
  JobAllowance,
  JobPayFreq,
  AppStatus,
  Industry,
  JobCategory,
} from "./db.types";
import { createClient } from "@supabase/supabase-js";

// Environment setup
const db_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const db_anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!db_url || !db_anon_key)
  throw new Error("[ERROR:ENV] Missing supabase configuration.");
const db = createClient(db_url ?? "", db_anon_key ?? "");

// Setup the context
export interface IRefsContext {
  ref_loading: boolean;

  levels: Level[];
  colleges: College[];
  universities: University[];
  job_types: JobType[];
  job_modes: JobMode[];
  job_allowances: JobAllowance[];
  job_categories: JobCategory[];
  job_pay_freq: JobPayFreq[];
  app_statuses: AppStatus[];
  industries: Industry[];

  get_level: (id: number | null | undefined) => Level | null;
  to_level_name: (id: number | null | undefined, def?: string) => string | null;
  get_level_by_name: (name: string | null | undefined) => Level | null;

  get_college: (id: string | null | undefined) => College | null;
  to_college_name: (
    id: string | null | undefined,
    def?: string
  ) => string | null;
  get_college_by_name: (name: string | null | undefined) => College | null;

  get_university: (id: string | null | undefined) => University | null;
  to_university_name: (
    id: string | null | undefined,
    def?: string
  ) => string | null;
  get_university_by_name: (
    name: string | null | undefined
  ) => University | null;
  get_university_by_domain: (name: string) => University | null;

  get_job_type: (id: number | null | undefined) => JobType | null;
  to_job_type_name: (
    id: number | null | undefined,
    def?: string
  ) => string | null;
  get_job_type_by_name: (name: string | null | undefined) => JobType | null;

  get_job_mode: (id: number | null | undefined) => JobMode | null;
  to_job_mode_name: (
    id: number | null | undefined,
    def?: string
  ) => string | null;
  get_job_mode_by_name: (name: string | null | undefined) => JobMode | null;

  get_job_allowance: (id: number | null | undefined) => JobAllowance | null;
  to_job_allowance_name: (
    id: number | null | undefined,
    def?: string
  ) => string | null;
  get_job_allowance_by_name: (
    name: string | null | undefined
  ) => JobAllowance | null;

  get_job_pay_freq: (id: number | null | undefined) => JobPayFreq | null;
  to_job_pay_freq_name: (
    id: number | null | undefined,
    def?: string
  ) => string | null;
  get_job_pay_freq_by_name: (
    name: string | null | undefined
  ) => JobPayFreq | null;

  get_app_status: (id: number | null | undefined) => AppStatus | null;
  to_app_status_name: (
    id: number | null | undefined,
    def?: string
  ) => string | null;
  get_app_status_by_name: (name: string | null | undefined) => AppStatus | null;

  get_industry: (id: string | null | undefined) => Industry | null;
  to_industry_name: (
    id: string | null | undefined,
    def?: string
  ) => string | null;
  get_industry_by_name: (name: string | null | undefined) => Industry | null;

  get_job_category: (id: string | null | undefined) => JobCategory | null;
  to_job_category_name: (
    id: string | null | undefined,
    def?: string
  ) => string | null;
  get_job_category_by_name: (
    name: string | null | undefined
  ) => JobCategory | null;

  ref_is_not_null: (ref: any) => boolean;
}

/**
 * A utility that allows us to create ref hooks from our reference tables.
 *
 * @hook
 * @internal
 */
const createRefInternalHook = <
  ID extends string | number,
  T extends { id: ID; name: string }
>(
  table: string
) => {
  const [data, set_data] = useState<T[]>([]);
  const [loading, set_loading] = useState(true);

  /**
   * Fetches the data from the backend.
   */
  async function fetch_data() {
    set_loading(true);
    const { data, error } = await db.from(table).select("*");
    if (error) console.error(error);
    else set_data(data);
    set_loading(false);
  }

  /**
   * Converts an id to it's name.
   *
   * @param id
   * @returns
   */
  const to_name = useCallback(
    (id: ID | null | undefined, def: string = "Not specified"): string => {
      if (!id && id !== 0) return def;
      const f = data?.filter((d) => d.id === id);
      if (!f.length) return def;
      return f[0].name;
    },
    [data]
  );

  /**
   * Gets a ref by id
   *
   * @param id
   * @returns
   */
  const get = useCallback(
    (id: ID | null | undefined): T | null => {
      if (!id && id !== 0) return null;
      const f = data?.filter((d) => d.id === id);
      if (!f.length) return null;
      return f[0];
    },
    [data]
  );

  /**
   * Gets a ref by name
   *
   * @param name
   * @returns
   */
  const get_by_name = useCallback(
    (name: string | null | undefined): T | null => {
      if (!name) return null;
      const f = data?.filter((d) => d.name === name);
      if (!f.length) return null;
      return f[0];
    },
    [data]
  );

  // Fetch the data at the start
  useEffect(() => {
    fetch_data();
  }, []);

  return {
    data,
    get,
    to_name,
    get_by_name,
    loading,
  };
};

export const createRefsContext = () => {
  const [loading, setLoading] = useState(true);
  const {
    data: levels,
    get: get_level,
    to_name: to_level_name,
    get_by_name: get_level_by_name,
    loading: l1,
  } = createRefInternalHook<number, Level>("ref_levels");

  const {
    data: colleges,
    get: get_college,
    to_name: to_college_name,
    get_by_name: get_college_by_name,
    loading: l2,
  } = createRefInternalHook<string, College>("ref_colleges");

  const {
    data: universities,
    get: get_university,
    to_name: to_university_name,
    get_by_name: get_university_by_name,
    loading: l3,
  } = createRefInternalHook<string, University>("ref_universities");

  const {
    data: job_types,
    get: get_job_type,
    to_name: to_job_type_name,
    get_by_name: get_job_type_by_name,
    loading: l4,
  } = createRefInternalHook<number, JobType>("ref_job_types");

  const {
    data: job_modes,
    get: get_job_mode,
    to_name: to_job_mode_name,
    get_by_name: get_job_mode_by_name,
    loading: l5,
  } = createRefInternalHook<number, JobMode>("ref_job_modes");

  const {
    data: job_allowances,
    get: get_job_allowance,
    to_name: to_job_allowance_name,
    get_by_name: get_job_allowance_by_name,
    loading: l6,
  } = createRefInternalHook<number, JobAllowance>("ref_job_allowances");

  const {
    data: job_pay_freq,
    get: get_job_pay_freq,
    to_name: to_job_pay_freq_name,
    get_by_name: get_job_pay_freq_by_name,
    loading: l7,
  } = createRefInternalHook<number, JobPayFreq>("ref_job_pay_freq");

  const {
    data: app_statuses,
    get: get_app_status,
    to_name: to_app_status_name,
    get_by_name: get_app_status_by_name,
    loading: l8,
  } = createRefInternalHook<number, AppStatus>("ref_app_statuses");

  const {
    data: industries,
    get: get_industry,
    to_name: to_industry_name,
    get_by_name: get_industry_by_name,
    loading: l9,
  } = createRefInternalHook<string, Industry>("ref_industries");

  const {
    data: job_categories,
    get: get_job_category,
    to_name: to_job_category_name,
    get_by_name: get_job_category_by_name,
    loading: l10,
  } = createRefInternalHook<string, JobCategory>("ref_job_categories");

  useEffect(() => {
    setLoading(l1 || l2 || l3 || l4 || l5 || l6 || l7 || l8 || l9 || l10);
  }, [l1, l2, l3, l4, l5, l6, l7, l8, l9, l10]);

  /**
   * An additional helper for grabbing uni from email
   *
   * @param domain
   * @returns
   */
  function get_university_by_domain(domain: string) {
    const f = universities.filter(
      (u) => u.domains.includes(domain) || u.domains.includes("@" + domain)
    );
    if (!f.length) return null;
    return f[0];
  }

  // The API to provide to the app
  const refs_context = {
    ref_loading: loading,

    levels,
    colleges,
    universities,
    job_types,
    job_modes,
    job_allowances,
    job_categories,
    job_pay_freq,
    industries,
    app_statuses,

    to_level_name,
    to_college_name,
    to_university_name,
    to_job_type_name,
    to_job_mode_name,
    to_job_allowance_name,
    to_job_category_name,
    to_job_pay_freq_name,
    to_app_status_name,
    to_industry_name,

    get_level,
    get_college,
    get_university,
    get_job_type,
    get_job_mode,
    get_job_category,
    get_job_allowance,
    get_job_pay_freq,
    get_app_status,
    get_industry,

    get_level_by_name,
    get_college_by_name,
    get_university_by_name,
    get_university_by_domain,
    get_job_type_by_name,
    get_job_mode_by_name,
    get_job_allowance_by_name,
    get_job_category_by_name,
    get_job_pay_freq_by_name,
    get_app_status_by_name,
    get_industry_by_name,

    ref_is_not_null: (ref: any) => ref || ref === 0,
  };

  return refs_context;
};
