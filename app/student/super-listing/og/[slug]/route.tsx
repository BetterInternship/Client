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
        background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.18) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          opacity: 0.55,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-130px",
          left: "-110px",
          width: "360px",
          height: "360px",
          borderRadius: "999px",
          background:
            "linear-gradient(135deg, rgba(15,78,138,0.34), rgba(96,165,250,0.24))",
          opacity: 0.85,
          filter: "blur(56px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-140px",
          right: "-120px",
          width: "390px",
          height: "390px",
          borderRadius: "999px",
          background:
            "linear-gradient(135deg, rgba(12,74,110,0.3), rgba(59,130,246,0.2))",
          opacity: 0.8,
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 80% at 50% 40%, rgba(248,250,252,0), rgba(248,250,252,0.75))",
        }}
      />

      <div
        style={{
          width: "100%",
          borderRadius: "0.33em",
          border: "1px solid rgba(148,163,184,0.45)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.88))",
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.12)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "36px 40px",
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
                width={68}
                height={68}
                style={{
                  width: 68,
                  height: 68,
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
              <span style={{ fontSize: 52, fontWeight: 900, color: "#111827" }}>
                BetterInternship
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.5)",
              background: "#ffffff",
              boxShadow: "0 8px 20px -14px rgba(15,23,42,0.45)",
              padding: "10px 16px",
              fontSize: 18,
              fontWeight: 800,
              color: "#78350f",
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>⚡</span>
            <span>Super Listing</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            marginTop: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-start",
              borderRadius: "999px",
              border: "1px solid #d6a300",
              background: "linear-gradient(180deg, #ffd96a 0%, #ffc100 100%)",
              color: "#111827",
              padding: "14px 20px",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
            }}
          >
            No resume needed, 24h response
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxWidth: "1000px",
            }}
          >
            <div
              style={{
                fontSize: 96,
                lineHeight: 0.94,
                letterSpacing: "-0.03em",
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              {config.company}
            </div>
            <div
              style={{
                fontSize: 54,
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
                color: "#334155",
                fontWeight: 600,
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
            justifyContent: "flex-start",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "#475569",
              letterSpacing: "0.01em",
              fontWeight: 600,
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
