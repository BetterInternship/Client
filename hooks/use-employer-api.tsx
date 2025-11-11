import { APIClient, APIRouteBuilder } from "@/lib/api/api-client";
import {
  ApplicationService,
  EmployerService,
  JobService,
  handleApiError
} from "@/lib/api/services";
import { Employer, EmployerApplication, Job } from "@/lib/db/db.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCache } from "./use-cache";

export const useEmployerName = (id: string) => {
  const [employerName, setEmployerName] = useState("");
  useEffect(() => {
    if (id.trim() === "") return;
    // ! refactor lol
    APIClient.get<any>(APIRouteBuilder("employer").r(id).build()).then(
      ({ employer }: { employer: Employer }) => {
        setEmployerName(employer?.name ?? "");
      }
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

export function useEmployerApplications() {
  const { get_cache, set_cache } = useCache<EmployerApplication[]>(
    "_apps_employer_list"
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
        setEmployerApplications(response.applications ?? []);
        set_cache(response.applications ?? []);
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
    review_options: { review?: string; notes?: string; status?: number }
  ) => {
    // const cache = get_cache() as EmployerApplication[];
    const response = await ApplicationService.reviewApplication(
      app_id,
      review_options
    );

    // getting some stale cache errors on multiple updates
    // if (cache) {
    //   const new_apps = [
    //     {
    //       ...cache.filter((a) => a?.id === app_id)[0],
    //       // @ts-ignore
    //       ...response.application,
    //     },
    //     ...cache.filter((a) => a?.id !== app_id),
    //     // @ts-ignore
    //   ].sort(
    //     (a, b) =>
    //       new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    //   );
    //   set_cache(new_apps);
    //   setEmployerApplications(get_cache() as EmployerApplication[]);
    // } else {
    //   // @ts-ignore
    //   set_cache([response.application]);
    //   // @ts-ignore
    //   setEmployerApplications([response.application]);
    // }

    const updateState = (prevApps: EmployerApplication[] | undefined) => {
      const currentApps = prevApps || [];

      const appIndex = currentApps.findIndex(a => a?.id === app_id);
      
      let new_apps: EmployerApplication[];

      if (appIndex > -1) {
        new_apps = [...currentApps];

        new_apps[appIndex] = {
          ...currentApps[appIndex],
          // @ts-ignore
          ...response.application
        };
      } else {
        // @ts-ignore
        new_apps = [...currentApps, response.application];
      }

      return new_apps.sort(
        // @ts-ignore
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }

    // @ts-ignore
    set_cache(updateState);
    // @ts-ignore
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
  } = {}
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
      const job = response.job;
      const old_job = ownedJobs.filter((oj) => oj.id === job.id)[0] ?? {};
      set_cache([
        { ...old_job, ...job },
        ...ownedJobs.filter((oj) => oj.id !== job.id),
      ]);
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

  useEffect(() => {
    fetchOwnedJobs();
    setLoading(false);
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
    loading,
    error,
    refetch: fetchOwnedJobs,
  };
}
