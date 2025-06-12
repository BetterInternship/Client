/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-10 04:31:46
 * @ Modified time: 2025-06-10 19:32:30
 * @ Description:
 *
 * Accesses refs directly from the database.
 */

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  College,
  JobAllowance,
  JobMode,
  JobType,
  Level,
  University,
} from "@/lib/db/db.types";

const db_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const db_anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!db_url || !db_anon_key)
  throw new Error("[ERROR:ENV] Missing supabase configuration.");
const db = createClient(db_url ?? "", db_anon_key ?? "");

/**
 * A utility that allows us to create ref hooks from our reference tables.
 *
 * @param table
 * @returns
 */
const createRefHook = <
  ID extends string | number,
  T extends { id: ID; name: string }
>(
  table: string
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches the data from the backend.
   */
  async function fetchData() {
    setLoading(true);
    const { data, error } = await db.from(table).select("*");
    if (error) console.error(error);
    else setData(data);
    setLoading(false);
  }

  /**
   * Gets a ref by id
   *
   * @param id
   * @returns
   */
  const get = useCallback(
    (id: ID): T | null => {
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
    (name: string): T | null => {
      const f = data?.filter((d) => d.name === name);
      if (!f.length) return null;
      return f[0];
    },
    [data]
  );

  // Fetch the data at the start
  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    get,
    get_by_name,
    loading,
  };
};

/**
 * Allows using the refs table we have in supabase as a hook.
 *
 * @returns
 */
export const useRefs = () => {
  const [loading, setLoading] = useState(true);
  const {
    data: levels,
    get: get_level,
    get_by_name: get_level_by_name,
    loading: l1,
  } = createRefHook<number, Level>("ref_levels");

  const {
    data: colleges,
    get: get_college,
    get_by_name: get_college_by_name,
    loading: l2,
  } = createRefHook<string, College>("ref_colleges");

  const {
    data: universities,
    get: get_university,
    get_by_name: get_university_by_name,
    loading: l3,
  } = createRefHook<string, University>("ref_universities");

  const {
    data: job_types,
    get: get_job_type,
    get_by_name: get_job_type_by_name,
    loading: l4,
  } = createRefHook<number, JobType>("ref_job_types");

  const {
    data: job_modes,
    get: get_job_mode,
    get_by_name: get_job_mode_by_name,
    loading: l5,
  } = createRefHook<number, JobMode>("ref_job_modes");

  const {
    data: job_allowances,
    get: get_job_allowance,
    get_by_name: get_job_allowance_by_name,
    loading: l6,
  } = createRefHook<number, JobAllowance>("ref_job_allowances");

  useEffect(() => {
    setLoading(l1 || l2 || l3 || l4 || l5 || l6);
  });

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

  return {
    ref_loading: loading,

    levels,
    colleges,
    universities,
    job_types,
    job_modes,
    job_allowances,

    get_level,
    get_college,
    get_university,
    get_job_type,
    get_job_mode,
    get_job_allowance,

    get_level_by_name,
    get_college_by_name,
    get_university_by_name,
    get_university_by_domain,
    get_job_type_by_name,
    get_job_mode_by_name,
    get_job_allowance_by_name,
  };
};
