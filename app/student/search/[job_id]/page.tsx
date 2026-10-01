import { notFound } from "next/navigation";
import { fetchJobFull } from "@/lib/api/job-preview.server";
import { JobPageView } from "./JobPageView";
import { getRefsData } from "@/lib/db/use-refs-backend";
import { buildJobListingSchema } from "@/lib/seo/job-posting";

/**
 * The individual job page. Server-rendered so the job's real content lands
 * in the initial HTML for crawlers.
 */
export const revalidate = 300;

export default async function JobPage({
  params,
}: {
  params: Promise<{ job_id: string }>;
}) {
  const { job_id } = await params;
  const job = await fetchJobFull(job_id);

  if (job === null) notFound();

  const refs = await getRefsData();
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
