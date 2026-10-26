/**
 * Carousel order: twelve background-image themes, then the legacy Classic and
 * Aura layouts. Themes use render-theme.ts; legacy layouts use template.tsx.
 * Only Classic supports multiple formats.
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
