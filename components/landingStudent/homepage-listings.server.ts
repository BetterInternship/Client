import "server-only";
import { fetchTopCategory, TopPageFetchError } from "@/lib/api/top-page.server";
import type { Job, RefsData } from "@/lib/db/db.types";
import { formatListingAge } from "@/lib/utils/relative-age";
import type { JobCardData } from "@/components/ui/temp/job-card";
import { homepageFieldSlugs, homepageHeroCategories } from "./homepage-data";

export type HomepageListing = JobCardData & { id: string };
export type HomepageListings = Record<string, HomepageListing[]>;

const LISTING_LIMIT = 6;

function toHomepageListing(
  job: Job & { id: string },
  category: string,
  refs: RefsData,
): HomepageListing {
  const modeIds = job.internship_preferences?.job_setup_ids ?? [];
  const workMode = refs.job_modes
    .filter((mode) => modeIds.some((id) => String(id) === String(mode.id)))
    .map((mode) =>
      /^(onsite|on-site|face to face)$/i.test(mode.name)
        ? "On-site"
        : mode.name,
    )
    .join(" / ");

  return {
    id: job.id,
    title: job.title?.trim() || "Internship opportunity",
    companyName:
      job.employer?.name?.trim() ||
      job.employers?.name?.trim() ||
      "Hiring company",
    location:
      job.location?.trim() ||
      (workMode === "Remote" ? "Remote" : "Location not specified"),
    workMode,
    category,
    compensation: job.allowance === 0 ? "Paid" : "",
    postedLabel: job.hibernating
      ? "Just missed"
      : formatListingAge(job.last_activated_at ?? job.created_at),
    href: `/search/${job.id}`,
  };
}

/** Reuse the Top pages' tagged cache. Fetch failures propagate so ISR keeps
 * the previous page instead of caching an outage as an empty listing set. */
export async function fetchHomepageListings(
  refs: RefsData,
): Promise<HomepageListings> {
  const categories = await Promise.all(
    homepageHeroCategories.map(
      async ({ field, label }): Promise<[string, HomepageListing[]]> => {
        const slug = homepageFieldSlugs[field];
        const initial = await fetchTopCategory(slug);
        const result =
          initial.status === "moved"
            ? await fetchTopCategory(initial.slug)
            : initial;
        if (result.status === "not_found") return [field, []];
        if (result.status !== "ok")
          throw new TopPageFetchError(slug, "category alias did not resolve");

        const seen = new Set<string>();
        const jobs = result.jobs
          .filter((job): job is Job & { id: string } => {
            if (!job.id || seen.has(job.id)) return false;
            seen.add(job.id);
            return true;
          })
          .slice(0, LISTING_LIMIT)
          .map((job) => toHomepageListing(job, label, refs));
        return [field, jobs];
      },
    ),
  );

  // Mix categories in their curated order, without repeating cross-listed jobs.
  const featured: HomepageListing[] = [];
  const seen = new Set<string>();
  for (
    let index = 0;
    index < LISTING_LIMIT && featured.length < LISTING_LIMIT;
    index++
  ) {
    for (const [, jobs] of categories) {
      const job = jobs[index];
      if (!job || seen.has(job.id)) continue;
      seen.add(job.id);
      featured.push(job);
      if (featured.length === LISTING_LIMIT) break;
    }
  }

  const listings: HomepageListings = {};
  for (const [field, jobs] of categories) listings[field] = jobs;
  listings.All = featured;
  return listings;
}
