import type { PosterTemplateProps } from "../theme-types";
import { centeredConfig as theme } from "./config";

/** One flex composition, with profile tokens rather than independent y positions. */
export function CenteredPoster({
  data,
  assets: { background, logo, qr },
  adjustment = 0,
}: PosterTemplateProps) {
  const p = theme.layout;
  const header = p.primary.headerRegion;
  const title = p.text.jobTitle;
  const description = p.text.description;
  const details = p.details;
  const action = p.action;
  const facts = [
    ["LOCATION", data.location],
    ["WORK MODE", data.workMode ?? data.setup],
    ["ALLOWANCE", data.payCompact ?? data.pay],
  ].filter((fact): fact is [string, string] => Boolean(fact[1]?.trim()));
  return (
    <div
      style={{
        display: "flex",
        width: 1080,
        height: 1080,
        position: "relative",
        fontFamily: "Inter",
        color: theme.colors.text,
      }}
    >
      <img
        src={background}
        width={1080}
        height={1080}
        alt=""
        style={{ position: "absolute", objectFit: "cover" }}
      />
      {data.backgroundImage?.startsWith("data:") && (
        <div
          style={{
            position: "absolute",
            width: 1080,
            height: 1080,
            backgroundImage:
              "radial-gradient(ellipse at 50% 54%, rgba(255,255,255,.94), rgba(255,255,255,.35))",
          }}
        />
      )}
      <div
        style={{
          display: "flex",
          position: "relative",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: 1080,
          height: 1080,
          gap: 32,
        }}
      >
        <div
          data-poster="identity-group"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            data-poster="header"
            style={{
              display: "flex",
              justifyContent: "center",
              width: logo?.width ?? header.width,
            }}
          >
            {logo ? (
              <img
                src={logo.src}
                width={logo.width}
                height={logo.height}
                alt=""
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  fontSize: header.fallbackFontSize,
                  fontWeight: 700,
                  lineHeight: 1,
                  textAlign: "center",
                }}
              >
                {data.company}
              </div>
            )}
          </div>
          <div
            data-poster="title"
            style={{
              display: "flex",
              width: title.width,
              fontSize: Math.max(
                title.minFontSize,
                title.fontSize - adjustment,
              ),
              fontWeight: title.weight,
              lineHeight: title.lineAdvance / title.fontSize,
              textAlign: "center",
              justifyContent: "center",
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
              width: description.width,
              fontSize: Math.max(
                description.minFontSize,
                description.fontSize - adjustment / 3,
              ),
              lineHeight: description.lineAdvance / description.fontSize,
              textAlign: "center",
              justifyContent: "center",
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
              alignItems: "stretch",
              justifyContent: "center",
            }}
          >
            {facts.map(([label, value], index) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: details.columnWidth + 24,
                  alignItems: "center",
                  borderLeft: index
                    ? `1px solid ${theme.colors.text}`
                    : undefined,
                  padding: "4px 12px 11px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: details.labelInitialSize,
                    letterSpacing: details.labelTracking,
                    lineHeight: 1,
                  }}
                >
                  {label}
                </div>
                <div
                  data-poster="fact"
                  style={{
                    display: "flex",
                    marginTop: details.labelToValueGap,
                    fontSize: Math.max(
                      details.valueMinSize,
                      details.valueInitialSize - adjustment / 3,
                    ),
                    lineHeight: 1,
                    textAlign: "center",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}
        <div
          data-poster="action"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              position: "relative",
              width: qr.size,
              height: qr.size,
            }}
          >
            <img src={qr.src} width={qr.size} height={qr.size} alt="" />
            {logo && (
              <div
                style={{
                  display: "flex",
                  position: "absolute",
                  left: qr.size * 0.4,
                  top: qr.size * 0.4,
                  width: qr.size * 0.2,
                  height: qr.size * 0.2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={logo.src}
                  width={qr.size * 0.2}
                  height={qr.size * 0.2}
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
              alignItems: "center",
              gap: p.spacing.footerLineInkGap,
            }}
          >
            {action.footer.lines.map((line, index) => (
              <div
                key={line.text}
                style={{
                  display: "flex",
                  color: line.color,
                  fontSize: Math.max(
                    description.minFontSize,
                    description.fontSize - adjustment / 3,
                  ),
                  fontWeight: line.weight,
                  lineHeight: 1,
                }}
              >
                {index === 0 ? "Scan to apply via" : "BetterInternship"}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
