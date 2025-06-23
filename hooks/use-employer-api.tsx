import { useState, useEffect, useCallback, useMemo } from "react";
import {
  job_service,
  handle_api_error,
  application_service,
} from "@/lib/api/api";
import { Employer, EmployerApplication, Job } from "@/lib/db/db.types";
import { useAuthContext } from "@/app/hire/authctx";
import { useCache } from "./use-cache";
import { employer_auth_service } from "@/lib/api/employer.api";

export function useEmployers() {
  const [employers, set_employers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await employer_auth_service.get_all_employers();
      if (response.success)
        // @ts-ignore
        set_employers(response.employers ?? []);
    } catch (err) {
      const errorMessage = handle_api_error(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployers();
  }, []);

  return {
    employers,
    loading,
    error,
  };
}

export function useEmployerApplications() {
  const { get, set } = useCache<EmployerApplication[]>();
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
      const response = await application_service.get_employer_applications();
      if (response.success) {
        setEmployerApplications(response.applications ?? []);
        set("_apps_employer_list", response.applications ?? []);
      }
    } catch (err) {
      const errorMessage = handle_api_error(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const review = async (
    app_id: string,
    review_options: { review?: string; notes?: string; status?: number }
  ) => {
    const cache = get("_apps_employer_list") as EmployerApplication[];
    const response = await application_service.review_application(
      app_id,
      review_options
    );

    if (cache) {
      const new_apps = [
        {
          ...cache.filter((a) => a?.id === app_id)[0],
          // @ts-ignore
          ...response.application,
        },
        ...cache.filter((a) => a?.id !== app_id),
        // @ts-ignore
      ].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      set("_apps_employer_list", new_apps);
      setEmployerApplications(
        get("_apps_employer_list") as EmployerApplication[]
      );
    } else {
      // @ts-ignore
      set("_apps_employer_list", [response.application]);
      // @ts-ignore
      setEmployerApplications([response.application]);
    }
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
  const { get, set } = useCache<Job[]>();
  const [ownedJobs, setOwnedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOwnedJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached_saved_jobs = null;

      // Otherwise, pull from server
      const response = await job_service.get_owned_jobs();
      if (response.success) {
        setOwnedJobs(response.jobs ?? []);
        set("_jobs_owned_list", response.jobs ?? []);
      }
    } catch (err) {
      const errorMessage = handle_api_error(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const update_job = async (job_id: string, job: Partial<Job>) => {
    const response = await job_service.update_job(job_id, job);
    if (response.success) {
      // @ts-ignore
      const job = response.job;
      const old_job = ownedJobs.filter((oj) => oj.id === job.id)[0] ?? {};
      set("_jobs_owned_list", [
        { ...old_job, ...job },
        ...ownedJobs.filter((oj) => oj.id !== job.id),
      ]);
      setOwnedJobs(get("_jobs_owned_list") as Job[]);
    }
    return response;
  };

  const create_job = async (job: Partial<Job>) => {
    const response = await job_service.create_job(job);
    if (response.success) {
      // @ts-ignore
      const job = response.job;
      set("_jobs_owned_list", [job, ...ownedJobs]);
      setOwnedJobs(get("_jobs_owned_list") as Job[]);
    }
    return response;
  };

  const delete_job = async (job_id: string) => {
    const response = await job_service.delete_job(job_id);
    if (response.success) {
      set(
        "_jobs_owned_list",
        ownedJobs.filter((job) => job.id !== job_id)
      );
      setOwnedJobs(get("_jobs_owned_list") as Job[]);
    }
  };

  useEffect(() => {
    fetchOwnedJobs();
    setLoading(false);
  }, [fetchOwnedJobs]);

  // Client-side filtering
  const filteredJobs = useMemo(() => {
    let filtered = [...ownedJobs];
    const { type, mode, search, location, industry } = params;

    // Apply type filter
    if (type && type !== "All types") {
      filtered = filtered.filter((job) => {
        if (type === "Internships") return job.type === 0;
        if (type === "Full-time") return job.type === 1;
        if (type === "Part-time") return job.type === 2;
        return false;
      });
    }

    // Apply mode filter
    if (mode && mode !== "Any location") {
      filtered = filtered.filter((job) => {
        if (mode === "In-Person") return job.mode === 0;
        return job.mode === 1 || job.mode === 2;
      });
    }

    // Apply industry filter
    if (industry && industry !== "All industries") {
      filtered = filtered.filter((job) => {
        return job.employer?.industry
          ?.toLowerCase()
          .includes(industry.toLowerCase());
      });
    }

    // Apply search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter((job) => {
        // Search in multiple fields
        const searchableText = [
          job.title,
          job.description,
          job.employer?.name,
          job.employer?.industry,
          job.location,
          ...(job.requirements || []),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(searchLower);
      });
    }

    // Apply location filter
    if (location && location.trim()) {
      filtered = filtered.filter((job) =>
        job.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    return filtered;
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
