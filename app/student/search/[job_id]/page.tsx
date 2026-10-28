import { notFound } from "next/navigation";
import { fetchJobFull } from "@/lib/api/job-preview.server";
import { JobPageView } from "./JobPageView";
import { getJobRefs } from "@/lib/db/use-refs-backend";
import { buildJobListingSchema } from "@/lib/seo/job-posting";

/**
 * The individual job page. Server-rendered so the job's real content lands
 * in the initial HTML for crawlers.
 *
 * A cached page: `generateStaticParams` returns nothing, so a build renders
 * no job, and each job is built on its first visit and served from the cache
 * for `revalidate` seconds. Without the export, Next renders the route on
 * every request and `revalidate` only caches the fetch. Nothing here may
 * depend on the visitor — the job fetch is anonymous and the per-user parts
 * (profile, saved, applied) load in the browser.
 */
export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ job_id: string }>;
}) {
  const { job_id } = await params;
  const job = await fetchJobFull(job_id);

  if (job === null) notFound();

  const refs = await getJobRefs();
  const schema = buildJobListingSchema(job, refs);

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <JobPageView jobId={job_id} initialJob={job} />
    </>
  );
}
