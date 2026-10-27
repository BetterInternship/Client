import type { PosterTheme } from "./theme-types";
import { studioBackgrounds, studioRenderSettings } from "./studio/config";
import { centeredBackgrounds, centeredRenderSettings } from "./centered/config";
import {
  splitDeskBackgrounds,
  splitDeskRenderSettings,
} from "./split-desk/config";

/** Add new themes here. UI and renderer dispatch are derived from this registry. */
export const PUBMAT_DESIGNS = {
  "approved-photo-square": {
    label: "Studio photo",
    templatePath: "lib/pubmat/studio/template.tsx",
    backgrounds: studioBackgrounds,
    repositionBackground: true,
    settings: studioRenderSettings,
    loadTemplate: async () => (await import("./studio/template")).StudioPoster,
  },
  "centered-group-flow": {
    label: "Centered editorial",
    templatePath: "lib/pubmat/centered/template.tsx",
    backgrounds: centeredBackgrounds,
    repositionBackground: false,
    settings: centeredRenderSettings,
    loadTemplate: async () =>
      (await import("./centered/template")).CenteredPoster,
  },
  "split-desk": {
    label: "Split desk",
    templatePath: "lib/pubmat/split-desk/template.tsx",
    backgrounds: splitDeskBackgrounds,
    repositionBackground: false,
    settings: splitDeskRenderSettings,
    loadTemplate: async () =>
      (await import("./split-desk/template")).SplitDeskPoster,
  },
} satisfies Record<string, PosterTheme>;

export type PubmatDesign = keyof typeof PUBMAT_DESIGNS;
export const PUBMAT_DESIGN_IDS = Object.keys(PUBMAT_DESIGNS) as PubmatDesign[];
export const DEFAULT_PUBMAT_DESIGN: PubmatDesign = "approved-photo-square";
