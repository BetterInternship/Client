import { fetchTopUniversity } from "@/lib/api/top-page.server";
import { TOP_UNIVERSITY_OG_HEADING } from "@/lib/utils/top-page-heading";
import { currentManilaWeek } from "@/lib/utils/manila-week";
import { renderTopOgImage } from "@/lib/utils/top-og-image";

/**
 * Generated OG image for a university's landing page: the category pages'
 * image with a general heading, the university and the week. Falls back to
 * the static /og.png on any failure, like the category image.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ university: string }> },
) {
  const { university } = await context.params;
  const fallback = () =>
    Response.redirect(new URL("/og.png", request.url).toString(), 307);

  try {
    const result = await fetchTopUniversity(university);
    if (result.status !== "ok") return fallback();

    return await renderTopOgImage({
      heading: TOP_UNIVERSITY_OG_HEADING,
      universityName: result.university.name,
      weekLabel: currentManilaWeek().label,
    });
  } catch {
    return fallback();
  }
}
