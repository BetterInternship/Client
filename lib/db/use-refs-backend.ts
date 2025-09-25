/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-15 03:09:57
 * @ Modified time: 2025-09-25 17:41:57
 * @ Description:
 *
 * The actual backend connection to provide the refs data
 */

import { useState, useEffect, useCallback } from "react";
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
  Degree,
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

  colleges: College[];
  degrees: Degree[];
  departments: Department[];
  universities: University[];
  job_types: JobType[];
  job_modes: JobMode[];
  job_allowances: JobAllowance[];
  job_categories: JobCategory[];
  job_pay_freq: JobPayFreq[];
  app_statuses: AppStatus[];
  industries: Industry[];

  get_college: (id: string | null | undefined) => College | null;
  to_college_name: (
    id: string | null | undefined,
    def?: string | null
  ) => string | null;
  get_college_by_name: (name: string | null | undefined) => College | null;

  get_university: (id: string | null | undefined) => University | null;
  to_university_name: (
    id: string | null | undefined,
    def?: string | null
  ) => string | null;
  get_university_by_name: (
    name: string | null | undefined
  ) => University | null;

  get_job_type: (id: number | null | undefined) => JobType | null;
  to_job_type_name: (
    id: number | null | undefined,
    def?: string | null
  ) => string | null;
  get_job_type_by_name: (name: string | null | undefined) => JobType | null;

  get_job_mode: (id: number | null | undefined) => JobMode | null;
  to_job_mode_name: (
    id: number | null | undefined,
    def?: string | null
  ) => string | null;
  get_job_mode_by_name: (name: string | null | undefined) => JobMode | null;

  get_job_allowance: (id: number | null | undefined) => JobAllowance | null;
  to_job_allowance_name: (
    id: number | null | undefined,
    def?: string | null
  ) => string | null;
  get_job_allowance_by_name: (
    name: string | null | undefined
  ) => JobAllowance | null;

  get_job_pay_freq: (id: number | null | undefined) => JobPayFreq | null;
  to_job_pay_freq_name: (
    id: number | null | undefined,
    def?: string | null
  ) => string | null;
  get_job_pay_freq_by_name: (
    name: string | null | undefined
  ) => JobPayFreq | null;

  get_app_status: (id: number | null | undefined) => AppStatus | null;
  to_app_status_name: (
    id: number | null | undefined,
    def?: string | null
  ) => string | null;
  get_app_status_by_name: (name: string | null | undefined) => AppStatus | null;

  get_industry: (id: string | null | undefined) => Industry | null;
  to_industry_name: (
    id: string | null | undefined,
    def?: string | null
  ) => string | null;
  get_industry_by_name: (name: string | null | undefined) => Industry | null;

  get_job_category: (id: string | null | undefined) => JobCategory | null;
  to_job_category_name: (
    id: string | null | undefined,
    def?: string | null
  ) => string | null;
  get_job_category_by_name: (
    name: string | null | undefined
  ) => JobCategory | null;

  get_department: (id: string | null | undefined) => Department | null;
  to_department_name: (
    id: string | null | undefined,
    def?: string | null
  ) => string | null;
  get_department_by_name: (
    name: string | null | undefined
  ) => Department | null;

  get_degree: (id: string | null | undefined) => Degree | null;
  to_degree_name: (
    id: string | null | undefined,
    def?: string | null
  ) => string | null;
  to_degree_full_name: (
    id: string | null | undefined,
    def?: string | null
  ) => string | null;
  get_degree_by_name: (name: string | null | undefined) => Degree | null;
  get_degree_by_type_and_name: (
    type: string | null | undefined,
    name: string | null | undefined
  ) => Degree | null;

  get_degrees_by_university: (university_id: string) => string[];
  get_departments_by_college: (college_id: string) => string[];
  get_colleges_by_university: (university_id: string) => string[];
  getUniversityFromDomain: (domain: string) => string[];
  isNotNull: (ref: any) => boolean;
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

  const {
    data: departments,
    get: get_department,
    to_name: to_department_name,
    get_by_name: get_department_by_name,
    loading: l11,
  } = createRefInternalHook<string, Department>("ref_departments");

  const {
    data: degrees,
    get: get_degree,
    to_name: to_degree_name,
    get_by_name: get_degree_by_name,
    loading: l12,
  } = createRefInternalHook<string, Degree>("ref_degrees");

  const { data: domains, loading: l13 } = createRefInternalHook<string, Degree>(
    "ref_domains"
  );

  useEffect(() => {
    setLoading(
      l1 ||
        l2 ||
        l3 ||
        l4 ||
        l5 ||
        l6 ||
        l7 ||
        l8 ||
        l9 ||
        l10 ||
        l11 ||
        l12 ||
        l13
    );
  }, [l1, l2, l3, l4, l5, l6, l7, l8, l9, l10, l11, l12, l13]);

  /**
   * An additional helper for grabbing uni from email
   *
   * @param domain
   * @returns
   */
  const get_degree_by_type_and_name = useCallback(
    (type: string, name: string) => {
      const f = degrees.filter((d) => d.type === type && d.name === name);
      if (!f.length) return null;
      return f[0];
    },
    [degrees]
  );

  /**
   * Degree name and type combined.
   *
   * @param id
   * @returns
   */
  const to_degree_full_name = useCallback(
    (
      id: string | null | undefined,
      def: string = "Not specified"
    ): string | null => {
      if (!id) return def;
      const f = degrees?.filter((d) => d.id === id);
      if (!f.length) return def;
      return `${f[0].type} - ${f[0].name}`;
    },
    [degrees]
  );

  // The API to provide to the app
  const refs_context = {
    ref_loading: loading,

    colleges,
    degrees,
    departments,
    universities,
    job_types,
    job_modes,
    job_allowances,
    job_categories,
    job_pay_freq,
    industries,
    app_statuses,
    domains,

    to_college_name,
    to_degree_name,
    to_department_name,
    to_university_name,
    to_job_type_name,
    to_job_mode_name,
    to_job_allowance_name,
    to_job_category_name,
    to_job_pay_freq_name,
    to_app_status_name,
    to_industry_name,
    to_degree_full_name,

    get_college,
    get_degree,
    get_department,
    get_university,
    get_job_type,
    get_job_mode,
    get_job_category,
    get_job_allowance,
    get_job_pay_freq,
    get_app_status,
    get_industry,

    get_college_by_name,
    get_degree_by_name,
    get_department_by_name,
    get_university_by_name,
    get_job_type_by_name,
    get_job_mode_by_name,
    get_job_allowance_by_name,
    get_job_category_by_name,
    get_job_pay_freq_by_name,
    get_app_status_by_name,
    get_industry_by_name,
    get_degree_by_type_and_name,

    get_degrees_by_university: (university_id: string) =>
      degrees.filter((d) => d.university_id === university_id).map((d) => d.id),

    get_departments_by_college: (college_id: string) =>
      departments.filter((d) => d.college_id === college_id).map((d) => d.id),

    get_colleges_by_university: (university_id: string) =>
      colleges
        .filter((c) => c.university_id === university_id)
        .map((c) => c.id),

    getUniversityFromDomain: (domain: string) =>
      domains.filter((d) => d.name === domain).map((d) => d.university_id),
    isNotNull: (ref: any) => ref || ref === 0,
  };

  return refs_context;
};
