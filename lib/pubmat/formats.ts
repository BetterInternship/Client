/**
 * The layouts a pubmat can be made in. Each is a different canvas rather than
 * a crop of one design — a story's safe zones and a LinkedIn card's 1.91:1 want
 * different compositions, so each has its own layout (lib/pubmat/layout-*.tsx).
 *
 * Shared by the route (which sizes the image) and the picker (which labels it
 * and shapes its preview), so it holds no server-only code.
 */
export const PUBMAT_FORMATS = {
  square: {
    label: "Square",
    sites: "Instagram, Facebook, LinkedIn",
    width: 1080,
    height: 1080,
  },
  portrait: {
    label: "Portrait",
    sites: "Instagram feed",
    width: 1080,
    height: 1350,
  },
  story: {
    label: "Story",
    sites: "Instagram, Facebook, TikTok",
    width: 1080,
    height: 1920,
  },
  landscape: {
    label: "Landscape",
    sites: "LinkedIn, X, Facebook links",
    width: 1200,
    height: 630,
  },
} as const;

export type PubmatFormat = keyof typeof PUBMAT_FORMATS;

export const PUBMAT_FORMAT_IDS = Object.keys(PUBMAT_FORMATS) as PubmatFormat[];

export const DEFAULT_PUBMAT_FORMAT: PubmatFormat = "square";

/** An unknown or missing value falls back to the default rather than failing. */
export function parsePubmatFormat(value: string | null | undefined) {
  return (PUBMAT_FORMAT_IDS as string[]).includes(value ?? "")
    ? (value as PubmatFormat)
    : DEFAULT_PUBMAT_FORMAT;
}
