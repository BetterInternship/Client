/**
 * The canvases a pubmat is drawn on. Each is a different layout rather than a
 * crop of one design — a story's safe zones and a LinkedIn card's 1.91:1 want
 * different compositions, so each has its own layout (lib/pubmat/layout-*.tsx).
 *
 * Shared by the renderer (which sizes the image) and the creator (which shapes
 * its preview), so it holds no server-only code.
 */
export const PUBMAT_FORMATS = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1200, height: 630 },
} as const;

export type PubmatFormat = keyof typeof PUBMAT_FORMATS;
