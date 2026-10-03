import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchTopUniversity } from "@/lib/api/top-page.server";
import { baseUrl } from "@/lib/site-url";
import { topUniversityHeading } from "@/lib/utils/top-page-heading";
import { TopUniversityLanding } from "@/components/features/student/top/TopUniversityLanding";

/**
 * A university's landing page: /<university>
 * (Docs/plans/TOP_PAGES_UNIVERSITY_PLAN.md D12), listing its live Top page
 * categories. Its data is cached 60s, like the category pages it links to;
 * the page itself is rendered on every request (see the note there).
 *
 * `[university]` is the first path segment of the student site, so this
 * route also receives every unknown one-segment path. Anything that is not
 * a university with at least one live category ends in the normal not-found
 * page (fetchTopUniversity rejects junk shapes without calling the server).
 *
 * Known cost: the not-found screen from here is sent with status 200 and a
 * `noindex` tag, not a 404 status — the response has already started
 * streaming (app/student/loading.tsx) by the time notFound() runs, same as
 * search/[job_id]. Before this route existed, an unknown one-segment path
 * matched nothing and got a real 404.
 */
export const revalidate = 60;

type Params = { params: Promise<{ university: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { university } = await params;
  const result = await fetchTopUniversity(university);
  if (result.status !== "ok") return {};

  const name = result.university.name;
  const categories = result.pages.map((page) => page.name).join(", ");
  const title = `Internships for ${name} Students`;
  const description = `This week's top internships for ${name} students on BetterInternship: ${categories}.`;

  return {
    title,
    description,
    alternates: { canonical: `/${result.university.slug}` },
    openGraph: { title, description, type: "website" },
  };
}

export default async function TopUniversityPage({ params }: Params) {
  const { university } = await params;
  const result = await fetchTopUniversity(university);
  if (result.status !== "ok") notFound();

  const universityUrl = `${baseUrl}/${result.university.slug}`;
  const structuredData = [
    {
      "@context": "https://schema.org/",
      "@type": "ItemList",
      name: topUniversityHeading(result.university.name),
      itemListElement: result.pages.map((page, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${page.name} Internships`,
        url: `${universityUrl}/top/${page.slug}`,
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
      <TopUniversityLanding
        university={result.university}
        pages={result.pages}
      />
    </>
  );
}
