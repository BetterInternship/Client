import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { APIClient, APIRouteBuilder } from "@/lib/api/api-client";
import {
  JobService,
  UserService,
  ApplicationService,
} from "@/lib/api/services";
import { useDbRefs } from "@/lib/db/use-refs";
import { useQuery } from "@tanstack/react-query";
import { useDbMoa } from "../db/use-bi-moa";
import { hashStringToInt } from "../utils";
import shuffle from "knuth-shuffle-seeded";
import { User, PublicUser } from "@/lib/db/db.types";
import { getFullName } from "@/lib/profile";

/**
 * Normalize internship_preferences field which may be stored as JSON string or object
 */
const normalizeInternshipPreferences = (prefs: any) => {
  if (typeof prefs === "string") {
    try {
      return JSON.parse(prefs);
    } catch {
      return {};
    }
  }
  return prefs ?? {};
};

/**
 * Ensure a value is an array, handles string, array, and invalid inputs
 */
const ensureArray = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return [];
};

/**
 * From now on, all hooks that query data are meant to do just that.
 * Not allowed to have mutations + will be suffixed with "Data".
 *
 * @param params
 * @returns
 */
export function useJobsData(
  params: {
    search?: string;
    jobMoaFilter?: string[];
    jobModeFilter?: string[];
    jobWorkloadFilter?: string[];
    jobAllowanceFilter?: string[];
    position?: string[];
  } = {},
) {
  const dbMoas = useDbMoa();
  const dbRefs = useDbRefs();
  const profile = useProfileData();
  const seed = useRef<number>(
    hashStringToInt((profile.data?.email ?? "") + new Date().getDay()),
  );
  const applications = useApplicationsData();

  const { isPending, data, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: () =>
      JobService.getAllJobs().then((data) => {
        data.jobs = shuffle(data.jobs ?? [], seed.current);
        return data;
      }),
    staleTime: 60 * 60 * 1000,
  });

  const appliedJobs = useMemo(() => {
    const allJobs = data?.jobs ?? [];
    if (!allJobs?.length) return [];

    return allJobs.filter(
      (job) =>
        !!applications.data.find(
          (application) => application.job_id === job.id,
        ),
    );
  }, [data, applications]);

  const _savedJobs = useQuery({
    queryKey: ["my-saved-jobs"],
    queryFn: JobService.getSavedJobs,
  });

  const savedJobs = useMemo(() => {
    return _savedJobs.data?.jobs ?? [];
  }, [_savedJobs]);

  // Client-side filtering logic
  const filteredJobs = useMemo(() => {
    const allJobs = data?.jobs ?? [];
    if (!allJobs?.length) return [];

    // Initialize filter statistics
    const stats = {
      total: allJobs.length,
      search: { rejected: 0, examples: [] as string[] },
      moa: { rejected: 0, examples: [] as string[] },
      mode: { rejected: 0, examples: [] as string[] },
      workload: { rejected: 0, examples: [] as string[] },
      allowance: { rejected: 0, examples: [] as string[] },
      category: { rejected: 0, examples: [] as string[] },
      passed: 0,
    };

    const filtered = allJobs.filter((job) => {
      const prefs = normalizeInternshipPreferences(job.internship_preferences);

      if (params.search?.trim()) {
        const searchTerm = params.search.toLowerCase();
        const searchableText = [
          job.title,
          job.description,
          job.employer?.name,
          job.employer?.industry,
          job.location,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(searchTerm)) {
          stats.search.rejected++;
          if (stats.search.examples.length < 2) {
            stats.search.examples.push(
              `${job.title} (search: "${params.search}")`,
            );
          }
          return false;
        }
      }

      // MOA filter
      const hasMoa = dbMoas.check(
        job?.employer_id ?? "",
        dbRefs.get_university_by_name("DLSU - Manila")?.id ?? "",
      )
        ? "Has MOA"
        : "No MOA";

      if (
        params.jobMoaFilter?.length &&
        !params.jobMoaFilter?.includes(hasMoa)
      ) {
        stats.moa.rejected++;
        if (stats.moa.examples.length < 2) {
          stats.moa.examples.push(`${job.title} (${hasMoa})`);
        }
        return false;
      }

      // Job Mode filter (job_setup_ids)
      if (params.jobModeFilter?.length) {
        const jobSetupIds = ensureArray(prefs.job_setup_ids);
        const hasMatchingMode = jobSetupIds.some((id) =>
          params.jobModeFilter?.includes(id.toString()),
        );
        if (!hasMatchingMode) {
          stats.mode.rejected++;
          if (stats.mode.examples.length < 2) {
            stats.mode.examples.push(
              `${job.title} (IDs: ${jobSetupIds.join(", ")})`,
            );
          }
          return false;
        }
      }

      // Job Workload filter (job_commitment_ids)
      if (params.jobWorkloadFilter?.length) {
        const jobCommitmentIds = ensureArray(prefs.job_commitment_ids);
        const hasMatchingWorkload = jobCommitmentIds.some((id) =>
          params.jobWorkloadFilter?.includes(id.toString()),
        );
        if (!hasMatchingWorkload) {
          stats.workload.rejected++;
          if (stats.workload.examples.length < 2) {
            stats.workload.examples.push(
              `${job.title} (IDs: ${jobCommitmentIds.join(", ")})`,
            );
          }
          return false;
        }
      }

      // Allowance filter
      if (
        params.jobAllowanceFilter?.length &&
        !params.jobAllowanceFilter?.includes(job.allowance?.toString() ?? "#")
      ) {
        stats.allowance.rejected++;
        if (stats.allowance.examples.length < 2) {
          stats.allowance.examples.push(`${job.title} (₱${job.allowance})`);
        }
        return false;
      }

      // Position (job categories) filter
      if (params.position?.length) {
        const jobCategoryIds = ensureArray(prefs.job_category_ids);

        // Check if any of the job's categories match any selected filter
        const hasMatchingCategory = jobCategoryIds.some((jobCategoryId) =>
          params.position?.includes(jobCategoryId as string),
        );

        if (!hasMatchingCategory) {
          stats.category.rejected++;
          if (stats.category.examples.length < 2) {
            stats.category.examples.push(
              `${job.title} (IDs: ${jobCategoryIds.join(", ")})`,
            );
          }
          return false;
        }
      }

      stats.passed++;
      return true;
    });

    return filtered;
  }, [data, params]);

  const getJobsPage = useCallback(
    ({ page = 1, limit = 10 }) => {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      return filteredJobs.slice(startIndex, endIndex);
    },
    [filteredJobs],
  );

  return {
    isPending: isPending || _savedJobs.isPending,
    jobs: data?.jobs,
    error: error || _savedJobs.error,
    savedJobs,
    isJobSaved: (jobId: string) => !!savedJobs.find((j) => j.id === jobId),
    isJobApplied: (jobId: string) => !!appliedJobs.find((j) => j.id === jobId),
    appliedJobs,
    filteredJobs,
    getJobsPage,
  };
}

/**
 * Requests information about a single job.
 *
 * @hook
 * @param jobId
 */
export function useJobData(jobId: string) {
  const applications = useApplicationsData();
  const applied = !!useMemo(
    () => applications.data.find((application) => application.job_id === jobId),
    [applications],
  );
  const { isPending, data, error } = useQuery({
    queryKey: ["jobs", jobId],
    queryFn: async () => await JobService.getJobById(jobId),
  });

  return { isPending, data: data?.job ?? null, applied, error };
}

/**
 * Requests profile information and allows profile updates.
 *
 * @hook
 */
export function useProfileData() {
  const { isPending, data, error } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => UserService.getMyProfile(),
  });

  return {
    data: (data?.user as PublicUser) ?? null,
    error,
    isPending,
  };
}

/**
 * Hooks for saved jobs.
 *
 * @hook
 */
export function useApplicationsData() {
  const applications = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => ApplicationService.getApplications(),
  });

  return {
    isPending: applications.isPending,
    error: applications.error,
    data: applications.data?.applications ?? [],
  };
}
