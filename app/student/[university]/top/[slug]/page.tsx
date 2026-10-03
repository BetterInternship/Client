import { notFound, permanentRedirect, redirect } from "next/navigation";
import { fetchTopUniversityPage } from "@/lib/api/top-page.server";
import { baseUrl } from "@/lib/site-url";
import { currentManilaWeek } from "@/lib/utils/manila-week";
import { TopPageView } from "@/components/features/student/top/TopPageView";

/**
 * A university's category page: /<university>/top/<slug>
 * (Docs/plans/TOP_PAGES_UNIVERSITY_PLAN.md). The listings are the category's
 * own curated set — the same for every university — with the university
 * named in the heading.
 *
 * A cached static page (Docs/plans/TOP_PAGES_STATIC_GENERATION_PLAN.md).
 * `generateStaticParams` returns nothing, so a build renders no page and
 * never calls Career-Server; each page is built on its first visit (or by
 * Career-Server's warm-up) and then served from the cache. It is rebuilt only
 * when Career-Server revalidates the tags on its data
 * (app/student/api/top-pages/revalidate), or after `revalidate` seconds as a
 * safety net. Because it is built once, anything read from the clock here —
 * `weekKey` — is frozen until the next rebuild; keep request-time state out
 * of this file (the week banner reads `?week=` in the browser for that
 * reason).
 */
export const revalidate = 604800; // TOP_PAGES_REVALIDATE_SECONDS

export function generateStaticParams() {
  return [];
}

export default async function TopPage({
  params,
  searchParams,
}: {
  params: Promise<{ university: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { university, slug } = await params;
  const result = await fetchTopUniversityPage(university, slug);

  // An old slug always points at the page's current one — 308 so search
  // engines and browsers update their own records of the URL. The query
  // string rides along: a renamed page's old pubmat QR still carries ?week=,
  // and that is exactly the stale-QR case (week-param plan D8). searchParams
  // is awaited only here, so the normal path stays free of request-time
  // APIs and the page can be cached statically.
  if (result.status === "moved") {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(await searchParams)) {
      for (const item of Array.isArray(value) ? value : [value]) {
        if (item !== undefined) query.append(key, item);
      }
    }
    const search = query.toString();
    permanentRedirect(
      `/${university}/top/${result.slug}${search ? `?${search}` : ""}`,
    );
  }
  // The university is live but this category isn't (unticked, unpublished or
  // unknown): its landing page lists what it does have. 307 — the category
  // could be ticked later.
  if (result.status === "university_only") redirect(`/${university}`);
  // No such university, or one with no live page at all, or no such
  // category. A real 404 (not a redirect), so the cached answer is a proper
  // "gone" that crawlers drop and bots can't fill the cache with 200s.
  if (result.status === "not_found") notFound();

  const universityUrl = `${baseUrl}/${result.university.slug}`;
  const structuredData = [
    {
      "@context": "https://schema.org/",
      "@type": "ItemList",
      itemListElement: result.jobs.map((job, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${baseUrl}/search/${job.id}`,
      })),
    },
    {
      "@context": "https://schema.org/",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "BetterInternship",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: result.university.name,
          item: universityUrl,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `${result.page.name} Internships`,
          item: `${universityUrl}/top/${result.page.slug}`,
        },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      {/* The week is computed here, not in the browser, so the old-QR banner
          compares against the server's clock — as of when the page was last
          built (Career-Server rebuilds every page at the Sunday 00:00 Manila
          rollover). */}
      <TopPageView
        page={result.page}
        university={result.university}
        siblings={result.siblings}
        initialJobs={result.jobs}
        weekKey={currentManilaWeek().key}
      />
    </>
  );
}
