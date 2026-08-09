import type { Metadata } from "next";
import { fetchJobPreview } from "@/lib/api/job-preview.server";

/**
 * job.description is Markdown (rendered via react-markdown — see
 * MarkdownBlock in components/shared/jobs.tsx), not HTML, so a chat preview
 * needs the syntax stripped or it shows raw `#`/`*`/`[]` markup.
 */
const stripMarkdown = (text: string): string =>
  text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Server-side metadata for a job page — the crawler-visible reason a `/l/`
 * short link (or a long /search/<uuid> link) unfurls as a real card instead
 * of a generic BetterInternship tile
 * (Docs/plans/JOB_SHORT_LINKS_IMPLEMENTATION_PLAN.md D11 + §5.5). Crawlers
 * follow the short link's 307 and read these tags at the destination, so
 * short and long links preview identically.
 *
 * A deactivated or unverified-employer job falls back to the parent
 * layout's generic metadata rather than a broken or misleading preview; the
 * short link itself still resolves regardless. The image is a per-job card
 * (Docs/plans/JOB_OG_IMAGE_IMPLEMENTATION_PLAN.md) rendered by the sibling
 * og/[job_id] route, which independently re-fetches the same preview and
 * falls back to the static /og.png on its own failures.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ job_id: string }>;
}): Promise<Metadata> {
  const { job_id } = await params;

  const job = await fetchJobPreview(job_id);
  if (!job) return {};

  const title = `${job.title} at ${job.employer?.name ?? "BetterInternship"}`;
  const description = job.description
    ? stripMarkdown(job.description).slice(0, 160)
    : undefined;
  const image = `/search/og/${job_id}`;

  return {
    title,
    description,
    openGraph: { title, description, images: [image], type: "website" },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function JobLayout({ children }: { children: React.ReactNode }) {
  return children;
}
