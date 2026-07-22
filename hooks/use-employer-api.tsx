import { APIClient, APIRouteBuilder } from "@/lib/api/api-client";
import {
  ApplicationService,
  EmployerService,
  EmployerUserService,
  JobService,
  handleApiError,
} from "@/lib/api/services";
import { Employer, EmployerApplication, EmployerUserRole, Job } from "@/lib/db/db.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCache } from "./use-cache";

/** Invalidated by every self-service or team-management mutation (plan §6.4) — "me" for the caller's own identity/prefs, "my-employer-team" for the roster. */
const invalidateAccountQueries = (queryClient: ReturnType<typeof useQueryClient>) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ["me"] }),
    queryClient.invalidateQueries({ queryKey: ["my-employer-team"] }),
  ]);

export const useEmployerName = (id: string) => {
  const [employerName, setEmployerName] = useState("");
  useEffect(() => {
    if (id.trim() === "") return;
    // ! refactor lol
    APIClient.get<any>(APIRouteBuilder("employer").r(id).build()).then(
      ({ employer }: { employer: Employer }) => {
        setEmployerName(employer?.name ?? "");
      },
    );
  }, [id]);

  return {
    employerName,
  };
};

export function useProfile() {
  const queryClient = useQueryClient();
  const { isPending, data, error } = useQuery({
    queryKey: ["my-employer-profile"],
    queryFn: () => EmployerService.getMyProfile(),
  });

  const updateProfile = async (updatedProfile: Partial<Employer>) => {
    const response = await EmployerService.updateMyProfile(updatedProfile);
    if (response.success)
      queryClient.invalidateQueries({ queryKey: ["my-employer-profile"] });
    return response.employer;
  };

  return {
    loading: isPending,
    error: error,
    data: data?.employer,
    updateProfile,
  };
}

/**
 * career.ref_universities ids where the logged-in employer currently has an
 * active IOM MOA — replaces the old whole-table browser-side moa context
 * (Docs/plans/CAREER_IOM_LINK_IMPLEMENTATION_PLAN.md §2.2).
 */
export function useMoaUniversities() {
  const { isPending, data } = useQuery({
    queryKey: ["my-employer-moa-universities"],
    queryFn: () => EmployerService.getMoaUniversities(),
  });

  return {
    loading: isPending,
    universityIds: data?.universityIds ?? [],
  };
}

