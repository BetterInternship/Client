import "server-only";

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
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}`,
      {
        next: { revalidate: 300 },
      },
    );
    const data = (await res.json()) as { job?: JobPreviewData | null };
    return data?.job ?? null;
  } catch {
    return null;
  }
}
