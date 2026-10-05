import "server-only";
import Link from "next/link";
import { ArrowRight, Bookmark, MapPin, BriefcaseBusiness } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type {
  Job,
  ListingInternshipPreferences,
  RefsData,
} from "@/lib/db/db.types";

async function fetchLatestJobs(): Promise<Job[] | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/jobs/search?page=1&limit=24`,
      {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as { success?: boolean; jobs?: Job[] };
    if (data.success === false || !Array.isArray(data.jobs))
      throw new Error("Invalid listings response");
    return data.jobs
      .filter(
        (job) =>
          job.id &&
          !job.hibernating &&
          !job.is_unlisted &&
          job.is_active !== false &&
          !job.is_deleted,
      )
      .slice(0, 6);
  } catch (error) {
    console.error("Homepage listings could not be loaded:", error);
    return null;
  }
}

function preferences(value: unknown): ListingInternshipPreferences {
  try {
    const parsed: unknown =
      typeof value === "string" ? JSON.parse(value) : value;
    return parsed && typeof parsed === "object"
      ? (parsed as ListingInternshipPreferences)
      : {};
  } catch {
    return {};
  }
}

function ids(value: unknown): string[] {
  return (Array.isArray(value) ? value : value == null ? [] : [value]).map(
    String,
  );
}

function postedDate(value: Date | string | null | undefined): {
  label: string;
  iso?: string;
} {
  if (!value) return { label: "Recently posted" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { label: "Recently posted" };
  const days = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 86400000),
  );
  return {
    label:
      days === 0
        ? "Posted today"
        : `Posted ${days} ${days === 1 ? "day" : "days"} ago`,
    iso: date.toISOString(),
  };
}

export async function LatestOpportunities({
  refs,
  loginHref,
}: {
  refs: RefsData;
  loginHref: string;
}) {
  const jobs = await fetchLatestJobs();
  if (!jobs?.length) {
    return (
      <div className="home-listings-message">
        <p>
          {jobs === null
            ? "We couldn’t load the latest internships right now."
            : "New opportunities are on their way."}
        </p>
        <Link href="/search">
          Browse all internships <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="home-opportunities-grid">
      {jobs.map((job) => {
        const prefs = preferences(job.internship_preferences);
        const modeIds = ids(prefs.job_setup_ids);
        const modes = refs.job_modes
          .filter((mode) => modeIds.includes(String(mode.id)))
          .map((mode) =>
            /^(onsite|on-site|face to face)$/i.test(mode.name)
              ? "On-site"
              : mode.name,
          );
        const categoryIds = ids(prefs.job_category_ids);
        const category = refs.job_categories.find((item) =>
          categoryIds.includes(item.id),
        );
        const parent = category?.parent_id
          ? refs.job_categories.find((item) => item.id === category.parent_id)
          : undefined;
        const posted = postedDate(job.last_activated_at ?? job.created_at);
        const allowance =
          job.allowance === 0 ? "Paid" : job.allowance === 1 ? "Unpaid" : null;
        const employer = job.employer ?? job.employers;
        const companyName = employer?.name ?? "Hiring company";
        // The public API may include a renderable logo URL; a storage key is
        // not an image URL, and the protected /pic endpoint must not be called
        // anonymously. Reuse the product avatar's broken-image fallback.
        const logo =
          employer?.logo && /^(https?:\/\/|\/(?!\/))/.test(employer.logo)
            ? employer.logo
            : undefined;
        const initials = companyName
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase();
        return (
          <article className="home-opportunity" key={job.id}>
            <Link className="home-opportunity-link" href={`/search/${job.id}`}>
              <div className="home-job-heading">
                <Avatar className="home-company-logo" aria-hidden="true">
                  <AvatarImage src={logo} alt="" loading="lazy" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3>{job.title || "Internship opportunity"}</h3>
                  <p className="home-company">{companyName}</p>
                </div>
              </div>
              <div className="home-job-facts">
                <span>
                  <MapPin aria-hidden="true" size={16} />
                  {job.location ||
                    (modes.includes("Remote")
                      ? "Remote"
                      : "Location not specified")}
                </span>
                {modes.length > 0 && (
                  <span>
                    <BriefcaseBusiness aria-hidden="true" size={16} />
                    {modes.join(" / ")}
                  </span>
                )}
              </div>
              <div className="home-tags">
                {category && <span>{parent?.name ?? category.name}</span>}
                {allowance && <span>{allowance}</span>}
              </div>
              <div className="home-job-footer">
                <time dateTime={posted.iso}>{posted.label}</time>
                <span className="home-card-action" aria-hidden="true">
                  View internship <ArrowRight size={14} />
                </span>
              </div>
            </Link>
            <a
              className="home-bookmark"
              href={loginHref}
              aria-label={`Log in to save ${job.title || "this internship"}`}
              title="Log in to save this internship"
            >
              <Bookmark aria-hidden="true" size={18} />
            </a>
          </article>
        );
      })}
    </div>
  );
}

export function OpportunitiesSkeleton() {
  return (
    <div
      className="home-opportunities-grid"
      role="status"
      aria-label="Loading latest internships"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="home-opportunity home-skeleton"
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