export function useEmployerApplications() {
  const { get_cache, set_cache } = useCache<EmployerApplication[]>(
    "_apps_employer_list",
  );
  const [employerApplications, setEmployerApplications] = useState<
    EmployerApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployerApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached_employer_applications = null;

      if (cached_employer_applications) {
        setEmployerApplications(cached_employer_applications);
        return;
      }

      // Otherwise, pull from server
      const response = await ApplicationService.getEmployerApplications();
      if (response.success) {
        const filteredApplications = (response.applications ?? []).filter(
          (app) => app.status !== 5,
        );

        setEmployerApplications(filteredApplications);
        set_cache(filteredApplications);
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const review = async (
    app_id: string,
    review_options: { review?: string; notes?: string; status?: number },
  ) => {
    // const cache = get_cache() as EmployerApplication[];
    const response = await ApplicationService.reviewApplication(
      app_id,
      review_options,
    );

    const updateState = (prevApps: EmployerApplication[] | undefined) => {
      const currentApps = prevApps || [];

      const appIndex = currentApps.findIndex((a) => a?.id === app_id);

      let new_apps: EmployerApplication[];

      if (appIndex > -1) {
        new_apps = [...currentApps];

        new_apps[appIndex] = {
          ...currentApps[appIndex],
          // @ts-ignore
          ...response.application,
        };
      } else {
        // @ts-ignore
        new_apps = [...currentApps, response.application];
      }

      return new_apps.sort(
        // @ts-ignore
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
    };

    // @ts-ignore
    set_cache(updateState);
    setEmployerApplications(updateState);

    return response;
  };

  useEffect(() => {
    fetchEmployerApplications();
    setLoading(false);
  }, [fetchEmployerApplications]);

  return {
    employer_applications: employerApplications,
    review,
    loading,
    error,
    refetch: fetchEmployerApplications,
  };
}

/**
 * Hook for dealing with jobs owned by employer.
 * @returns
 */
export function useOwnedJobs(
  params: {
    category?: string;
    type?: string;
    mode?: string;
    search?: string;
    location?: string;
    industry?: string;
  } = {},
) {
  const { get_cache, set_cache } = useCache<Job[]>("_jobs_owned_list");
  const [ownedJobs, setOwnedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOwnedJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Otherwise, pull from server
      const response = await JobService.getOwnedJobs();
      if (response.success) {
        setOwnedJobs(response.jobs ?? []);
        set_cache(response.jobs ?? []);
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const update_job = async (job_id: string, job: Partial<Job>) => {
    const response = await JobService.updateJob(job_id, job);
    if (response.success) {
      // @ts-ignore
      const updatedJob = response.job;
      const old_job = ownedJobs.filter((oj) => oj.id === job_id)[0] ?? {};

      const newJobs = [
        { ...old_job, ...updatedJob },
        ...ownedJobs.filter((oj) => oj.id !== job_id),
      ];

      set_cache(newJobs);
      setOwnedJobs(get_cache() ?? []);
    }
    return response;
  };

  const create_job = async (job: Partial<Job>) => {
    const response = await JobService.createJob(job);
    if (response.success) {
      // @ts-ignore
      const job = response.job;
      set_cache([job, ...ownedJobs]);
      setOwnedJobs(get_cache() ?? []);
    }
    return response;
  };

  const delete_job = async (job_id: string) => {
    const response = await JobService.deleteJob(job_id);
    if (response.success) {
      set_cache(ownedJobs.filter((job) => job.id !== job_id));
      setOwnedJobs(get_cache() ?? []);
    }
  };

  const unpause_job = async (job_id: string) => {
    const response = await JobService.unpauseJob(job_id);
    if (response.success) {
      const newJobs = ownedJobs.map((job) =>
        job.id === job_id
          ? {
              ...job,
              paused: false,
              pause_reason: null,
              paused_at: null,
              waiting_count: 0,
            }
          : job,
      );
      set_cache(newJobs);
      setOwnedJobs(get_cache() ?? []);
    }
    return response;
  };

  const unpause_all_jobs = async () => {
    const response = await JobService.unpauseAllJobs();
    if (response.success) {
      const newJobs = ownedJobs.map((job) => ({
        ...job,
        paused: false,
        pause_reason: null,
        paused_at: null,
        waiting_count: 0,
      }));
      set_cache(newJobs);
      setOwnedJobs(get_cache() ?? []);
    }
    return response;
  };

  useEffect(() => {
    fetchOwnedJobs();
  }, [fetchOwnedJobs]);

  // Client-side filtering
  const filteredJobs = useMemo(() => {
    return ownedJobs;
  }, [ownedJobs, params]);

  return {
    ownedJobs: filteredJobs,
    update_job,
    create_job,
    delete_job,
    unpause_job,
    unpause_all_jobs,
    loading,
    error,
    refetch: fetchOwnedJobs,
  };
}

/**
 * The signed-in employer_user's own identity + prefs — distinct from
 * useProfile() (the company). Backs authctx's refreshAuthentication() and the
 * /account hub (Docs/plans/EMPLOYER_TEAM_ACCOUNTS_IMPLEMENTATION_PLAN.md §6).
 */
export function useMe() {
  const { isPending, data, error } = useQuery({
    queryKey: ["me"],
    queryFn: () => EmployerUserService.getMe(),
  });

  return {
    loading: isPending,
    error,
    data: data?.user,
  };
}

export function useUpdateSelf() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      first_name?: string | null;
      middle_name?: string | null;
      last_name?: string | null;
    }) => EmployerUserService.updateMe(data),
    onSuccess: () => invalidateAccountQueries(queryClient),
  });
}

export function useChangeMyPassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => EmployerUserService.changeMyPassword(currentPassword, newPassword),
  });
}

export function useUpdateMyNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (receivesDigest: boolean) =>
      EmployerUserService.updateMyNotifications(receivesDigest),
    onSuccess: () => invalidateAccountQueries(queryClient),
  });
}

/** The Team tab (ADMIN only) — the full member roster for the caller's employer. */
export function useTeam() {
  const { isPending, data, error } = useQuery({
    queryKey: ["my-employer-team"],
    queryFn: () => EmployerUserService.getTeam(),
  });

  return {
    loading: isPending,
    error,
    data: data?.users ?? [],
  };
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: EmployerUserRole }) =>
      EmployerUserService.invite(email, role),
    onSuccess: () => invalidateAccountQueries(queryClient),
  });
}

export function useResendInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => EmployerUserService.resendInvite(userId),
    onSuccess: () => invalidateAccountQueries(queryClient),
  });
}

export function useChangeMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: EmployerUserRole }) =>
      EmployerUserService.changeRole(userId, role),
    onSuccess: () => invalidateAccountQueries(queryClient),
  });
}

export function useDeactivateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => EmployerUserService.deactivateMember(userId),
    onSuccess: () => invalidateAccountQueries(queryClient),
  });
}

export function useReactivateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => EmployerUserService.reactivateMember(userId),
    onSuccess: () => invalidateAccountQueries(queryClient),
  });
}

export function useUpdateMemberNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      receivesDigest,
    }: {
      userId: string;
      receivesDigest: boolean;
    }) => EmployerUserService.updateMemberNotifications(userId, receivesDigest),
    onSuccess: () => invalidateAccountQueries(queryClient),
  });
}

