import { ImageResponse } from "next/og";
import { getSuperListingOgConfig } from "../../og-config";

export const contentType = "image/png";

export const size = {
  width: 1200,
  height: 630,
};

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
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "58px",
        background:
          "radial-gradient(circle at 15% 15%, rgba(255,255,255,0.2), transparent 35%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.14), transparent 42%), linear-gradient(135deg, #0b1220 0%, #111827 50%, #030712 100%)",
        color: "white",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-120px",
          right: "-120px",
          width: "340px",
          height: "340px",
          borderRadius: "999px",
          background: config.glow,
          opacity: 0.2,
          filter: "blur(24px)",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          fontSize: 26,
          color: "#e5e7eb",
          letterSpacing: "-0.01em",
        }}
      >
        {config.logoDataUrl ? (
          <img
            src={config.logoDataUrl}
            alt={`${config.company} logo`}
            width={40}
            height={40}
            style={{
              width: 40,
              height: 40,
              objectFit: "contain",
              borderRadius: 10,
              background: "rgba(17,24,39,0.65)",
              padding: "4px",
            }}
          />
        ) : null}
        <span style={{ fontWeight: 800 }}>BetterInternship</span>
        <span style={{ opacity: 0.55 }}>x</span>
        <span style={{ fontWeight: 700 }}>{config.company}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div
          style={{
            alignSelf: "flex-start",
            display: "flex",
            alignItems: "center",
            borderRadius: "999px",
            border: `2px solid ${config.glow}`,
            background: "rgba(17, 24, 39, 0.75)",
            color: "#f9fafb",
            padding: "10px 18px",
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
          }}
        >
          {config.badgeLabel || "Super Listing"}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            maxWidth: "1000px",
          }}
        >
          <div
            style={{
              fontSize: 68,
              lineHeight: 0.95,
              letterSpacing: "-0.045em",
              fontWeight: 900,
              textTransform: "uppercase",
            }}
          >
            {config.company}
          </div>
          <div
            style={{
              fontSize: 34,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#e5e7eb",
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
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div
          style={{
            fontSize: 26,
            lineHeight: 1.25,
            color: "#d1d5db",
            maxWidth: "840px",
          }}
        >
          {config.tagline}
        </div>
        <div
          style={{
            display: "flex",
            borderRadius: "14px",
            border: `2px solid ${config.accent}`,
            background: "rgba(17, 24, 39, 0.8)",
            padding: "10px 14px",
            fontSize: 16,
            color: "#f9fafb",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          betterinternship.com
        </div>
      </div>
    </div>,
    size,
  );
}
