import type { PubmatData } from "./params";
import type { ComponentType } from "react";

export type PosterArtifact = { svg: string };
export type PosterBackground = { id: string; label: string; src: string };
export type PosterAssets = {
  background: string;
  logo?: { src: string; width: number; height: number };
  qr: { src: string; size: number };
};
export type PosterTemplateProps = {
  data: PubmatData;
  assets: PosterAssets;
  adjustment?: number;
};
export type PosterRenderSettings = {
  logo: { width: number; height: number; trim?: boolean; upscale?: boolean };
  qrSize: number;
  limits: Record<
    string,
    {
      minTop?: number;
      maxBottom?: number;
      maxHeight?: number;
      maxWidth?: number;
    }
  >;
  separation?: { before: readonly string[]; after: string; gap: number };
};
export type PosterTheme = {
  label: string;
  templatePath: string;
  backgrounds: readonly [PosterBackground, ...PosterBackground[]];
  repositionBackground: boolean;
  settings: PosterRenderSettings;
  loadTemplate: () => Promise<ComponentType<PosterTemplateProps>>;
};
