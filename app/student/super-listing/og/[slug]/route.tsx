import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getSuperListingOgConfig } from "../../og-config";

export const contentType = "image/png";

export const size = {
  width: 1200,
  height: 630,
};

const betterInternshipLogoDataUrl = (() => {
  try {
    const logoPath = path.join(process.cwd(), "public/BetterInternshipLogo.png");
    const logoBuffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch {
    return undefined;
  }
})();

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const config = getSuperListingOgConfig(slug);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        padding: "34px",
        background:
          "radial-gradient(circle at 12% 18%, rgba(14,116,144,0.14), transparent 34%), radial-gradient(circle at 88% 84%, rgba(59,130,246,0.15), transparent 40%), linear-gradient(rgba(148,163,184,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.16) 1px, transparent 1px), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
        backgroundSize: "auto, auto, 38px 38px, 38px 38px, auto",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-90px",
          right: "-100px",
          width: "300px",
          height: "300px",
          borderRadius: "999px",
          background: config.glow,
          opacity: 0.26,
          filter: "blur(42px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-120px",
          left: "-120px",
          width: "320px",
          height: "320px",
          borderRadius: "999px",
          background: "#0f4e8a",
          opacity: 0.16,
          filter: "blur(42px)",
        }}
      />

      <div
        style={{
          width: "100%",
          borderRadius: "24px",
          border: "1px solid rgba(148,163,184,0.45)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.88))",
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.12)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "34px 38px",
          color: "#0f172a",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {betterInternshipLogoDataUrl ? (
              <img
                src={betterInternshipLogoDataUrl}
                alt="BetterInternship logo"
                width={44}
                height={44}
                style={{
                  width: 44,
                  height: 44,
                  objectFit: "contain",
                }}
              />
            ) : null}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: 1,
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 900, color: "#111827" }}>
                BetterInternship
              </span>
              <span
                style={{
                  marginTop: 4,
                  fontSize: 14,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#334155",
                  fontWeight: 700,
                }}
              >
                Super Listings
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.6)",
              background: "rgba(255,255,255,0.82)",
              color: "#0f172a",
              padding: "8px 14px",
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {config.badgeLabel || "Super Listing"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "#334155",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {config.logoDataUrl ? (
              <img
                src={config.logoDataUrl}
                alt={`${config.company} logo`}
                width={28}
                height={28}
                style={{
                  width: 28,
                  height: 28,
                  objectFit: "contain",
                }}
              />
            ) : null}
            <span>BetterInternship x {config.company}</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxWidth: "1000px",
            }}
          >
            <div
              style={{
                fontSize: 72,
                lineHeight: 0.92,
                letterSpacing: "-0.045em",
                fontWeight: 900,
                textTransform: "uppercase",
                color: "#0f172a",
              }}
            >
              {config.company}
            </div>
            <div
              style={{
                fontSize: 34,
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
                color: "#334155",
                fontWeight: 700,
              }}
            >
              {config.role}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div
            style={{
              fontSize: 25,
              lineHeight: 1.3,
              color: "#334155",
              maxWidth: "830px",
            }}
          >
            {config.tagline}
          </div>
          <div
            style={{
              display: "flex",
              borderRadius: "12px",
              border: `2px solid ${config.accent}`,
              background: "white",
              padding: "10px 14px",
              fontSize: 16,
              color: "#0f172a",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 800,
              whiteSpace: "nowrap",
            }}
          >
            betterinternship.com
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
