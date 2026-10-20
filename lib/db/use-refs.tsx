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
import { createRefHelpers } from "./ref-lookup";
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
    refLoading: false,
    ...data,
    getCollege: collegeHelpers.get,
    toCollegeName: collegeHelpers.toName,
    getCollegeByName: collegeHelpers.getByName,
    getUniversity: universityHelpers.get,
    toUniversityName: universityHelpers.toName,
    getUniversityByName: universityHelpers.getByName,
    getJobType: jobTypeHelpers.get,
    toJobTypeName: jobTypeHelpers.toName,
    getJobTypeByName: jobTypeHelpers.getByName,
    getJobMode: jobModeHelpers.get,
    toJobModeName: jobModeHelpers.toName,
    getJobModeByName: jobModeHelpers.getByName,
    getJobAllowance: jobAllowanceHelpers.get,
    toJobAllowanceName: jobAllowanceHelpers.toName,
    getJobAllowanceByName: jobAllowanceHelpers.getByName,
    getJobPayFreq: jobPayFreqHelpers.get,
    toJobPayFreqName: jobPayFreqHelpers.toName,
    getJobPayFreqByName: jobPayFreqHelpers.getByName,
    getAppStatus: appStatusHelpers.get,
    toAppStatusName: appStatusHelpers.toName,
    getAppStatusByName: appStatusHelpers.getByName,
    getIndustry: industryHelpers.get,
    toIndustryName: industryHelpers.toName,
    getIndustryByName: industryHelpers.getByName,
    getJobCategory: jobCategoryHelpers.get,
    toJobCategoryName: jobCategoryHelpers.toName,
    getJobCategoryByName: jobCategoryHelpers.getByName,
    getDepartment: departmentHelpers.get,
    toDepartmentName: departmentHelpers.toName,
    getDepartmentByName: departmentHelpers.getByName,
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
