import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  JobService,
  UserService,
  ApplicationService,
} from "@/lib/api/services";
import { Job } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMoa as usDbMoa } from "../db/use-moa";
import shuffle from "knuth-shuffle-seeded";
import { hashStringToInt } from "../utils";

// Jobs Hook with Client-Side Filtering
export function useJobs(
  params: {
    search?: string;
    jobMoaFilter?: string[];
    jobModeFilter?: string[];
    jobWorkloadFilter?: string[];
    jobAllowanceFilter?: string[];
    position?: string[];
  } = {}
) {
  const dbMoas = usDbMoa();
  const dbRefs = useDbRefs();
  const profile = useProfile();
  const seed = useRef<number>(
    hashStringToInt((profile.data?.email ?? "") + new Date().getDay())
  );
  const { isPending, data, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: () =>
      JobService.getAllJobs({
        last_update: new Date(0).getTime(),
      }).then((data) => {
        data.jobs = shuffle(data.jobs ?? [], seed.current);
        return data;
      }),
    staleTime: 60 * 60 * 1000,
  });

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
        dbRefs.get_university_by_name("DLSU - Manila")?.id ?? ""
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
    [filteredJobs]
  );

  return {
    isPending,
    jobs: data?.jobs,
    error,
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
export function useJob(jobId: string) {
  const { isPending, data, error } = useQuery({
    queryKey: ["jobs", jobId],
    queryFn: async () => await JobService.getJobById(jobId),
  });

  return { isPending, data: data?.job ?? null, error };
}

/**
 * Requests profile information and allows profile updates.
 *
 * @hook
 */
export function useProfile() {
  const queryClient = useQueryClient();
  const { isPending, data, error } = useQuery({
    queryKey: ["my-profile"],
    queryFn: UserService.getMyProfile,
  });
  const {
    isPending: isUpdating,
    error: updateError,
    mutateAsync: update,
  } = useMutation({
    mutationFn: UserService.updateMyProfile,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["my-profile"] }),
  });

  return {
    data: data?.user ?? null,
    error,
    update,
    updateError,
    isPending,
    isUpdating,
  };
}

/**
 * Saved jobs hook
 *
 * @hook
 */
export const useSavedJobs = () => {
  const queryClient = useQueryClient();
  const { isPending, data, error } = useQuery({
    queryKey: ["my-saved-jobs"],
    queryFn: JobService.getSavedJobs,
  });
  const { isPending: isToggling, mutate: toggle } = useMutation({
    mutationFn: UserService.saveJob,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["my-saved-jobs"] }),
  });

  // Other utils
  const isJobSaved = (jobId: string): boolean => {
    return data?.jobs?.some((savedJob) => savedJob.id === jobId) ?? false;
  };

  return {
    data: data?.jobs,
    error,
    toggle,
    isPending,
    isToggling,
    isJobSaved,
  };
};

/**
 * Hooks for saved jobs.
 *
 * @hook
 */
export function useApplications() {
  const queryClient = useQueryClient();
  const { isPending, data, error } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => ApplicationService.getApplications(),
  });
  const {
    data: createResult,
    isPending: isCreating,
    error: createError,
    mutateAsync: create,
  } = useMutation({
    mutationFn: ApplicationService.createApplication,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["my-applications"] }),
  });

  // Save appliedJobs independently
  const [appliedJobs, setAppliedJobs] = useState<Partial<Job>[]>([]);
  useEffect(() => {
    setAppliedJobs(
      data?.applications?.map((application) => ({
        id: application.job_id ?? "",
      })) ?? []
    );
  }, [data]);

  // Checks if user has applied to job
  const hasAppliedToJob = (jobId: string): boolean => {
    return (
      data?.applications.some((application) => application.id === jobId) ??
      false
    );
  };

  return {
    isPending,
    isCreating,
    createResult,
    data: data?.applications ?? [],
    create,
    error,
    createError,
    hasAppliedToJob,
    appliedJobs,
    appliedJob: (job_id: string) =>
      appliedJobs.map((aj) => aj.id).includes(job_id),
  };
}
