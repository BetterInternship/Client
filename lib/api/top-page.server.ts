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
 * of the URL, built by the server from its full name on every request.
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

const apiUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_URL}${path}`;

/**
 * Fetches GET /top-pages/universities/:slug — the university landing page.
 * Same pattern as job-preview.server.ts: anonymous, cached 60s to match the
 * server's own Cache-Control, never throws (a network failure degrades to
 * not_found, same as an unknown university).
 */
export async function fetchTopUniversity(
  universitySlug: string,
): Promise<TopUniversityResolution> {
  if (!isTopSlugShape(universitySlug)) return { status: "not_found" };

  try {
    const res = await fetch(
      apiUrl(`/top-pages/universities/${encodeURIComponent(universitySlug)}`),
      { next: { revalidate: 60 } },
    );
    const data = (await res.json()) as Partial<
      Extract<TopUniversityResolution, { status: "ok" }>
    >;

    if (data?.status === "ok" && data.university && data.pages) {
      return { status: "ok", university: data.university, pages: data.pages };
    }
    return { status: "not_found" };
  } catch {
    return { status: "not_found" };
  }
}

/**
 * Fetches GET /top-pages/universities/:universitySlug/:pageSlug — the
 * resolver behind /<university>/top/<slug>. Anonymous, cached 60s, never
 * throws.
 */
export async function fetchTopUniversityPage(
  universitySlug: string,
  pageSlug: string,
): Promise<TopUniversityPageResolution> {
  if (!isTopSlugShape(universitySlug) || !isTopSlugShape(pageSlug)) {
    return { status: "not_found" };
  }

  try {
    const res = await fetch(
      apiUrl(
        `/top-pages/universities/${encodeURIComponent(universitySlug)}/${encodeURIComponent(pageSlug)}`,
      ),
      { next: { revalidate: 60 } },
    );
    const data = (await res.json()) as {
      status?: string;
      university?: PublicTopUniversity;
      page?: PublicTopPage;
      jobs?: Job[];
      siblings?: TopPageLink[];
      slug?: string;
    };

    if (data?.status === "ok" && data.university && data.page && data.jobs) {
      return {
        status: "ok",
        university: data.university,
        page: data.page,
        jobs: data.jobs,
        siblings: data.siblings ?? [],
      };
    }
    if (data?.status === "moved" && data.slug) {
      return { status: "moved", slug: data.slug };
    }
    if (data?.status === "university_only")
      return { status: "university_only" };
    return { status: "not_found" };
  } catch {
    return { status: "not_found" };
  }
}

export interface TopSitemapUniversity {
  slug: string;
  pages: { slug: string; updated_at: string; listing_count: number }[];
}

/**
 * Fetches GET /top-pages/universities — every university with a live page,
 * and those pages, for app/student/sitemap.ts.
 */
export async function fetchTopSitemap(): Promise<TopSitemapUniversity[]> {
  try {
    const res = await fetch(apiUrl("/top-pages/universities"), {
      next: { revalidate: 3600 },
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
