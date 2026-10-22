import { useMemo } from "react";
import { useAuthContext } from "@/lib/ctx-student-auth";
import {
  JobService,
  ApplicationService,
  JobSearchParams,
} from "@/lib/api/services";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  JobWaitlist,
  ListingInternshipPreferences,
  Job,
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
  const { status, user } = useAuthContext();
  const enabled = status === "authenticated";
  const accountId = user?.id;
  const applications = useApplicationsData();

  const _savedJobs = useQuery({
    queryKey: ["my-saved-jobs", accountId],
    queryFn: async () => {
      const response = await JobService.getSavedJobs({ throwOnError: true });
      if (!Array.isArray(response.jobs))
        throw new Error("Invalid saved jobs response.");
      return response.jobs;
    },
    enabled,
  });

  const savedJobs = useMemo(() => _savedJobs.data ?? [], [_savedJobs.data]);

  return {
    isPending: enabled && _savedJobs.isPending,
    error: _savedJobs.error,
    refetch: _savedJobs.refetch,
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
 * @param options.initialData Job object to pre-populate cache with
 */
export function useJobData(
  jobId: string,
  options: { enabled?: boolean; initialData?: Job } = {},
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
    ...(options.initialData
      ? {
          initialData: { success: true, job: options.initialData },
          initialDataUpdatedAt: 0,
        }
      : {}),
  });

  return { isPending, data: data?.job ?? null, applied, error };
}

/**
 * Shared queryKey/queryFn for a job's share link, so ShareJobButton can
 * pre-mint via queryClient.fetchQuery *before* opening the modal — the
 * button owns the wait (loader on the button itself, not a flash of empty
 * state inside the modal) — and useShareLink() below then reads the same,
 * already-populated cache entry instantly once the modal mounts.
 */
export function shareLinkQueryOptions(jobId: string) {
  return {
    queryKey: ["share-link", jobId],
    queryFn: () => JobService.mintShareLink(jobId),
    staleTime: Infinity,
  };
}

/**
 * Mints (or reuses) a job's short share link. Cached per job id at
 * staleTime: Infinity so reopening the share dialog for the same job never
 * re-POSTs (Docs/plans/JOB_SHORT_LINKS_IMPLEMENTATION_PLAN.md defaults).
 *
 * A `success: false` mint (no thrown error, just no `url`) is folded into
 * `isError` here rather than left to React Query's own retry-on-throw path,
 * so a real failure surfaces immediately instead of after a few silent retries.
 *
 * @hook
 * @param jobId
 */
export function useShareLink(jobId: string | undefined) {
  const { data, isPending, isFetching, isError, refetch } = useQuery({
    ...shareLinkQueryOptions(jobId as string),
    enabled: !!jobId,
  });

  return {
    url: data?.url,
    isPending: isPending || isFetching,
    isError: isError || (!!data && !data.url),
    refetch,
  };
}

/**
 * Reads the student's profile, error, and loading state from the auth context.
 * Does not fetch separately; the auth context owns the shared profile request.
 */
export function useProfileData() {
  const session = useAuthContext();
  return {
    data: session.user,
    error: session.error,
    isPending: session.status === "checking",
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
  const { status, user } = useAuthContext();
  const enabled = status === "authenticated";
  const accountId = user?.id;
  const query = useQuery({
    queryKey: ["my-waitlists", accountId],
    queryFn: async () => {
      const response = await JobService.getWaitlistedJobs({
        throwOnError: true,
      });
      if (!Array.isArray(response.waitlisted))
        throw new Error("Invalid job alerts response.");
      return response.waitlisted;
    },
    staleTime: 30 * 1000,
    enabled,
  });
  const { data, error } = query;
  const isPending = enabled && query.isPending;

  const deduped = useMemo(() => {
    const rows = data ?? [];
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
    refetch: query.refetch,
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
  const { status, user } = useAuthContext();
  const enabled = status === "authenticated";
  const accountId = user?.id;
  const applications = useQuery({
    queryKey: ["my-applications", accountId],
    queryFn: async () => {
      const response = await ApplicationService.getApplications(
        {},
        { throwOnError: true },
      );
      if (!Array.isArray(response.applications))
        throw new Error("Invalid applications response.");
      return response.applications;
    },
    staleTime: 30 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled,
  });

  return {
    isPending: enabled && applications.isPending,
    error: applications.error,
    data: applications.data ?? [],
    refetch: applications.refetch,
  };
}
