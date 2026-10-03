import { fetchTopUniversityPage } from "@/lib/api/top-page.server";
import { topHeading } from "@/lib/utils/top-page-heading";
import { currentManilaWeek } from "@/lib/utils/manila-week";
import { renderTopOgImage } from "@/lib/utils/top-og-image";

// Cached like the page it illustrates (Docs/plans/TOP_PAGES_STATIC_GENERATION_PLAN.md
// D17): built on first request, rebuilt when Career-Server revalidates the
// tags on the data it reads. Next needs these as literals in this file.
export const dynamic = "force-static";
export const revalidate = 604800; // TOP_PAGES_REVALIDATE_SECONDS

export function generateStaticParams() {
  return [];
}

/**
 * Generated OG image for a university's category page: heading, university,
 * date range and first 3 company names, in the job previews' brand style.
 * Falls back to the static /og.png when the page is not live, or the image
 * cannot be drawn. A failed fetch is not caught, so it is not cached (see
 * TopPageFetchError).
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ university: string; slug: string }> },
) {
  const { university, slug } = await context.params;
  const fallback = () =>
    Response.redirect(new URL("/og.png", request.url).toString(), 307);

  const result = await fetchTopUniversityPage(university, slug);
  if (result.status !== "ok") return fallback();

  try {
    const companies = Array.from(
      new Set(
        result.jobs
          .map((job) => job.employer?.name)
          .filter((name): name is string => !!name),
      ),
    ).slice(0, 3);

    return await renderTopOgImage({
      heading: topHeading(result.jobs.length, result.page.name),
      universityName: result.university.name,
      weekLabel: currentManilaWeek().label,
      companies,
    });
  } catch {
    return fallback();
  }
}
