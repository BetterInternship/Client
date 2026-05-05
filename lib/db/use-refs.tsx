/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-10 04:31:46
 * @ Modified time: 2026-04-19 00:24:27
 * @ Description:
 *
 * Accesses refs directly from the database.
 */

"use client";

import { createContext, useContext } from "react";
import {
  AppStatus,
  College,
  Department,
  Industry,
  JobAllowance,
  JobCategory,
  JobMode,
  JobPayFreq,
  JobType,
  University,
  RefDomain,
  RefsData,
  IRefsContext,
} from "./db.types";
// The context template
const RefsContext = createContext<IRefsContext>({} as IRefsContext);

/**
 * Refs context provider.
 *
 * @component
 */
export const RefsContextProvider = ({
  data,
  children,
}: {
  data?: RefsData;
  children: React.ReactNode;
}) => {
  const refsContext = createRefsContext(data ?? emptyRefsData);
  return (
    <RefsContext.Provider value={refsContext}>{children}</RefsContext.Provider>
  );
};

/**
 * Allows using the refs table.
 *
 * @hook
 */
export const useDbRefs = (): IRefsContext => {
  return useContext(RefsContext);
};

const createRefHelpers = <
  ID extends string | number,
  T extends { id: ID; name: string },
>(
  data: T[],
) => {
  const get = (id: ID | null | undefined): T | null => {
    if (!id && id !== 0) return null;
    const found = data.find((d) => d.id === id);
    return found ?? null;
  };

  const toName = (
    id: ID | null | undefined,
    def: string | null | undefined = "Not specified",
  ): string => {
    if (!id && id !== 0) return def ?? "";
    const found = data.find((d) => d.id === id);
    return found?.name ?? def ?? "";
  };

  const getByName = (name: string | null | undefined): T | null => {
    if (!name) return null;
    const found = data.find((d) => d.name === name);
    return found ?? null;
  };

  return {
    get,
    toName,
    getByName,
  };
};

const createRefsContext = (data: RefsData): IRefsContext => {
  const collegeHelpers = createRefHelpers<string, College>(data.colleges);
  const universityHelpers = createRefHelpers<string, University>(
    data.universities,
  );
  const jobTypeHelpers = createRefHelpers<number, JobType>(data.job_types);
  const jobModeHelpers = createRefHelpers<number, JobMode>(data.job_modes);
  const jobAllowanceHelpers = createRefHelpers<number, JobAllowance>(
    data.job_allowances,
  );
  const jobPayFreqHelpers = createRefHelpers<number, JobPayFreq>(
    data.job_pay_freq,
  );
  const appStatusHelpers = createRefHelpers<number, AppStatus>(
    data.app_statuses,
  );
  const industryHelpers = createRefHelpers<string, Industry>(data.industries);
  const jobCategoryHelpers = createRefHelpers<string, JobCategory>(
    data.job_categories,
  );
  const departmentHelpers = createRefHelpers<string, Department>(
    data.departments,
  );

  return {
    ref_loading: false,
    ...data,
    get_college: collegeHelpers.get,
    to_college_name: collegeHelpers.toName,
    get_college_by_name: collegeHelpers.getByName,
    get_university: universityHelpers.get,
    to_university_name: universityHelpers.toName,
    get_university_by_name: universityHelpers.getByName,
    get_job_type: jobTypeHelpers.get,
    to_job_type_name: jobTypeHelpers.toName,
    get_job_type_by_name: jobTypeHelpers.getByName,
    get_job_mode: jobModeHelpers.get,
    to_job_mode_name: jobModeHelpers.toName,
    get_job_mode_by_name: jobModeHelpers.getByName,
    get_job_allowance: jobAllowanceHelpers.get,
    to_job_allowance_name: jobAllowanceHelpers.toName,
    get_job_allowance_by_name: jobAllowanceHelpers.getByName,
    get_job_pay_freq: jobPayFreqHelpers.get,
    to_job_pay_freq_name: jobPayFreqHelpers.toName,
    get_job_pay_freq_by_name: jobPayFreqHelpers.getByName,
    get_app_status: appStatusHelpers.get,
    to_app_status_name: appStatusHelpers.toName,
    get_app_status_by_name: appStatusHelpers.getByName,
    get_industry: industryHelpers.get,
    to_industry_name: industryHelpers.toName,
    get_industry_by_name: industryHelpers.getByName,
    get_job_category: jobCategoryHelpers.get,
    to_job_category_name: jobCategoryHelpers.toName,
    get_job_category_by_name: jobCategoryHelpers.getByName,
    get_department: departmentHelpers.get,
    to_department_name: departmentHelpers.toName,
    get_department_by_name: departmentHelpers.getByName,
    get_departments_by_college: (collegeId: string) =>
      data.departments
        .filter((d) => d.college_id === collegeId)
        .map((d) => d.id),
    get_colleges_by_university: (universityId: string) =>
      data.colleges
        .filter((c) => c.university_id === universityId)
        .map((c) => c.id),
    getUniversityFromDomain: (domain: string) =>
      data.domains
        .filter((d: RefDomain) => d.name === domain)
        .map((d: RefDomain) => d.university_id),
    isNotNull: (ref: any) => !!(ref || ref === 0),
  };
};

const emptyRefsData: RefsData = {
  colleges: [],
  departments: [],
  universities: [],
  job_types: [],
  job_modes: [],
  job_allowances: [],
  job_categories: [],
  job_pay_freq: [],
  app_statuses: [],
  industries: [],
  domains: [],
};
