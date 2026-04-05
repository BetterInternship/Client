import fs from "node:fs";
import path from "node:path";
import React from "react";
import { ImageResponse } from "next/og";
import { getSuperListingOgConfig } from "../../og-config";

export const contentType = "image/png";

export const size = {
  width: 1200,
  height: 630,
};

const BRAND_COLOR = "#0b5493";

const betterInternshipLogoDataUrl = (() => {
  try {
    const logoPath = path.join(
      process.cwd(),
      "public/BetterInternshipLogo.png",
    );
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
  const companyFontSize = slug === "cebu-pacific" ? 84 : 96;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        padding: "34px",
        background: "#f8fafc",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      <div
        style={{
          width: "100%",
          borderRadius: "0.33em",
          border: "1px solid rgba(148, 163, 184, 0.4)",
          background: "#ffffff",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
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
              borderRadius: "0.33em",
              border: "1px solid rgba(245, 158, 11, 0.45)",
              background: "#ffffff",
              padding: "12px 20px",
              fontSize: 22,
              fontWeight: 800,
              color: "#78350f",
              letterSpacing: "0.03em",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>⚡</span>
            <span>SUPER LISTING</span>
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
              borderRadius: "0.33em",
              border: "1px solid rgba(245, 158, 11, 0.45)",
              background: "#fef3c7",
              color: "#78350f",
              padding: "12px 18px",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "0.01em",
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
                fontSize: companyFontSize,
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
              color: BRAND_COLOR,
              letterSpacing: "0.01em",
              fontWeight: 700,
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
