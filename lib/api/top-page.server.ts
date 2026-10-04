import "server-only";
import { Job } from "../db/db.types";

export interface PublicTopPage {
  id: string;
  name: string;
  slug: string;
}

/**
 * The university a Top page link belongs to
 * (Docs/plans/TOP_PAGES_UNIVERSITY_PLAN.md). `slug` is the university's part
 * of the URL, built by the server from its name on every request.
 */
export interface PublicTopUniversity {
  id: string;
  name: string;
  slug: string;
  accent_hex: string | null;
  /** False = no partner-platform account; the page offers an invite instead. */
  has_partner_account: boolean;
}

/** One of the university's other live categories. */
export interface TopPageLink {
  name: string;
  slug: string;
}

export interface TopUniversityPageCard extends PublicTopPage {
  /** Listings visible on that category page right now. */
  listing_count: number;
}

export type TopUniversityResolution =
  | {
      status: "ok";
      university: PublicTopUniversity;
      pages: TopUniversityPageCard[];
    }
  | { status: "not_found" };

/** A university and the categories ticked for it (GET /top-pages/universities/:slug). */
export type TopUniversitySummaryResolution =
  | {
      status: "ok";
      university: PublicTopUniversity;
      pages: PublicTopPage[];
    }
  | { status: "not_found" };

/** One category's listings, the same for every university (GET /top-pages/categories/:slug). */
export type TopCategoryResolution =
  | { status: "ok"; page: PublicTopPage; jobs: Job[] }
  | { status: "moved"; slug: string }
  | { status: "not_found" };

export type TopUniversityPageResolution =
  | {
      status: "ok";
      university: PublicTopUniversity;
      page: PublicTopPage;
      jobs: Job[];
      siblings: TopPageLink[];
    }
  | { status: "moved"; slug: string }
  // The university has live pages, but not this one.
  | { status: "university_only" }
  | { status: "not_found" };

/**
 * `[university]` is the first path segment on the student site, so it also
 * receives every unknown one-segment path (bots asking for /wp-login.php
 * and the like). Anything that can't be a URL name the server would build —
 * lowercase letters and digits joined by single hyphens, at most 60
 * characters — is rejected here, before it costs a request to the server.
 */
export function isTopSlugShape(value: string): boolean {
  return value.length <= 60 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value);
}

/**
 * How long Top page data and the pages built from it are cached
 * (Docs/plans/TOP_PAGES_STATIC_GENERATION_PLAN.md D2): a safety net, not the
 * normal refresh. Career-Server revalidates the tags below whenever something
 * changes, so under normal operation nothing is ever this old. Next needs a
 * literal for a route's own `revalidate` export, so those files repeat the
 * number; keep them in step with this one.
 */
export const TOP_PAGES_REVALIDATE_SECONDS = 604800;

/**
 * Cache tags (plan D6), keyed by the URL slug because that is what a page
 * knows. Career-Server builds the same strings when it asks for a
 * revalidation (src/top-pages/top-pages-regeneration.service.ts).
 */
export const topCategoryTag = (slug: string) => `top:cat:${slug}`;
export const topUniversityTag = (slug: string) => `top:uni:${slug}`;
export const TOP_SITEMAP_TAG = "top:sitemap";

const apiUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_URL}${path}`;

/**
 * The server could not answer (network failure, 5xx, unreadable body). This
 * is thrown rather than turned into `not_found`: a cached page outlives the
 * moment it was built, so a transient failure must not be baked into a
 * week-long "not found". A page that throws is not cached — Next keeps
 * serving the previous version, or shows an error for a page not built yet.
 */
export class TopPageFetchError extends Error {
  constructor(path: string, detail: string) {
    super(`Top pages request ${path} failed: ${detail}`);
    this.name = "TopPageFetchError";
  }
}

async function fetchTopJson<T extends { status?: string }>(
  path: string,
  tags: string[],
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      next: { tags, revalidate: TOP_PAGES_REVALIDATE_SECONDS },
    });
  } catch (error) {
    throw new TopPageFetchError(path, String(error));
  }
  if (!res.ok) throw new TopPageFetchError(path, `HTTP ${res.status}`);

  try {
    return (await res.json()) as T;
  } catch (error) {
    throw new TopPageFetchError(path, String(error));
  }
}

/**
 * Fetches GET /top-pages/categories/:slug — a category's listings. Identical
 * for every university, so every university page shares this one cached
 * response (plan D5).
 */
export async function fetchTopCategory(
  pageSlug: string,
): Promise<TopCategoryResolution> {
  if (!isTopSlugShape(pageSlug)) return { status: "not_found" };

  const data = await fetchTopJson<{
    status?: string;
    page?: PublicTopPage;
    jobs?: Job[];
    slug?: string;
  }>(`/top-pages/categories/${encodeURIComponent(pageSlug)}`, [
    topCategoryTag(pageSlug),
  ]);

  if (data.status === "ok" && data.page && data.jobs) {
    return { status: "ok", page: data.page, jobs: data.jobs };
  }
  if (data.status === "moved" && data.slug) {
    return { status: "moved", slug: data.slug };
  }
  if (data.status === "not_found") return { status: "not_found" };
  throw new TopPageFetchError(pageSlug, "unexpected category response");
}

/**
 * Fetches GET /top-pages/universities/:slug — the university and the
 * categories ticked for it, without any listings.
 */
export async function fetchTopUniversitySummary(
  universitySlug: string,
): Promise<TopUniversitySummaryResolution> {
  if (!isTopSlugShape(universitySlug)) return { status: "not_found" };

  const data = await fetchTopJson<{
    status?: string;
    university?: PublicTopUniversity;
    pages?: PublicTopPage[];
  }>(`/top-pages/universities/${encodeURIComponent(universitySlug)}`, [
    topUniversityTag(universitySlug),
  ]);

  if (data.status === "ok" && data.university && data.pages) {
    return { status: "ok", university: data.university, pages: data.pages };
  }
  if (data.status === "not_found") return { status: "not_found" };
  throw new TopPageFetchError(universitySlug, "unexpected university response");
}

/**
 * The university landing page's data: the summary plus how many listings each
 * category shows right now. The counts come from the category fetches the
 * category pages share, so they cost no extra request once those are cached.
 */
export async function fetchTopUniversity(
  universitySlug: string,
): Promise<TopUniversityResolution> {
  const summary = await fetchTopUniversitySummary(universitySlug);
  if (summary.status !== "ok") return { status: "not_found" };

  const pages = await Promise.all(
    summary.pages.map(async (page) => {
      const category = await fetchTopCategory(page.slug);
      return {
        ...page,
        listing_count: category.status === "ok" ? category.jobs.length : 0,
      };
    }),
  );
  return { status: "ok", university: summary.university, pages };
}

/**
 * The resolver behind /<university>/top/<slug>, composed from the two cached
 * fetches above (plan §3.2).
 *
 *   not_found        unknown university (or one with no live category), or a
 *                    category that does not exist / is not published
 *   university_only  the university is live and the category exists, but it
 *                    is not ticked for this university
 *   moved            an old slug of a category that is ticked for it
 */
export async function fetchTopUniversityPage(
  universitySlug: string,
  pageSlug: string,
): Promise<TopUniversityPageResolution> {
  if (!isTopSlugShape(universitySlug) || !isTopSlugShape(pageSlug)) {
    return { status: "not_found" };
  }

  const [summary, category] = await Promise.all([
    fetchTopUniversitySummary(universitySlug),
    fetchTopCategory(pageSlug),
  ]);
  if (summary.status !== "ok" || category.status === "not_found") {
    return { status: "not_found" };
  }

  if (category.status === "moved") {
    return summary.pages.some((page) => page.slug === category.slug)
      ? { status: "moved", slug: category.slug }
      : { status: "university_only" };
  }

  if (!summary.pages.some((page) => page.id === category.page.id)) {
    return { status: "university_only" };
  }

  return {
    status: "ok",
    university: summary.university,
    page: category.page,
    jobs: category.jobs,
    siblings: summary.pages
      .filter((page) => page.id !== category.page.id)
      .map(({ name, slug }) => ({ name, slug })),
  };
}

export interface TopSitemapUniversity {
  slug: string;
  pages: { slug: string; updated_at: string; listing_count: number }[];
}

/**
 * Fetches GET /top-pages/universities — every university with a live page,
 * and those pages, for app/student/sitemap.ts. Unlike the page fetches this
 * degrades to an empty list on failure: the sitemap route re-runs hourly, so
 * nothing stays wrong for long.
 */
export async function fetchTopSitemap(): Promise<TopSitemapUniversity[]> {
  try {
    const res = await fetch(apiUrl("/top-pages/universities"), {
      next: {
        tags: [TOP_SITEMAP_TAG],
        revalidate: TOP_PAGES_REVALIDATE_SECONDS,
      },
    });
    if (!res.ok) return [];

    const data = (await res.json()) as {
      universities?: TopSitemapUniversity[];
    };
    return data.universities ?? [];
  } catch {
    return [];
  }
}
