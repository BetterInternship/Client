import { fetchTopUniversity } from "@/lib/api/top-page.server";
import { TOP_UNIVERSITY_OG_HEADING } from "@/lib/utils/top-page-heading";
import { currentManilaWeek } from "@/lib/utils/manila-week";
import { renderTopOgImage } from "@/lib/utils/top-og-image";

// Cached like the pages it illustrates (Docs/plans/TOP_PAGES_STATIC_GENERATION_PLAN.md
// D17): built on first request, rebuilt when Career-Server revalidates the
// tags on the data it reads. Next needs these as literals in this file.
export const dynamic = "force-static";
export const revalidate = 604800; // TOP_PAGES_REVALIDATE_SECONDS

export function generateStaticParams() {
  return [];
}

/**
 * Generated OG image for a university's landing page: the category pages'
 * image with a general heading, the university and the week. Falls back to
 * the static /og.png when the university has nothing to show; a failed fetch
 * is not caught, so it is not cached (see TopPageFetchError).
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ university: string }> },
) {
  const { university } = await context.params;
  const fallback = () =>
    Response.redirect(new URL("/og.png", request.url).toString(), 307);

  const result = await fetchTopUniversity(university);
  if (result.status !== "ok") return fallback();

  try {
    return await renderTopOgImage({
      heading: TOP_UNIVERSITY_OG_HEADING,
      universityName: result.university.name,
      weekLabel: currentManilaWeek().label,
    });
  } catch {
    return fallback();
  }
}
