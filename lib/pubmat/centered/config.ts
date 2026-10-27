/** One centered layout for every background. Only active layout tokens live here. */
export const centeredConfig = {
  colors: { text: "#000F3D", brand: "#0864FF" },
  layout: {
    primary: { headerRegion: { width: 349, height: 78, fallbackFontSize: 35 } },
    text: {
      jobTitle: {
        width: 740,
        height: 156,
        fontSize: 90,
        minFontSize: 64,
        weight: 650,
        lineAdvance: 87,
      },
      description: {
        width: 620,
        height: 100,
        fontSize: 33,
        minFontSize: 25,
        lineAdvance: 34,
      },
    },
    details: {
      columnWidth: 220,
      labelInitialSize: 14,
      labelTracking: 4,
      labelToValueGap: 18,
      valueInitialSize: 32,
      valueMinSize: 23,
    },
    spacing: { detailsToActionMinimum: 24, footerLineInkGap: 3 },
    action: {
      footer: {
        lines: [
          { text: "Scan to apply via", weight: 400, color: "#000F3D" },
          { text: "BetterInternship", weight: 700, color: "#0864FF" },
        ],
      },
    },
  },
};

export const centeredBackgrounds = [
  {
    id: "01-tech-editorial",
    label: "Tech editorial",
    src: "/pubmat/centered/01-tech-editorial.png",
  },
  {
    id: "02-creative-cream",
    label: "Creative cream",
    src: "/pubmat/centered/02-creative-cream.png",
  },
  {
    id: "03-soft-blue",
    label: "Soft blue",
    src: "/pubmat/centered/03-soft-blue.png",
  },
] as const;

export const centeredRenderSettings: PosterRenderSettings = {
  logo: { ...centeredConfig.layout.primary.headerRegion, trim: true },
  qrSize: 260,
  limits: {
    header: { minTop: 45 },
    title: { maxHeight: centeredConfig.layout.text.jobTitle.height + 1 },
    description: {
      maxHeight: centeredConfig.layout.text.description.height + 1,
    },
    fact: { maxHeight: centeredConfig.layout.details.valueInitialSize * 1.5 },
    action: { maxBottom: 1035 },
  },
  separation: {
    before: ["title", "description", "details"],
    after: "action",
    gap: centeredConfig.layout.spacing.detailsToActionMinimum,
  },
};
import type { PosterRenderSettings } from "../theme-types";
