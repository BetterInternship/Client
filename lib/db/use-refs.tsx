/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-10 04:31:46
 * @ Modified time: 2026-10-18 00:00:00
 * @ Description:
 *
 * Accesses refs directly from the database.
 *
 * Job refs are server-rendered by the layouts into RefsContextProvider.
 * Schools refs (universities, colleges, departments) are fetched in the
 * browser by SchoolsRefsLoader from /api/refs/schools, so no built page
 * depends on them. useDbRefs merges both.
 */

"use client";

import { createContext, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
  JobRefsData,
  SchoolsRefsData,
  IRefsContext,
} from "./db.types";
import { createRefHelpers } from "./ref-lookup";

const createJobRefsContext = (data: JobRefsData) => {
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

  return {
    ...data,
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
    isNotNull: (ref: any) => !!(ref || ref === 0),
  };
};

const createSchoolsRefsContext = (data: SchoolsRefsData, loading: boolean) => {
  const collegeHelpers = createRefHelpers<string, College>(data.colleges);
  const universityHelpers = createRefHelpers<string, University>(
    data.universities,
  );
  const departmentHelpers = createRefHelpers<string, Department>(
    data.departments,
  );

  return {
    ...data,
    refLoading: loading,
    getCollege: collegeHelpers.get,
    toCollegeName: collegeHelpers.toName,
    getCollegeByName: collegeHelpers.getByName,
    getUniversity: universityHelpers.get,
    toUniversityName: universityHelpers.toName,
    getUniversityByName: universityHelpers.getByName,
    getDepartment: departmentHelpers.get,
    toDepartmentName: departmentHelpers.toName,
    getDepartmentByName: departmentHelpers.getByName,
  };
};

const emptyJobRefsData: JobRefsData = {
  job_types: [],
  job_modes: [],
  job_allowances: [],
  job_categories: [],
  job_pay_freq: [],
  app_statuses: [],
  industries: [],
};

const emptySchoolsRefsData: SchoolsRefsData = {
  colleges: [],
  departments: [],
  universities: [],
};

const JobRefsContext = createContext(createJobRefsContext(emptyJobRefsData));

// Outside a SchoolsRefsLoader (homepage, /guides, maintenance) schools refs
// stay empty and loading; nothing there reads them.
const SchoolsRefsContext = createContext(
  createSchoolsRefsContext(emptySchoolsRefsData, true),
);

/**
 * Job refs context provider, fed by the layouts.
 *
 * @component
 */
export const RefsContextProvider = ({
  jobRefs,
  children,
}: {
  jobRefs?: JobRefsData;
  children: React.ReactNode;
}) => {
  const value = useMemo(
    () => createJobRefsContext(jobRefs ?? emptyJobRefsData),
    [jobRefs],
  );
  return (
    <JobRefsContext.Provider value={value}>{children}</JobRefsContext.Provider>
  );
};

const fetchSchoolsRefs = async (): Promise<SchoolsRefsData> => {
  const res = await fetch("/api/refs/schools");
  if (!res.ok) throw new Error(`Schools refs request failed: ${res.status}`);
  return (await res.json()) as SchoolsRefsData;
};

/**
 * Loads schools refs in the browser. Must sit inside TanstackProvider.
 *
 * The query is persisted with the rest of the cache and refetched on every
 * app mount, so returning visitors get the saved copy at once and edits show
 * up within one page load. refLoading is true only while there's no data at
 * all; a background refetch over a saved copy doesn't count.
 *
 * @component
 */
export const SchoolsRefsLoader = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data } = useQuery({
    queryKey: ["refs-schools"],
    queryFn: fetchSchoolsRefs,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  const value = useMemo(
    () => createSchoolsRefsContext(data ?? emptySchoolsRefsData, !data),
    [data],
  );
  return (
    <SchoolsRefsContext.Provider value={value}>
      {children}
    </SchoolsRefsContext.Provider>
  );
};

/**
 * Allows using the refs table.
 *
 * @hook
 */
export const useDbRefs = (): IRefsContext => {
  const jobRefs = useContext(JobRefsContext);
  const schoolsRefs = useContext(SchoolsRefsContext);
  return useMemo(
    () => ({ ...jobRefs, ...schoolsRefs }),
    [jobRefs, schoolsRefs],
  );
};
