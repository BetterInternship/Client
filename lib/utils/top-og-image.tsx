import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { topUniversityLine } from "@/lib/utils/top-page-heading";

const size = { width: 1200, height: 630 };

// Use the same brand assets and type as the per-job link previews.
const betterInternshipLogo = `data:image/png;base64,${fs
  .readFileSync(path.join(process.cwd(), "public/BetterInternshipLogo.png"))
  .toString("base64")}`;
const backgroundImage = `data:image/png;base64,${fs
  .readFileSync(path.join(process.cwd(), "public/bg.png"))
  .toString("base64")}`;
const spaceGroteskMediumUrl =
  "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7aUUsj.ttf";
const spaceGroteskBoldUrl =
  "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj4PVksj.ttf";

async function fetchFont(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not load preview font");
  return response.arrayBuffer();
}

/**
 * The OG image shared by a university's landing page and its category pages:
 * logo, heading, "for <university> students", the week, and (category pages
 * only) the first few companies. One layout, so the two stay alike. Throws if
 * the fonts can't be loaded — callers fall back to the static /og.png.
 * Cached 60s: the line-up rotates weekly.
 */
export async function renderTopOgImage({
  heading,
  universityName,
  weekLabel,
  companies = [],
}: {
  heading: string;
  universityName: string;
  weekLabel: string;
  companies?: string[];
}) {
  const [spaceGroteskMedium, spaceGroteskBold] = await Promise.all([
    fetchFont(spaceGroteskMediumUrl),
    fetchFont(spaceGroteskBoldUrl),
  ]);
  const titleFontSize =
    heading.length <= 42
      ? 74
      : heading.length <= 60
        ? 62
        : heading.length <= 85
          ? 52
          : 44;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        color: "#061633",
        fontFamily: "Space Grotesk",
      }}
    >
      <img
        src={backgroundImage}
        alt=""
        width={1200}
        height={630}
        style={{ position: "absolute", left: 0, top: 0, objectFit: "cover" }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 980,
          gap: 24,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={betterInternshipLogo}
            alt="BetterInternship logo"
            width={44}
            height={44}
            style={{ objectFit: "contain" }}
          />
          <span style={{ fontSize: 26, fontWeight: 700 }}>
            BetterInternship
          </span>
        </div>
        <div
          style={{
            fontSize: titleFontSize,
            fontWeight: 700,
            lineHeight: 1.2,
            textAlign: "center",
            maxWidth: 980,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
            overflow: "hidden",
          }}
        >
          {heading}
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            lineHeight: 1.25,
            textAlign: "center",
            maxWidth: 980,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
          }}
        >
          {topUniversityLine(universityName)}
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: "#345064",
            textAlign: "center",
          }}
        >
          {weekLabel}
        </div>
        {companies.length > 0 && (
          <div
            style={{
              fontSize: 24,
              fontWeight: 500,
              color: "#345064",
              maxWidth: 980,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textAlign: "center",
            }}
          >
            {companies.join(" · ")}
          </div>
        )}
      </div>
    </div>,
    {
      ...size,
      headers: { "Cache-Control": "public, max-age=60" },
      fonts: [
        {
          name: "Space Grotesk",
          data: spaceGroteskMedium,
          weight: 500,
          style: "normal",
        },
        {
          name: "Space Grotesk",
          data: spaceGroteskBold,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
