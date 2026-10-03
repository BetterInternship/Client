import type { CSSProperties } from "react";
import type { Job } from "@/lib/db/db.types";
import { pickForeground } from "@/lib/utils/contrast";
import { DEFAULT_TOP_PAGE_ACCENT } from "@/lib/utils/top-page-heading";
import { createTopPalette } from "@/lib/utils/top-page-palette";

/** Preserve curation order and annotate only verified university matches. */
export function filterTopMoaJobs(jobs: Job[], matchedIds: Set<string>): Job[] {
  return jobs
    .filter((job) => !!job.id && matchedIds.has(job.id))
    .map((job) => ({ ...job, has_moa: true }));
}

/** Keep the category hue, darkening pale accents for readable text on white. */
export function topAccentTextColor(hex: string): string {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return "#2563eb";
  const rgb = [1, 3, 5].map((start) =>
    parseInt(hex.slice(start, start + 2), 16),
  );
  const luminance = (values: number[]) =>
    values.reduce((sum, value, i) => {
      const channel = value / 255;
      const linear =
        channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4;
      return sum + linear * [0.2126, 0.7152, 0.0722][i];
    }, 0);
  while (1.05 / (luminance(rgb) + 0.05) < 4.5) {
    for (let i = 0; i < rgb.length; i++) rgb[i] = Math.floor(rgb[i] * 0.95);
  }
  return `#${rgb.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

/** Shift the blue artwork's hue without flattening its whites or shading. */
export function topArtworkFilter(hex: string): string {
  if (
    !/^#[0-9a-f]{6}$/i.test(hex) ||
    hex.toLowerCase() === DEFAULT_TOP_PAGE_ACCENT
  ) {
    return "none";
  }
  const [r, g, b] = [1, 3, 5].map(
    (start) => parseInt(hex.slice(start, start + 2), 16) / 255,
  );
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return "grayscale(1)";
  const hue =
    (60 *
      (max === r
        ? (g - b) / delta
        : max === g
          ? (b - r) / delta + 2
          : (r - g) / delta + 4) +
      360) %
    360;
  const saturation = delta / (1 - Math.abs(max + min - 1));
  // Assets are blue (~215°). Keep the original lightness so very dark or
  // pale custom colours don't obscure the illustrations' readable details.
  return `hue-rotate(${hue - 215}deg) saturate(${saturation})`;
}

/**
 * Shared Top page tokens, scoped to the university/category page root.
 * The page uses a controlled perceptual palette; artwork retains its existing
 * tint based on the original university colour, independent of UI shades.
 */
export function topAccentStyle(accentHex?: string | null): CSSProperties {
  const accent =
    accentHex && /^#[0-9a-f]{6}$/i.test(accentHex)
      ? accentHex
      : DEFAULT_TOP_PAGE_ACCENT;
  const palette = createTopPalette(accent);
  return {
    "--primary": palette.primary,
    "--primary-foreground": pickForeground(palette.primary),
    "--color-primary": palette.primary,
    "--color-primary-foreground": pickForeground(palette.primary),
    "--color-muted-foreground": palette.muted,
    "--top-accent-text": palette.text,
    "--top-surface": palette.surface,
    "--top-ribbon": palette.ribbon,
    "--top-ribbon-soft": palette.ribbonSoft,
    "--top-border": palette.border,
    "--top-cta-start": palette.ctaStart,
    "--top-cta-middle": palette.ctaMiddle,
    "--top-cta-end": palette.ctaEnd,
    "--top-artwork-filter": topArtworkFilter(accent),
    "--top-panel-width": "min(46vw, 42rem)",
  } as CSSProperties;
}
