import type { PosterTemplateProps } from "../theme-types";
import { posterTypography as typography } from "../typography";
import { Coins, House, MapPin } from "lucide-react";
import { studioTypography } from "./config";

/** Bottom-anchored flex composition; each group's content determines its size. */
export function StudioPoster({
  data,
  assets,
  adjustment = 0,
}: PosterTemplateProps) {
  const position = data.backgroundPosition ?? { x: 0.5, y: 0.5, scale: 1 };
  const fontFamily =
    data.fontStyle === "professional"
      ? "Space Grotesk"
      : data.fontStyle === "editorial"
        ? "Source Serif 4"
        : "Inter";
  const facts = [
    { id: "location", label: data.location, Icon: MapPin },
    { id: "setup", label: data.workMode ?? data.setup, Icon: House },
    { id: "pay", label: data.payCompact ?? data.pay, Icon: Coins },
  ].filter((fact) => fact.label?.trim());
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: 1080,
        height: 1080,
        color: "#00113F",
        fontFamily,
      }}
    >
      <img
        src={assets.background}
        width={1080}
        height={1080}
        alt=""
        style={{
          position: "absolute",
          objectFit: "cover",
          objectPosition: `${position.x * 100}% ${position.y * 100}%`,
          transform: `scale(${position.scale})`,
          transformOrigin: `${position.x * 100}% ${position.y * 100}%`,
        }}
      />
      {data.backgroundImage?.startsWith("data:") && (
        <div
          style={{
            display: "flex",
            position: "absolute",
            width: 1080,
            height: 1080,
            backgroundImage:
              "linear-gradient(90deg, rgba(255,255,255,.94) 0%, rgba(255,255,255,.72) 65%, rgba(255,255,255,.18) 100%)",
          }}
        />
      )}
      <div
        data-poster="composition"
        style={{
          display: "flex",
          position: "absolute",
          bottom: 45,
          left: 69,
          width: 935,
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 32,
          textAlign: "left",
        }}
      >
        <div
          data-poster="identity-group"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            width: 650,
            gap: 16,
          }}
        >
          {assets.logo ? (
            <img
              src={assets.logo.src}
              width={assets.logo.width}
              height={assets.logo.height}
              alt=""
            />
          ) : (
            <div
              data-poster="company"
              style={{
                display: "flex",
                fontSize: typography.company.size,
                lineHeight: 1,
                fontWeight: typography.company.weight,
                width: 650,
                justifyContent: "flex-start",
                textAlign: "left",
              }}
            >
              {data.company}
            </div>
          )}
          <div
            data-poster="title"
            style={{
              display: "flex",
              width: 650,
              fontSize: Math.max(
                data.fontStyle === "editorial" ? 42 : 48,
                studioTypography.titleSize - adjustment,
              ),
              fontWeight: 400,
              lineHeight: 115 / 130,
            }}
          >
            {data.title}
          </div>
        </div>
        {data.description && (
          <div
            data-poster="description"
            style={{
              display: "flex",
              width: 680,
              fontSize: typography.description.size,
              fontWeight: typography.description.weight,
              lineHeight: typography.description.lineHeight,
            }}
          >
            {data.description}
          </div>
        )}
        {facts.length > 0 && (
          <div
            data-poster="details"
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
            }}
          >
            {facts.map(({ id, label, Icon }) => (
              <div
                key={id}
                data-poster="chip"
                style={{
                  display: "flex",
                  height: 62,
                  alignItems: "center",
                  borderRadius: 28,
                  padding: "0 19px",
                  gap: 12,
                  backgroundColor: "#FFFFFF",
                  fontWeight: typography.detail.weight,
                  fontSize: studioTypography.detailSize,
                  lineHeight: 1,
                }}
              >
                <Icon size={34} color="#00113F" strokeWidth={2} />
                <div style={{ display: "flex", whiteSpace: "nowrap" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}
        <div
          data-poster="action"
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 21,
          }}
        >
          <div
            style={{
              display: "flex",
              position: "relative",
              width: assets.qr.size,
              height: assets.qr.size,
            }}
          >
            <img
              src={assets.qr.src}
              width={assets.qr.size}
              height={assets.qr.size}
              alt=""
            />
            {assets.logo && (
              <div
                style={{
                  display: "flex",
                  position: "absolute",
                  left: assets.qr.size * 0.4,
                  top: assets.qr.size * 0.4,
                  width: assets.qr.size * 0.2,
                  height: assets.qr.size * 0.2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={assets.logo.src}
                  width={assets.qr.size * 0.2}
                  height={assets.qr.size * 0.2}
                  alt=""
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: typography.footer.size,
              fontWeight: 400,
              lineHeight: 1,
              gap: 4,
            }}
          >
            <div style={{ display: "flex" }}>Scan to apply via</div>
            <div style={{ display: "flex" }}>BetterInternship</div>
          </div>
        </div>
      </div>
    </div>
  );
}
