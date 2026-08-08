import type { Metadata } from "next";

interface JobPreview {
  title?: string | null;
  description?: string | null;
  employer?: { name?: string | null } | null;
}

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
 * Uses the same public, active-only GET /jobs/:id the client already calls
 * (lib/api/services.ts JobService.getJobById) — the only anonymously
 * fetchable single-job endpoint. A deactivated or unverified-employer job
 * falls back to the parent layout's generic metadata rather than a broken
 * or misleading preview; the short link itself still resolves regardless.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ job_id: string }>;
}): Promise<Metadata> {
  const { job_id } = await params;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/jobs/${job_id}`,
      {
        next: { revalidate: 300 },
      },
    );
    const data = (await res.json()) as { job?: JobPreview | null };
    const job = data?.job;
    if (!job) return {};

    const title = `${job.title} at ${job.employer?.name ?? "BetterInternship"}`;
    const description = job.description
      ? stripMarkdown(job.description).slice(0, 160)
      : undefined;

    return {
      title,
      description,
      openGraph: { title, description, images: ["/og.png"], type: "website" },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ["/og.png"],
      },
    };
  } catch {
    return {};
  }
}

export default function JobLayout({ children }: { children: React.ReactNode }) {
  return children;
}
