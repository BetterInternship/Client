import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchTopUniversity } from "@/lib/api/top-page.server";
import { baseUrl } from "@/lib/site-url";
import { topUniversityHeading } from "@/lib/utils/top-page-heading";
import { currentManilaWeek } from "@/lib/utils/manila-week";
import { TopUniversityLanding } from "@/components/features/student/top/TopUniversityLanding";

/**
 * A university's landing page: /<university>
 * (Docs/plans/TOP_PAGES_UNIVERSITY_PLAN.md D12), listing its live Top page
 * categories. A cached static page, built and rebuilt the same way as the
 * category pages it links to (see [slug]/page.tsx).
 *
 * `[university]` is the first path segment of the student site, so this
 * route also receives every unknown one-segment path. Anything that is not
 * a university with at least one live category ends in notFound()
 * (fetchTopUniversity rejects junk shapes without calling the server). Since
 * the page is built before it is sent, that is a real 404 status, cached
 * like any other result.
 */
export const revalidate = 604800; // TOP_PAGES_REVALIDATE_SECONDS

export function generateStaticParams() {
  return [];
}

type Params = { params: Promise<{ university: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { university } = await params;
  const result = await fetchTopUniversity(university);
  if (result.status !== "ok") return {};

  const name = result.university.name;
  const categories = result.pages.map((page) => page.name).join(", ");
  const title = `Internships for ${name} Students`;
  const description = `This week's top internships for ${name} students on BetterInternship: ${categories}.`;
  const path = `/${result.university.slug}`;
  const image = {
    url: `${path}/og`,
    width: 1200,
    height: 630,
    alt: `Top internships for ${name} students — ${currentManilaWeek().label}`,
  };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, images: [image], type: "website" },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
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
