import "server-only";
import { Job } from "../db/db.types";
import { apiUrl } from "./api-origin";
import {
  getJobsControllerFindOneActiveUrl,
  jobsControllerFindOneActive,
} from "./generated/endpoints/jobs/jobs";

export interface JobPreviewData {
  title?: string | null;
  description?: string | null;
  employer?: { name?: string | null } | null;
  allowance?: number | null;
  salary?: number | string | null;
  salary_freq?: number | null;
  internship_preferences?: {
    job_setup_ids?: number[];
    job_commitment_ids?: number[];
  } | null;
  is_unlisted?: boolean | null;
}

/**
 * Fetches the public, active-only job preview shared by the job page's HTML
 * metadata (generateMetadata) and its OG image route — both need the same
 * "hidden jobs (deactivated / deleted / unverified employer) get no real
 * preview" fallback, so it lives here once instead of twice
 * (Docs/plans/JOB_OG_IMAGE_IMPLEMENTATION_PLAN.md D8).
 *
 * Uses the same public, anonymously-fetchable GET /jobs/:id the client
 * already calls (lib/api/services.ts JobService.getJobById). Returns null on
 * any failure — not-found, deactivated, unverified employer, or a network
 * error — never throws.
 */
export async function fetchJobPreview(
  jobId: string,
): Promise<JobPreviewData | null> {
  try {
    const data = (await jobsControllerFindOneActive(jobId, {
      next: { revalidate: 300 },
    })) as unknown as { job?: JobPreviewData | null };
    return data?.job ?? null;
  } catch {
    return null;
  }
}

// fetch full job data for a given job ID. Unlike the preview above this one
// throws on a non-OK response (callers rely on that), which careerFetch never
// does, so it takes its URL from the generated builder and fetches directly.
export async function fetchJobFull(jobId: string): Promise<Job | null> {
  const res = await fetch(apiUrl(getJobsControllerFindOneActiveUrl(jobId)), {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch job with ID ${jobId}: ${res.status}`);
  }

  const data = (await res.json()) as { job?: Job | null };
  return data?.job ?? null;
}
