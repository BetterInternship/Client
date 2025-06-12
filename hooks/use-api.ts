import { useState, useEffect, useCallback, useMemo } from "react";
import {
  job_service,
  user_service,
  application_service,
  handle_api_error,
} from "@/lib/api";
import { Job, PublicUser, Application } from "@/lib/db/db.types";
import { useAuthContext } from "@/app/student/authctx";
import { useCache } from "./use-cache";

// Jobs Hook with Client-Side Filtering
export function useJobs(
  params: {
    category?: string;
    type?: string;
    mode?: string;
    search?: string;
    location?: string;
    industry?: string;
  } = {}
) {
  const { get_cache_item, set_cache_item } = useCache();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all jobs initially
  const fetchAllActiveJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await job_service.get_jobs({
        last_update:
          (get_cache_item("_jobs_last_update") as number) ??
          new Date(0).getTime(),
      });

      if (response.success) {
        if (response.jobs) {
          setJobs(response.jobs);
          set_cache_item("_jobs_last_update", new Date().getTime());
          set_cache_item("_jobs_active_list", response.jobs);
        } else setJobs(get_cache_item("_jobs_active_list") as Job[]);
      }
    } catch (err) {
      const errorMessage = handle_api_error(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllActiveJobs();
  }, [fetchAllActiveJobs]);

  // Client-side filtering
  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];
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
          ...(job.keywords || []),
          ...(job.requirements || []),
          ...(job.responsibilities || []),
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
  }, [jobs, params]);

  const getJobsPage = ({ page = 1, limit = 10 }) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredJobs.slice(startIndex, endIndex);
  };

  return {
    getJobsPage,
    jobs: filteredJobs, // Expose filtered jobs for search components
    loading,
    error,
    refetch: fetchAllActiveJobs,
  };
}

// Single Job Hook
export function useJob(jobId: string | null) {
  const { is_authenticated } = useAuthContext();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        const jobData = await job_service.get_job_by_id(jobId);
        setJob(jobData);
      } catch (err) {
        const errorMessage = handle_api_error(err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  return { job, loading, error };
}

// User Profile Hook
export function useProfile() {
  const { is_authenticated } = useAuthContext();
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await user_service.get_profile();
      console.log("profile", userData);
      setProfile(userData as PublicUser);
    } catch (err) {
      const errorMessage = handle_api_error(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (is_authenticated()) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const updateProfile = async (data: Partial<PublicUser>) => {
    try {
      setError(null);
      const updatedProfile = await user_service.update_profile(data);
      setProfile(updatedProfile as PublicUser);
      return updatedProfile;
    } catch (err) {
      const errorMessage = handle_api_error(err);
      setError(errorMessage);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
}

// Saved Jobs Hook
export function useSavedJobs() {
  const { is_authenticated, recheck_authentication } = useAuthContext();
  const { get_cache_item, set_cache_item } = useCache();
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save_job = async (job_id: string) => {
    try {
      setSaving(true);
      const response = await user_service.save_job(job_id);

      // We saved a job
      if (response.job) {
        if (!get_cache_item("_jobs_saved_list"))
          set_cache_item("_jobs_saved_list", []);
        const new_saved_jobs = [
          ...(get_cache_item("_jobs_saved_list") as Job[]),
          { ...response.job },
        ] as Job[];
        set_cache_item("_jobs_saved_list", new_saved_jobs);
        setSavedJobs(new_saved_jobs);
        console.log(new_saved_jobs);

        // We unsaved a job
      } else {
        const new_saved_jobs = (
          get_cache_item("_jobs_saved_list") as Job[]
        ).filter((saved_job) => saved_job.id !== job_id);
        set_cache_item("_jobs_saved_list", new_saved_jobs);
        setSavedJobs(new_saved_jobs);
      }
      return response;
    } catch (error) {
      handle_api_error(error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const fetchSavedJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached_saved_jobs = get_cache_item("_jobs_saved_list") as Job[];
      if (cached_saved_jobs) {
        await setTimeout(() => {}, 500);
        setSavedJobs(cached_saved_jobs);
        return;
      }

      // Otherwise, pull from server
      const response = await job_service.get_saved_jobs();
      if (response.success) {
        setSavedJobs(response.jobs ?? []);
        set_cache_item("_jobs_saved_list", response.jobs ?? []);
      }
    } catch (err) {
      const errorMessage = handle_api_error(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    recheck_authentication().then((r) =>
      r ? fetchSavedJobs() : setLoading(false)
    );
  }, [fetchSavedJobs]);

  const is_saved = (job_id: string): boolean => {
    return savedJobs.some((saved_job) => saved_job.id === job_id);
  };

  return {
    save_job,
    savedJobs,
    loading,
    saving,
    error,
    is_saved: is_saved,
    refetch: fetchSavedJobs,
  };
}

// Applications Hook
export function useApplications(
  params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}
) {
  const { is_authenticated } = useAuthContext();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalPages: 0,
    currentPage: 1,
    total: 0,
  });

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await application_service.get_applications(params);
      setApplications(response.applications || []);
      setPagination({
        totalPages: response.totalPages || 0,
        currentPage: response.currentPage || 1,
        total: response.total || 0,
      });
    } catch (err) {
      const errorMessage = handle_api_error(err);
      setError(errorMessage);
      // Reset applications to empty array on error
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    if (is_authenticated()) {
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [fetchApplications]);

  return {
    applications,
    loading,
    error,
    pagination,
    refetch: fetchApplications,
  };
}

// Job Save/Unsave Hook
export function useJobActions() {
  const { is_authenticated } = useAuthContext();
  const [appliedJobs, setAppliedJobs] = useState<Map<string, any>>(new Map());

  const applyToJob = async (
    jobId: string,
    data: {
      coverLetter?: string;
      githubLink?: string;
      portfolioLink?: string;
      resumeFilename?: string;
    }
  ) => {
    try {
      const response = await application_service.create_application({
        jobId,
        ...data,
      });

      setAppliedJobs((prev) =>
        new Map(prev).set(jobId, {
          applicationId: response.application.id,
          status: response.application.status,
          appliedAt: response.application.applied_at,
        })
      );

      return response;
    } catch (error) {
      handle_api_error(error);
      throw error;
    }
  };

  const getApplicationStatus = (jobId: string) => appliedJobs.get(jobId);

  return {
    applyToJob,
    getApplicationStatus,
  };
}
