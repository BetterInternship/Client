import type { CSSProperties } from "react";
import type { Job } from "@/lib/db/db.types";
import { pickForeground } from "@/lib/utils/contrast";
import { DEFAULT_TOP_PAGE_ACCENT } from "@/lib/utils/top-page-heading";

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

/**
 * The CSS variables every Top page surface (category page, university
 * landing page) sets on its root, from the university's colour. This is the
 * one place the colour is "exposed" to components
 * (Docs/plans/TOP_PAGES_UNIVERSITY_PLAN.md D6): anything under that root can
 * read `--primary` / `--color-primary` (and their `-foreground` pair) or
 * `--top-accent-text` (the same hue, darkened enough to read on white).
 */
export function topAccentStyle(accentHex?: string | null): CSSProperties {
  const accent = accentHex ?? DEFAULT_TOP_PAGE_ACCENT;
  return {
    "--primary": accent,
    "--primary-foreground": pickForeground(accent),
    "--color-primary": accent,
    "--color-primary-foreground": pickForeground(accent),
    "--color-muted-foreground": "#626fa5",
    "--top-accent-text": topAccentTextColor(accent),
    "--top-panel-width": "min(46vw, 42rem)",
  } as CSSProperties;
}
