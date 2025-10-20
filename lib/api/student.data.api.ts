import { useCallback, useMemo, useRef } from "react";
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

    return allJobs.filter((job) => {
      // Search filter
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

        if (!searchableText.includes(searchTerm)) return false;
      }

      // Moa filter
      // ! remove hard code "Has MOA"
      const hasMoa = dbMoas.check(
        job?.employer_id ?? "",
        dbRefs.get_university_by_name("DLSU - Manila")?.id ?? "",
      )
        ? "Has MOA"
        : "No MOA";

      if (params.jobMoaFilter?.length && !params.jobMoaFilter?.includes(hasMoa))
        return false;
      if (
        params.jobModeFilter?.length &&
        !params.jobModeFilter?.includes(job.mode?.toString() ?? "#")
      )
        return false;
      if (
        params.jobWorkloadFilter?.length &&
        !params.jobWorkloadFilter?.includes(job.type?.toString() ?? "#")
      )
        return false;
      if (
        params.jobAllowanceFilter?.length &&
        !params.jobAllowanceFilter?.includes(job.allowance?.toString() ?? "#")
      )
        return false;
      if (
        params.position?.length &&
        !params.position?.includes(job.category?.join(",") ?? "#")
      )
        return false;

      return true;
    });
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

  console.log("PROFILE", data);

  return {
    data: data?.user ?? null,
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
