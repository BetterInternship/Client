import { useMemo } from "react";
import {
  JobService,
  UserService,
  ApplicationService,
  JobSearchParams,
} from "@/lib/api/services";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  PublicUser,
  JobWaitlist,
  ListingInternshipPreferences,
} from "@/lib/db/db.types";

/**
 * internship_preferences has historically been stored as a JSON-encoded
 * string on some rows instead of a real object. No current call site needs
 * this (listing filters run server-side now), but any code reading
 * job.internship_preferences directly should run it through here first.
 */
export const normalizeInternshipPreferences = (
  prefs: unknown,
): ListingInternshipPreferences => {
  if (typeof prefs === "string") {
    try {
      return JSON.parse(prefs) as ListingInternshipPreferences;
    } catch {
      return {};
    }
  }
  return (prefs as ListingInternshipPreferences) ?? {};
};

/**
 * Server-side paginated + filtered + searched marketplace listing page
 * (GET /jobs/search). Always fetched fresh — staleTime 0, refetchOnMount
 * "always", excluded from localStorage persistence (see tanstack-provider) —
 * so new/paused listings show up without a stale up-to-24h cached page.
 * `placeholderData: keepPreviousData` keeps the previous page's rows on
 * screen (the caller can dim them via `isFetching`) instead of flashing
 * blank between page/filter changes.
 *
 * @hook
 * @param params
 */
export function useJobListingsPage(params: JobSearchParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: [
      "job-listings",
      {
        search: params.search,
        position: params.position,
        mode: params.mode,
        workload: params.workload,
        allowance: params.allowance,
        moa: params.moa,
        university: params.university,
        page,
        limit,
      },
    ],
    queryFn: () => JobService.searchJobs({ ...params, page, limit }),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  return {
    isPending,
    isFetching,
    jobs: data?.jobs ?? [],
    total: data?.total ?? 0,
    error,
    refetch,
  };
}

/**
 * Saved/applied status for leaf components (save button, apply button, job
 * alert button, hibernating banner) — split out of the old useJobsData now
 * that the marketplace listing itself is server-paginated and no longer
 * fetched as one big client-side array.
 *
 * @hook
 */
export function useJobStatus() {
  const applications = useApplicationsData();

  const _savedJobs = useQuery({
    queryKey: ["my-saved-jobs"],
    queryFn: JobService.getSavedJobs,
  });

  const savedJobs = useMemo(
    () => _savedJobs.data?.jobs ?? [],
    [_savedJobs.data],
  );

  return {
    isPending: _savedJobs.isPending,
    error: _savedJobs.error,
    savedJobs,
    isJobSaved: (jobId: string) => !!savedJobs.find((j) => j.id === jobId),
    isJobApplied: (jobId: string) =>
      applications.data.some((application) => application.job_id === jobId),
  };
}

/**
 * Requests information about a single job.
 *
 * @hook
 * @param jobId
 * @param options.enabled Set false to defer the fetch (e.g. a ?jobId= deep
 * link that resolves via the current listing page first, and only falls
 * back to this fetch-by-id when the job isn't on that page).
 */
export function useJobData(
  jobId: string,
  options: { enabled?: boolean } = {},
) {
  const applications = useApplicationsData();
  const applied = !!useMemo(
    () => applications.data.find((application) => application.job_id === jobId),
    [applications],
  );
  const { isPending, data, error } = useQuery({
    queryKey: ["jobs", jobId],
    queryFn: async () => await JobService.getJobById(jobId),
    enabled: options.enabled,
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
 * A student's job alerts (waitlists on hibernating listings): open rows
 * (still waiting) plus recently-notified rows ("It's back!" linger window —
 * a 14-day client-side constant matching the server's
 * WAITLIST_NOTIFIED_LINGER_DAYS). The server returns raw episode rows; if a
 * job has both an open row and a lingering notified row (re-hibernated
 * within the window, student rejoined), the open row wins — one card per
 * job, per plan §4.4.
 *
 * @hook
 */
export function useWaitlistsData() {
  const { isPending, data, error } = useQuery({
    queryKey: ["my-waitlists"],
    queryFn: () => JobService.getWaitlistedJobs(),
    staleTime: 30 * 1000,
  });

  const deduped = useMemo(() => {
    const rows = data?.waitlisted ?? [];
    const byJob = new Map<string, JobWaitlist>();

    for (const row of rows) {
      const existing = byJob.get(row.job_id);
      if (!existing) {
        byJob.set(row.job_id, row);
        continue;
      }

      const existingIsOpen = existing.removed_at === null;
      if (existingIsOpen) continue; // open row already wins, nothing beats it

      const rowIsOpen = row.removed_at === null;
      if (rowIsOpen) {
        byJob.set(row.job_id, row);
        continue;
      }

      // both closed — keep whichever fired more recently
      const existingTime = new Date(
        existing.notified_at ?? existing.created_at,
      ).getTime();
      const rowTime = new Date(row.notified_at ?? row.created_at).getTime();
      if (rowTime > existingTime) byJob.set(row.job_id, row);
    }

    return Array.from(byJob.values());
  }, [data]);

  return {
    isPending,
    error,
    data: deduped,
    alerts: deduped.filter((row) => row.removed_at === null),
    notified: deduped.filter((row) => row.removal_reason === "notified"),
    isWaitlisted: (jobId?: string | null) =>
      !!jobId &&
      deduped.some((row) => row.job_id === jobId && row.removed_at === null),
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
    staleTime: 30 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return {
    isPending: applications.isPending,
    error: applications.error,
    data: applications.data?.applications ?? [],
  };
}
