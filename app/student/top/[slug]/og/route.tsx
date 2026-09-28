import { ImageResponse } from "next/og";
import { fetchTopPage } from "@/lib/api/top-page.server";
import {
  topHeading,
  DEFAULT_TOP_PAGE_ACCENT,
} from "@/lib/utils/top-page-heading";
import { currentManilaWeek } from "@/lib/utils/manila-week";
import { pickForeground } from "@/lib/utils/contrast";

const size = { width: 1200, height: 630 };

/**
 * Generated OG image for a Top page (plan D21): heading, date range, first 3
 * company names, in the page's accent colour. Falls back to the static
 * /og.png on any failure — not found, unpublished, or a fetch error — same
 * contract as the per-job OG route. Cached 60s (not the job route's 86400):
 * the whole point of this feature is that the line-up rotates weekly.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const fallback = () =>
    Response.redirect(new URL("/og.png", request.url).toString(), 307);

  try {
    const result = await fetchTopPage(slug);
    if (result.status !== "ok") return fallback();

    const accent = result.page.accent_hex ?? DEFAULT_TOP_PAGE_ACCENT;
    const foreground = pickForeground(accent);
    const heading = topHeading(result.jobs.length, result.page.name);
    const week = currentManilaWeek();
    const companies = Array.from(
      new Set(
        result.jobs
          .map((job) => job.employer?.name)
          .filter((name): name is string => !!name),
      ),
    ).slice(0, 3);

    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: accent,
          color: foreground,
          fontFamily: "sans-serif",
          padding: "0 80px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            opacity: 0.85,
            letterSpacing: 1,
          }}
        >
          BetterInternship
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 58,
            fontWeight: 700,
            lineHeight: 1.15,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
            overflow: "hidden",
          }}
        >
          {heading}
        </div>
        <div style={{ marginTop: 24, fontSize: 28, opacity: 0.9 }}>
          {week.label}
        </div>
        {companies.length > 0 && (
          <div style={{ marginTop: 32, fontSize: 24, opacity: 0.85 }}>
            {companies.join(" · ")}
          </div>
        )}
      </div>,
      {
        ...size,
        headers: { "Cache-Control": "public, max-age=60" },
      },
    );
  } catch {
    return fallback();
  }
}
