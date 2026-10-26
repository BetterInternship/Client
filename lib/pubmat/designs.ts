/** The carousel currently offers the active v2 square theme only. */
import { PUBMAT_V2_DESIGN } from "./v2";

export const PUBMAT_DESIGNS = {
  [PUBMAT_V2_DESIGN]: { label: "Studio photo" },
} as const;

export type PubmatDesign = keyof typeof PUBMAT_DESIGNS;

export const PUBMAT_DESIGN_IDS = [PUBMAT_V2_DESIGN] as PubmatDesign[];

export const DEFAULT_PUBMAT_DESIGN: PubmatDesign = PUBMAT_V2_DESIGN;
