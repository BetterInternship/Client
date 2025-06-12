/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-10 04:31:46
 * @ Modified time: 2025-06-11 02:05:34
 * @ Description:
 *
 * Fake refs hook for frontend-only version.
 */

import { useCallback, useEffect, useState } from "react";
import {
  College,
  JobAllowance,
  JobMode,
  JobPayFreq,
  JobType,
  Level,
  University,
} from "@/lib/db/db.types";

// Fake reference data
const FAKE_LEVELS: Level[] = [
  { id: 1, name: "Junior" },
  { id: 2, name: "Senior" },
  { id: 3, name: "Graduate" },
];

const FAKE_JOB_TYPES: JobType[] = [
  { id: 0, name: "Internship" },
  { id: 1, name: "Full-time" },
  { id: 2, name: "Part-time" },
  { id: 3, name: "Contract" },
];

const FAKE_JOB_MODES: JobMode[] = [
  { id: 0, name: "In-Person" },
  { id: 1, name: "Hybrid" },
  { id: 2, name: "Remote" },
];

const FAKE_JOB_PAY_FREQ: JobPayFreq[] = [
  { id: 0, name: "Hourly" },
  { id: 1, name: "Monthly" },
  { id: 2, name: "Annually" },
];

const FAKE_JOB_ALLOWANCES: JobAllowance[] = [
  { id: 1, name: "Transportation Allowance" },
  { id: 2, name: "Meal Allowance" },
  { id: 3, name: "Internet Allowance" },
  { id: 4, name: "Phone Allowance" },
];

const FAKE_COLLEGES: College[] = [
  { id: "dlsu-ccs", name: "College of Computer Studies", university_id: "dlsu" },
  { id: "dlsu-cob", name: "College of Business", university_id: "dlsu" },
  { id: "dlsu-coe", name: "College of Engineering", university_id: "dlsu" },
];

const FAKE_UNIVERSITIES: University[] = [
  {
    id: "dlsu",
    name: "De La Salle University",
    domains: ["dlsu.edu.ph", "@dlsu.edu.ph"],
    abbreviation: "DLSU",
    location: "Manila, Philippines"
  },
  {
    id: "up",
    name: "University of the Philippines",
    domains: ["up.edu.ph", "@up.edu.ph"],
    abbreviation: "UP",
    location: "Quezon City, Philippines"
  },
];

/**
 * Fake refs hook that returns static data instead of fetching from database.
 *
 * @returns
 */
export const useRefs = () => {
  const [loading, setLoading] = useState(true);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Gets a ref by id
   */
  const get_level = useCallback((id: number): Level | null => {
    return FAKE_LEVELS.find(item => item.id === id) || null;
  }, []);

  const get_college = useCallback((id: string): College | null => {
    return FAKE_COLLEGES.find(item => item.id === id) || null;
  }, []);

  const get_university = useCallback((id: string): University | null => {
    return FAKE_UNIVERSITIES.find(item => item.id === id) || null;
  }, []);

  const get_job_type = useCallback((id: number): JobType | null => {
    return FAKE_JOB_TYPES.find(item => item.id === id) || null;
  }, []);

  const get_job_mode = useCallback((id: number): JobMode | null => {
    return FAKE_JOB_MODES.find(item => item.id === id) || null;
  }, []);

  const get_job_allowance = useCallback((id: number): JobAllowance | null => {
    return FAKE_JOB_ALLOWANCES.find(item => item.id === id) || null;
  }, []);

  const get_job_pay_freq = useCallback((id: number): JobPayFreq | null => {
    return FAKE_JOB_PAY_FREQ.find(item => item.id === id) || null;
  }, []);

  /**
   * Gets a ref by name
   */
  const get_level_by_name = useCallback((name: string): Level | null => {
    return FAKE_LEVELS.find(item => item.name === name) || null;
  }, []);

  const get_college_by_name = useCallback((name: string): College | null => {
    return FAKE_COLLEGES.find(item => item.name === name) || null;
  }, []);

  const get_university_by_name = useCallback((name: string): University | null => {
    return FAKE_UNIVERSITIES.find(item => item.name === name) || null;
  }, []);

  const get_job_type_by_name = useCallback((name: string): JobType | null => {
    return FAKE_JOB_TYPES.find(item => item.name === name) || null;
  }, []);

  const get_job_mode_by_name = useCallback((name: string): JobMode | null => {
    return FAKE_JOB_MODES.find(item => item.name === name) || null;
  }, []);

  const get_job_allowance_by_name = useCallback((name: string): JobAllowance | null => {
    return FAKE_JOB_ALLOWANCES.find(item => item.name === name) || null;
  }, []);

  const get_job_pay_freq_by_name = useCallback((name: string): JobPayFreq | null => {
    return FAKE_JOB_PAY_FREQ.find(item => item.name === name) || null;
  }, []);

  /**
   * An additional helper for grabbing uni from email
   */
  function get_university_by_domain(domain: string) {
    return FAKE_UNIVERSITIES.find(u => 
      u.domains.includes(domain) || u.domains.includes("@" + domain)
    ) || null;
  }

  return {
    ref_loading: loading,

    levels: FAKE_LEVELS,
    colleges: FAKE_COLLEGES,
    universities: FAKE_UNIVERSITIES,
    job_types: FAKE_JOB_TYPES,
    job_modes: FAKE_JOB_MODES,
    job_allowances: FAKE_JOB_ALLOWANCES,
    job_pay_freq: FAKE_JOB_PAY_FREQ,

    get_level,
    get_college,
    get_university,
    get_job_type,
    get_job_mode,
    get_job_allowance,
    get_job_pay_freq,

    get_level_by_name,
    get_college_by_name,
    get_university_by_name,
    get_university_by_domain,
    get_job_type_by_name,
    get_job_mode_by_name,
    get_job_allowance_by_name,
    get_job_pay_freq_by_name,
  };
};
