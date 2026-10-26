/**
 * The looks a pubmat can have, in the order the carousel shows them. A design is
 * more than a colour change — its own layout, and often its own typeface — so
 * each is a file in lib/pubmat (layout-*.tsx) that template.tsx picks by id.
 *
 * To add one:
 *  1. add its id and label here,
 *  2. write its layout and add a case for it in template.tsx,
 *  3. if it brings a typeface, add the font files to public/fonts/pubmat and the
 *     design's entry in fonts.ts (and its width tables in fit.ts, if it sets the
 *     title with fitTitle()).
 *
 * Only `classic` comes in more than one shape (formats.ts); every other design
 * is square for now.
 *
 * Shared by the renderer and the carousel, so it holds no server-only code.
 */
import { PUBMAT_THEMES } from "./themes";

export const PUBMAT_DESIGNS = {
  ...PUBMAT_THEMES,
  classic: { label: "Classic" },
  aura: { label: "Aura" },
} as const;

export type PubmatDesign = keyof typeof PUBMAT_DESIGNS;

export const PUBMAT_DESIGN_IDS = Object.keys(PUBMAT_DESIGNS) as PubmatDesign[];

export const DEFAULT_PUBMAT_DESIGN: PubmatDesign = "02-blue-paper-plane";
