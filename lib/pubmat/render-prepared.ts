import { createElement } from "react";
import { PUBMAT_DESIGNS, type PubmatDesign } from "./designs";
import type { PubmatData } from "./params";
import type { PosterAssets, PosterRenderSettings } from "./theme-types";
import { renderFittedPoster, type PosterNode } from "./jsx-renderer";

export type PreparedPoster = {
  data: PubmatData;
  assets: PosterAssets;
  design: PubmatDesign;
  debug: boolean;
};

function layoutFits(nodes: PosterNode[], settings: PosterRenderSettings) {
  for (const node of nodes) {
    const limits = settings.limits[String(node.props["data-poster"])];
    if (!limits) continue;
    if (limits.minTop !== undefined && node.top < limits.minTop) return false;
    if (
      limits.maxBottom !== undefined &&
      node.top + node.height > limits.maxBottom
    )
      return false;
    if (limits.maxHeight !== undefined && node.height > limits.maxHeight)
      return false;
    if (limits.maxWidth !== undefined && node.width > limits.maxWidth)
      return false;
  }
  if (settings.separation) {
    const { before, after, gap } = settings.separation;
    const preceding = nodes.filter((node) =>
      before.includes(String(node.props["data-poster"])),
    );
    const following = nodes.find((node) => node.props["data-poster"] === after);
    if (
      following &&
      preceding.length &&
      Math.max(...preceding.map((node) => node.top + node.height)) + gap >
        following.top
    )
      return false;
  }
  return true;
}

/** DOM-free rendering entry: runs in a worker, or as an unsupported-browser fallback. */
export async function renderPreparedPoster(
  { data, assets, design, debug }: PreparedPoster,
  signal?: AbortSignal,
) {
  const theme = PUBMAT_DESIGNS[design];
  const Template = await theme.loadTemplate();
  // Explicit image dimensions preserve layout while fitting lightweight images.
  const pixel =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==";
  const measuredAssets = {
    ...assets,
    background: pixel,
    logo: assets.logo ? { ...assets.logo, src: pixel } : undefined,
    qr: { ...assets.qr, src: pixel },
  };
  return renderFittedPoster(
    (adjustment, measure) =>
      createElement(Template, {
        data,
        assets: measure ? measuredAssets : assets,
        adjustment,
      }),
    (nodes) => layoutFits(nodes, theme.settings),
    debug,
    signal,
    data.fontStyle,
  );
}
