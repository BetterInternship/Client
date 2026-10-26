export const PUBMAT_V2_DESIGN = "approved-photo-square" as const;
export type PubmatV2Background =
  "01-warm-desk" | "02-glass-office" | "03-city-office" | "upload";
export const PUBMAT_V2_BACKGROUNDS = [
  {
    id: "01-warm-desk" as const,
    label: "Warm desk",
    src: "/pubmat/v2/01-warm-desk.png",
  },
  {
    id: "02-glass-office" as const,
    label: "Glass office",
    src: "/pubmat/v2/02-glass-office.png",
  },
  {
    id: "03-city-office" as const,
    label: "City office",
    src: "/pubmat/v2/03-city-office.png",
  },
  { id: "upload" as const, label: "Upload image" },
];
