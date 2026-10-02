import { permanentRedirect, redirect } from "next/navigation";
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
 * What is cached is the data, not the page: fetchTopUniversityPage's fetch
 * is held for 60s (matching the server's own Cache-Control), so a god edit
 * or the Sunday week rollover shows up within a minute. The page itself is
 * rendered on every request — with no generateStaticParams, Next treats a
 * dynamic segment as server-rendered on demand (confirmed with `next build`,
 * 2026-10-02), and this `revalidate` only sets the segment's default for
 * fetches.
 */
export const revalidate = 60;

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
  // APIs and could be made a cached static page later without changes.
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
  // No such university, or one with no live page at all.
  if (result.status === "not_found") redirect("/search");

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
          compares against the server's clock (cached ≤60s with the page). */}
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
