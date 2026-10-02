import "server-only";
import { Job } from "../db/db.types";

export interface PublicTopPage {
  id: string;
  name: string;
  slug: string;
  accent_hex: string | null;
}

export type TopPageResolution =
  | { status: "ok"; page: PublicTopPage; jobs: Job[] }
  | { status: "moved"; slug: string }
  | { status: "not_found" };

/**
 * Fetches GET /top-pages/:slug — the resolver behind the public Top page
 * (Docs/plans/TOP_PAGES_IMPLEMENTATION_PLAN.md §4.1/§5.1). Same pattern as
 * job-preview.server.ts: anonymous, cached 60s to match the server's own
 * Cache-Control, never throws (a network failure degrades to not_found,
 * same as an unknown slug).
 */
export async function fetchTopPage(slug: string): Promise<TopPageResolution> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/top-pages/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } },
    );
    const data = (await res.json()) as Partial<TopPageResolution>;

    if (data?.status === "ok" && data.page && data.jobs) {
      return { status: "ok", page: data.page, jobs: data.jobs };
    }
    if (data?.status === "moved" && data.slug) {
      return { status: "moved", slug: data.slug };
    }
    return { status: "not_found" };
  } catch {
    return { status: "not_found" };
  }
}

export interface TopPageSitemapEntry {
  slug: string;
  updated_at: string;
}

/** Fetches GET /top-pages — published pages for app/student/sitemap.ts. */
export async function fetchPublishedTopPages(): Promise<TopPageSitemapEntry[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/top-pages`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];

    const data = (await res.json()) as { pages?: TopPageSitemapEntry[] };
    return data.pages ?? [];
  } catch {
    return [];
  }
}
