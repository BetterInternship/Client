import {
  DEFAULT_PUBMAT_DESIGN,
  PUBMAT_DESIGNS,
  type PubmatDesign,
} from "./designs";
import type { PubmatData } from "./params";
import { createElement } from "react";
import { posterBackground, posterLogo } from "./assets";
import { posterQr } from "./qr-image";
import { renderFittedPoster, type PosterNode } from "./jsx-renderer";
import type { PosterRenderSettings } from "./theme-types";

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

/** Both the playground and production use the same theme dispatch and PNG bytes. */
export async function renderPubmatArtifact(
  data: PubmatData,
  design: PubmatDesign = DEFAULT_PUBMAT_DESIGN,
  debug = false,
) {
  const theme = PUBMAT_DESIGNS[design];
  const [Template, background, logo] = await Promise.all([
    theme.loadTemplate(),
    posterBackground(data.backgroundImage, theme.backgrounds),
    posterLogo(data.companyLogo, theme.settings.logo),
  ]);
  const assets = {
    background,
    logo,
    qr: posterQr(data.link, theme.settings.qrSize),
  };
  return renderFittedPoster(
    (adjustment) => createElement(Template, { data, assets, adjustment }),
    (nodes) => layoutFits(nodes, theme.settings),
    debug,
  );
}

export async function renderPubmat(
  data: PubmatData,
  design: PubmatDesign = DEFAULT_PUBMAT_DESIGN,
): Promise<Blob> {
  return (await renderPubmatArtifact(data, design)).blob;
}
