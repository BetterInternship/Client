import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/site-url";

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
  const jobs = await fetchSitemapJobs();

  const jobEntries: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${baseUrl}/search/${job.id}`,
    lastModified:
      job.last_activated_at ?? job.updated_at ?? job.created_at ?? undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/search`, changeFrequency: "daily", priority: 0.9 },
    {
      url: `${baseUrl}/companies/sofi-ai`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/companies/anteriore`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/companies/fff`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  return [...staticEntries, ...jobEntries];
}
