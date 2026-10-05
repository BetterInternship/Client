import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/site-url";
import { fetchTopSitemap } from "@/lib/api/top-page.server";

export const revalidate = 3600;

interface SitemapJob {
  id: string;
  last_activated_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
}

async function fetchSitemapJobs(): Promise<SitemapJob[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const data = (await res.json()) as { jobs?: SitemapJob[] };

    return data.jobs ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jobs, topUniversities] = await Promise.all([
    fetchSitemapJobs(),
    fetchTopSitemap(),
  ]);

  const jobEntries: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${baseUrl}/search/${job.id}`,
    lastModified:
      job.last_activated_at ?? job.updated_at ?? job.created_at ?? undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Nothing else on the site links to a Top page yet, so these entries are
  // the only way search engines discover them (besides shared links): each
  // live university's landing page, and each of its category pages. A
  // category with nothing to show this week is left out — its page sets
  // noindex for the same reason.
  const topPageEntries: MetadataRoute.Sitemap = topUniversities.flatMap(
    (university) => [
      {
        url: `${baseUrl}/${university.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
      ...university.pages
        .filter((page) => page.listing_count > 0)
        .map((page) => ({
          url: `${baseUrl}/${university.slug}/top/${page.slug}`,
          lastModified: page.updated_at,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })),
    ],
  );

  const staticEntries: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/search`, changeFrequency: "daily", priority: 0.9 },
    {
      url: `${baseUrl}/companies/sofi-ai`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/super-listing/anteriore`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/super-listing/fff`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/super-listing/pcc`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/super-listing/sofi-ai`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/super-listing/sofi-ai-marketing`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/super-listing/miro`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  return [...staticEntries, ...jobEntries, ...topPageEntries];
}
