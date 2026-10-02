import type { Job } from "@/lib/db/db.types";

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
