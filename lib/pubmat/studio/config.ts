import type { PosterRenderSettings } from "../theme-types";

export const studioRenderSettings: PosterRenderSettings = {
  logo: { width: 480, height: 160, trim: true, upscale: true },
  qrSize: 260,
  limits: {
    composition: { minTop: 45 },
    title: { maxHeight: 360 },
    description: { maxHeight: 140 },
    details: { maxWidth: 935 },
  },
};

export const studioBackgrounds = [
  {
    id: "01-warm-desk",
    label: "Warm desk",
    src: "/pubmat/v2/01-warm-desk.png",
  },
  {
    id: "02-glass-office",
    label: "Glass office",
    src: "/pubmat/v2/02-glass-office.png",
  },
  {
    id: "03-city-office",
    label: "City office",
    src: "/pubmat/v2/03-city-office.png",
  },
] as const;
