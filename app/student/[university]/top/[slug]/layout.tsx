import type { Metadata } from "next";
import { fetchTopUniversityPage } from "@/lib/api/top-page.server";
import { topUniversityPageTitle } from "@/lib/utils/top-page-heading";
import { currentManilaWeek } from "@/lib/utils/manila-week";

/**
 * Server-side metadata for a university's category page. Falls back to `{}`
 * on anything but 'ok', as search/[job_id]/layout.tsx does — the redirect in
 * page.tsx is what actually handles the other outcomes, this only needs to
 * not crash if it's ever hit in isolation (metadata generation runs in
 * parallel with the page itself, not after its redirect).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ university: string; slug: string }>;
}): Promise<Metadata> {
  const { university, slug } = await params;
  const result = await fetchTopUniversityPage(university, slug);
  if (result.status !== "ok") return {};

  const title = topUniversityPageTitle(
    result.jobs.length,
    result.page.name,
    result.university.name,
  );
  const week = currentManilaWeek();
  const companies = Array.from(
    new Set(
      result.jobs
        .map((job) => job.employer?.name)
        .filter((name): name is string => !!name),
    ),
  ).slice(0, 3);
  const featuring = companies.length
    ? ` Featuring ${companies.join(", ")}${
        result.jobs.length > companies.length ? " and more" : ""
      }.`
    : "";
  const description = `This week's top ${result.page.name} internships for ${result.university.name} students, ${week.label}.${featuring}`;

  // The address without ?week= (or any other query) is the one search
  // engines should keep, so every QR variant folds into it.
  const path = `/${result.university.slug}/top/${result.page.slug}`;
  const image = `${path}/og`;

  return {
    title,
    description,
    alternates: { canonical: path },
    // A category with nothing to show this week is not worth a search
    // result; it still opens for people.
    robots: result.jobs.length === 0 ? { index: false } : undefined,
    openGraph: { title, description, images: [image], type: "website" },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function TopPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
