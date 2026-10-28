import type { PosterTemplateProps } from "../theme-types";
import { posterTypography as typography } from "../typography";
import { PubmatFitError } from "../core";
import { Coins, Laptop, MapPin } from "lucide-react";
import { splitDeskConfig as theme, splitDeskTypography } from "./config";
import { PosterQr } from "../poster-qr";

/** One composition for every background. Only background/wash layers are absolute. */
export function SplitDeskPoster({
  data,
  assets,
  adjustment = 0,
}: PosterTemplateProps) {
  const p = theme.layout;
  const copy = theme.text;
  const editorial = data.fontStyle === "editorial";
  const fontMultiplier =
    data.fontStyle === "editorial"
      ? 1.8
      : data.fontStyle === "professional"
        ? 1.2
        : 1;
  const a = Math.max(
    0,
    Math.min(
      70,
      (Number.isFinite(adjustment) ? adjustment : 0) * fontMultiplier,
    ),
  );
  const size = (initial: number, minimum: number, divisor = 1) =>
    Math.max(minimum, initial - a / divisor);
  // Give the editorial style a more restrained size range and enough room for
  // smaller starting/minimum size so the left-aligned layout still supports
  // the editor's 100-character title limit without crossing into the sidebar.
  const titleSize = size(
    editorial ? 96 : copy.title.initial,
    editorial ? 48 : copy.title.min,
  );
  const descriptionSize = typography.description.size;
  const labelSize = splitDeskTypography.detailLabelSize;
  const valueSize = typography.detail.size;
  const companySize = typography.company.size;
  const title = data.title?.trim();
  if (!title) throw new PubmatFitError("title", "A role title is required.");
  if (!data.company?.trim())
    throw new PubmatFitError("company", "A company name is required.");
  if (
    !assets.qr.src ||
    !Number.isFinite(assets.qr.size) ||
    assets.qr.size <= 0 ||
    assets.qr.size > theme.qr.maxSuppliedSize
  ) {
    throw new PubmatFitError(
      "link",
      "The prepared QR is invalid or too large for this theme.",
    );
  }
  if (
    assets.logo &&
    (!Number.isFinite(assets.logo.width) ||
      !Number.isFinite(assets.logo.height) ||
      assets.logo.width <= 0 ||
      assets.logo.height <= 0 ||
      assets.logo.width > 480 ||
      assets.logo.height > 160)
  ) {
    throw new PubmatFitError(
      "companyLogo",
      "Prepare the logo within the shared 480 × 160 maximum area.",
    );
  }
  // Legacy setup can contain commitment; display only its work-mode segment.
  const mode = (data.workMode?.trim() || data.setup?.trim() || "")
    .split(/[·•|]|\s+-\s+/)[0]
    .trim();
  const workMode =
    /^(full[- ]?time|part[- ]?time|project[- ]?based|internship|contract|freelance)$/i.test(
      mode,
    )
      ? ""
      : mode;
  const facts = [
    {
      id: "location",
      label: "Location",
      value: data.location?.trim(),
      Icon: MapPin,
    },
    { id: "setup", label: "Work Mode", value: workMode, Icon: Laptop },
    {
      id: "pay",
      label: "Allowance",
      value: data.payCompact?.trim() || data.pay?.trim(),
      Icon: Coins,
    },
  ].filter((fact) => Boolean(fact.value));
  const words = title.split(/\s+/);
  return (
    <div
      data-poster="canvas"
      style={{
        display: "flex",
        position: "relative",
        width: 1080,
        height: 1080,
        fontFamily:
          data.fontStyle === "professional"
            ? "Space Grotesk"
            : data.fontStyle === "editorial"
              ? "Source Serif 4"
              : theme.fontFamily,
        color: theme.colors.text,
        wordBreak: "normal",
        overflowWrap: "normal",
      }}
    >
      <img
        src={assets.background}
        width={1080}
        height={1080}
        alt=""
        style={{
          position: "absolute",
          width: 1080,
          height: 1080,
          objectFit: "cover",
          objectPosition: "50% 50%",
        }}
      />
      {data.backgroundImage?.startsWith("data:") && (
        <div
          data-poster="background-wash"
          style={{
            display: "flex",
            position: "absolute",
            width: 1080,
            height: 1080,
            backgroundImage: theme.background.uploadWash.css,
          }}
        />
      )}
      <div
        style={{
          display: "flex",
          boxSizing: "border-box",
          position: "relative",
          width: 1080,
          height: 1080,
          flexDirection: "column",
          justifyContent: "center",
          paddingTop: p.paddingTop,
          paddingBottom: p.paddingBottom,
          paddingLeft: p.paddingX,
          paddingRight: p.paddingX,
        }}
      >
        <div
          data-poster="composition"
          style={{
            display: "flex",
            flexDirection: "row",
            width: 936,
            alignItems: "center",
            gap: p.columnGap,
            flexShrink: 0,
          }}
        >
          <div
            data-poster="left-column"
            style={{
              display: "flex",
              width: p.leftWidth,
              flexShrink: 0,
              flexDirection: "column",
              alignItems: "flex-start",
              gap: p.descriptionGap,
            }}
          >
            <div
              data-poster="identity-group"
              style={{
                display: "flex",
                width: p.leftWidth,
                flexDirection: "column",
                alignItems: "flex-start",
                gap: p.identityGap,
              }}
            >
              {assets.logo ? (
                <img
                  data-poster="logo"
                  src={assets.logo.src}
                  width={assets.logo.width}
                  height={assets.logo.height}
                  alt=""
                  style={{ flexShrink: 0 }}
                />
              ) : (
                <div
                  data-poster="company"
                  style={{
                    display: "flex",
                    width: p.leftWidth,
                    fontSize: companySize,
                    fontWeight: copy.company.weight,
                    lineHeight: copy.company.lineHeight,
                  }}
                >
                  {data.company}
                </div>
              )}
              <div
                data-poster="title"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignContent: "flex-start",
                  columnGap: titleSize * copy.titleWordGapEm,
                  rowGap: 0,
                  width: p.leftWidth,
                  fontSize: titleSize,
                  fontWeight: copy.title.weight,
                  lineHeight: copy.title.lineHeight,
                  textAlign: "left",
                }}
              >
                {words.map((word, index) => (
                  <span
                    key={index}
                    data-poster="title-word"
                    style={{
                      display: "flex",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                      color:
                        index === 1 ? theme.colors.accent : theme.colors.text,
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
            {data.description?.trim() && (
              <div
                data-poster="description"
                style={{
                  display: "flex",
                  width: p.leftWidth,
                  fontSize: descriptionSize,
                  fontWeight: typography.description.weight,
                  lineHeight: typography.description.lineHeight,
                  color: theme.colors.secondary,
                }}
              >
                {data.description.trim()}
              </div>
            )}
          </div>
          <div
            data-poster="right-column"
            style={{
              display: "flex",
              boxSizing: "border-box",
              width: p.rightWidth,
              flexShrink: 0,
              flexDirection: "column",
              alignItems: "stretch",
              gap: p.detailsToActionGap,
              paddingLeft: p.rightPaddingLeft,
              borderLeft: `${p.dividerWidth}px solid ${theme.colors.divider}`,
            }}
          >
            {facts.length > 0 && (
              <div
                data-poster="details"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: p.detailGap,
                }}
              >
                {facts.map(({ id, label, value, Icon }) => (
                  <div
                    key={id}
                    data-poster={`detail-${id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: p.detailIconGap,
                    }}
                  >
                    <div
                      data-poster="icon-tile"
                      style={{
                        display: "flex",
                        flexShrink: 0,
                        width: p.iconTileSize,
                        height: p.iconTileSize,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: p.iconTileRadius,
                        backgroundColor: theme.colors.iconTile,
                      }}
                    >
                      <Icon
                        size={p.iconSize}
                        color={theme.colors.text}
                        strokeWidth={2.4}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: p.detailLabelGap,
                        flexGrow: 1,
                        width: 257,
                      }}
                    >
                      <div
                        data-poster="detail-label"
                        style={{
                          display: "flex",
                          fontSize: labelSize,
                          fontWeight: copy.detailLabel.weight,
                          lineHeight: copy.detailLabel.lineHeight,
                          color: theme.colors.secondary,
                        }}
                      >
                        {label}
                      </div>
                      <div
                        data-poster="detail-value"
                        style={{
                          display: "flex",
                          width: 257,
                          fontSize: valueSize,
                          fontWeight: typography.detail.weight,
                          lineHeight: copy.detailValue.lineHeight,
                        }}
                      >
                        {value}
                      </div>
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
                gap: p.qrToFooterGap,
              }}
            >
              <PosterQr qr={assets.qr} />
              <div
                data-poster="footer"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: p.footerLineGap,
                }}
              >
                <div
                  data-poster="footer-line"
                  style={{
                    display: "flex",
                    fontSize: typography.footer.size,
                    fontWeight: copy.footer.weight,
                    lineHeight: copy.footer.lineHeight,
                    whiteSpace: "nowrap",
                  }}
                >
                  Scan to apply via
                </div>
                <div
                  data-poster="brand-line"
                  style={{
                    display: "flex",
                    fontSize: typography.footer.size,
                    fontWeight: copy.brand.weight,
                    lineHeight: copy.brand.lineHeight,
                    whiteSpace: "nowrap",
                  }}
                >
                  BetterInternship
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SplitDeskPoster;
