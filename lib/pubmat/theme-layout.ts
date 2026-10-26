import type { Font } from "@shuding/opentype.js";
import { detailIcon } from "./theme-icons";
import { PUBMAT_CTA, PUBMAT_QR, themeColors, type PubmatTheme } from "./themes";
import type { PubmatData } from "./params";

export type PosterField =
  | "company"
  | "title"
  | "description"
  | "location"
  | "setup"
  | "pay"
  | "link"
  | "companyLogo"
  | "contrast";
export class PubmatFitError extends Error {
  constructor(
    public readonly field: PosterField,
    message: string,
  ) {
    super(message);
    this.name = "PubmatFitError";
  }
}
export type PosterCopy = Partial<
  Pick<
    PubmatData,
    "company" | "title" | "description" | "location" | "setup" | "pay"
  >
>;
export type PosterFonts = Record<400 | 600 | 700, Font>;
export type InkBox = {
  field: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
export type ThemeInput = PubmatData & {
  /** Optional deliberate line breaks must preserve all text, including punctuation. */
  titleLines?: string[];
  descriptionLines?: string[];
  /** Only the test fixture may request a fictional tile. Real companies never get an invented logo. */
  sampleInitial?: string;
};

export function inkBounds(font: Font, text: string, size: number) {
  let x1 = Infinity,
    y1 = Infinity,
    x2 = -Infinity,
    y2 = -Infinity;
  font.forEachGlyph(text, 0, 0, size, { kerning: true }, (glyph, x) => {
    const metrics = glyph.getMetrics(),
      scale = size / font.unitsPerEm;
    x1 = Math.min(x1, x + metrics.xMin * scale);
    x2 = Math.max(x2, x + metrics.xMax * scale);
    y1 = Math.min(y1, -metrics.yMax * scale);
    y2 = Math.max(y2, -metrics.yMin * scale);
  });
  return { x1, y1, width: x2 - x1, height: y2 - y1 };
}

function plain(value: string | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

export function validateRoleUrl(value: string) {
  if (!value || value.length > 1000 || /\s/.test(value))
    throw new PubmatFitError("link", "A valid, short listing URL is required.");
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new PubmatFitError(
      "link",
      "The listing link must be an absolute HTTP or HTTPS URL.",
    );
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new PubmatFitError(
      "link",
      "Use a public HTTP or HTTPS listing link.",
    );
  return value; // Preserve the exact canonical URL instead of silently rewriting it.
}

/** Measured fit, with field-specific errors rather than clipping or ellipses. */
function fit(
  field: PosterField,
  text: string,
  font: Font,
  options: {
    width: number;
    height: number;
    max: number;
    min: number;
    maxLines: number;
    advance?: number;
    manual?: string[];
  },
) {
  const manual = options.manual;
  if (
    manual &&
    (!manual.length ||
      manual.length > options.maxLines ||
      manual.some((line) => !plain(line)) ||
      manual.map(plain).join(" ") !== text)
  ) {
    throw new PubmatFitError(
      field,
      `The ${field} line breaks must preserve its complete text.`,
    );
  }
  for (let size = options.max; size >= options.min; size--) {
    let lines = manual?.map(plain);
    if (!lines) {
      lines = [];
      let line = "";
      for (const word of text.split(" ")) {
        const next = line ? `${line} ${word}` : word;
        if (line && inkBounds(font, next, size).width > options.width) {
          lines.push(line);
          line = word;
        } else line = next;
      }
      if (line) lines.push(line);
    }
    const advance = options.advance ?? size * 1.2;
    const boxes = lines.map((line) => inkBounds(font, line, size));
    const height = Math.max(...boxes.map((box, i) => i * advance + box.height));
    if (
      lines.length <= options.maxLines &&
      boxes.every((b) => b.width <= options.width) &&
      height <= options.height
    )
      return { lines, size, advance, height };
  }
  const label = {
    company: "company name",
    title: "job title",
    description: "description",
    location: "location",
    setup: "work setup",
    pay: "compensation",
    link: "listing link",
    companyLogo: "company logo",
    contrast: "text",
  }[field];
  throw new PubmatFitError(
    field,
    `The ${label} is too long for this poster. Use shorter display copy; your listing will not change.`,
  );
}

/** Pure, shared by the browser renderer and native regression tests. */
export function buildThemeLayout(
  input: ThemeInput,
  fonts: PosterFonts,
  theme: PubmatTheme,
  mark: { src: string; width: number; height: number },
  companyLogo?: string,
  /**
   * Shrinks the fitted type. `1` is the design's own sizes; the renderer asks
   * for less when the copy lands on a busy part of the artwork, so a long title
   * gets smaller rather than turning into an error.
   */
  scale = 1,
) {
  const pngData = /^data:image\/png;base64,[A-Za-z0-9+/=]+$/;
  if (!pngData.test(mark.src) || (companyLogo && !pngData.test(companyLogo)))
    throw new PubmatFitError(
      "companyLogo",
      "Logo images must be decoded PNG data, not markup or external SVG.",
    );
  const data = {
    company: plain(input.company),
    title: plain(input.title),
    description: plain(input.description),
    location: plain(input.location),
    setup: plain(input.setup),
    pay: plain(input.pay),
  };
  if (!data.company)
    throw new PubmatFitError(
      "company",
      "Add a company name before making a pubmat.",
    );
  if (!data.title)
    throw new PubmatFitError(
      "title",
      "Add a job title before making a pubmat.",
    );
  for (const field of Object.keys(data) as (keyof typeof data)[]) {
    if (data[field].length > 2000)
      throw new PubmatFitError(
        field,
        `The ${field} needs shorter display copy.`,
      );
  }
  validateRoleUrl(input.link);
  const colors = themeColors(theme);
  const elements: string[] = [],
    supporting: string[] = [],
    title: string[] = [];
  const boxes: InkBox[] = [];
  const typography: {
    field: string;
    size: number;
    weight: number;
    text: string;
  }[] = [];
  function text(
    field: string,
    value: string,
    x: number,
    y: number,
    size: number,
    weight: 400 | 600 | 700,
    color: string,
    group = "supporting",
  ) {
    const font = fonts[weight];
    if (font.stringToGlyphs(value).some((g) => !g.index))
      throw new PubmatFitError(
        field.startsWith("title")
          ? "title"
          : (field.split(".")[0] as PosterField),
        `The ${field} contains a character this poster font cannot render.`,
      );
    const b = inkBounds(font, value, size);
    const element = `<path d="${font.getPath(value, x - b.x1, y - b.y1, size, { kerning: true }).toPathData(3)}" fill="${color}"/>`;
    elements.push(element);
    if (group === "title") title.push(element);
    else if (group === "supporting") supporting.push(element);
    boxes.push({ field, x, y, width: b.width, height: b.height });
    typography.push({ field, text: value, size, weight });
  }
  // Type sizes come from the design's own scale, so shrinking the copy is the
  // same layout with every fitted size multiplied down.
  const shrink = <
    T extends { height: number; min: number; max: number; advance?: number },
  >(
    options: T,
  ): T =>
    scale === 1
      ? options
      : ({
          ...options,
          height: Math.round(options.height * scale),
          min: Math.round(options.min * scale),
          max: Math.round(options.max * scale),
          advance:
            options.advance === undefined
              ? undefined
              : Math.round(options.advance * scale),
        } as T);
  if (companyLogo)
    elements.push(
      `<image href="${companyLogo}" x="77" y="67" width="60" height="60" preserveAspectRatio="xMidYMid meet"/>`,
    );
  else if (input.sampleInitial) {
    elements.push(
      '<rect x="77" y="67" width="60" height="60" rx="10" fill="#071537"/>',
    );
    text(
      "sampleInitial",
      input.sampleInitial,
      92,
      81,
      38,
      700,
      "#FFFFFF",
      "artwork",
    );
  }
  const hasCompanyLogo = Boolean(companyLogo || input.sampleInitial);
  const companyX = hasCompanyLogo ? 159 : 76;
  const company = fit(
    "company",
    data.company,
    fonts[600],
    shrink({
      width: hasCompanyLogo ? 740 : 928,
      height: 45,
      min: 24,
      max: 38,
      maxLines: 1,
    }),
  );
  text(
    "company",
    data.company,
    companyX,
    82,
    company.size,
    600,
    colors.supporting,
  );
  const heading = fit(
    "title",
    data.title,
    fonts[600],
    shrink({
      width: 850,
      height: 212,
      min: 98,
      max: 124,
      maxLines: 2,
      advance: 119,
      manual: input.titleLines,
    }),
  );
  const hiringHeight = inkBounds(fonts[700], "We’re hiring", 64).height;
  const groupHeight = hiringHeight + 14 + heading.height;
  const headerBottom = Math.max(
    hasCompanyLogo ? 127 : 0,
    82 + inkBounds(fonts[600], data.company, company.size).height,
  );
  const groupTop = headerBottom + (538 - headerBottom - groupHeight) / 2;
  text("hiring", "We’re hiring", 76, groupTop, 64, 700, colors.supporting);
  heading.lines.forEach((line, i) =>
    text(
      `title.${i}`,
      line,
      76,
      groupTop + hiringHeight + 14 + i * heading.advance,
      heading.size,
      600,
      colors.title,
      "title",
    ),
  );
  if (data.description) {
    const description = fit(
      "description",
      data.description,
      fonts[400],
      shrink({
        width: 928,
        height: 90,
        min: 34,
        max: 40,
        maxLines: 2,
        advance: 48,
        manual: input.descriptionLines,
      }),
    );
    // The description hangs off the title, not off a fixed grid line: with a
    // short title a fixed line left a hole the size of a paragraph between the
    // two. The gap scales with the title, and matches where a full two-line
    // title used to put it.
    const descriptionTop =
      groupTop +
      hiringHeight +
      14 +
      heading.height +
      Math.round(heading.size * 0.56);
    description.lines.forEach((line, i) =>
      text(
        `description.${i}`,
        line,
        76,
        descriptionTop + i * description.advance,
        description.size,
        400,
        colors.supporting,
      ),
    );
  }
  for (const [field, y, iconY] of [
    ["location", 673, 661],
    ["setup", 737, 726],
    ["pay", 799, 790],
  ] as const) {
    if (!data[field]) continue; // Optional rows leave their reserved slots empty.
    const fitted = fit(
      field,
      data[field],
      fonts[400],
      shrink({
        width: 470,
        height: 42,
        min: 30,
        max: 38,
        maxLines: 1,
      }),
    );
    const icon = `<g transform="translate(78 ${iconY})">${detailIcon(field, colors.supporting)}</g>`;
    elements.push(icon);
    supporting.push(icon);
    boxes.push({
      field: `${field}Icon`,
      x: 78,
      y: iconY,
      width: 42,
      height: 44,
    });
    text(field, data[field], 151, y, fitted.size, 400, colors.supporting);
  }
  text("cta", PUBMAT_CTA, 76, 929, 38, 600, colors.supporting);
  const baseline = 998,
    through = inkBounds(fonts[400], "through", 32),
    wordmark = inkBounds(fonts[600], "BetterInternship", 31);
  text(
    "through",
    "through",
    76,
    baseline + through.y1,
    32,
    400,
    colors.supporting,
  );
  const logoHeight = wordmark.height,
    logoWidth = (logoHeight * mark.width) / mark.height,
    logoX = 76 + through.width + 12,
    logoY = baseline + wordmark.y1;
  elements.push(
    `<image href="${mark.src}" x="${logoX}" y="${logoY}" width="${logoWidth}" height="${logoHeight}" preserveAspectRatio="xMidYMid meet"/>`,
  );
  text(
    "wordmark",
    "BetterInternship",
    logoX + logoWidth + 12,
    logoY,
    31,
    600,
    colors.supporting,
  );
  for (const box of boxes) {
    if (
      box.x < 0 ||
      box.y < 0 ||
      box.x + box.width > 1080 ||
      box.y + box.height > 1080
    )
      throw new PubmatFitError("title", "This copy exceeds the poster canvas.");
    if (
      box.x < PUBMAT_QR.x + PUBMAT_QR.size + 20 &&
      box.x + box.width > 650 &&
      box.y < 1024 &&
      box.y + box.height > 650
    )
      throw new PubmatFitError(
        "description",
        "This copy overlaps the application QR. Use shorter display copy.",
      );
  }
  return {
    elements,
    supporting,
    title,
    boxes: boxes.filter((b) => b.field !== "sampleInitial"),
    typography,
    colors,
    groupTop,
    groupBottom: groupTop + groupHeight,
    headingGap: 14,
    logo: { x: logoX, y: logoY, width: logoWidth, height: logoHeight },
  };
}
