import { notFound } from "next/navigation";
import { fetchJobFull } from "@/lib/api/job-preview.server";
import { JobPageView } from "./JobPageView";

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

  return <JobPageView jobId={job_id} initialJob={job} />;
}
