import { fetchTopUniversityPage } from "@/lib/api/top-page.server";
import { topHeading } from "@/lib/utils/top-page-heading";
import { currentManilaWeek } from "@/lib/utils/manila-week";
import { renderTopOgImage } from "@/lib/utils/top-og-image";

/**
 * Generated OG image for a university's category page: heading, university,
 * date range and first 3 company names, in the job previews' brand style.
 * Falls back to the static /og.png on any failure — not found, not live, or
 * a fetch error — same contract as the per-job OG route. Cached 60s (not the
 * job route's 86400): the whole point of this feature is that the line-up
 * rotates weekly.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ university: string; slug: string }> },
) {
  const { university, slug } = await context.params;
  const fallback = () =>
    Response.redirect(new URL("/og.png", request.url).toString(), 307);

  try {
    const result = await fetchTopUniversityPage(university, slug);
    if (result.status !== "ok") return fallback();

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
