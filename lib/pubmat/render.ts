import {
  DEFAULT_PUBMAT_DESIGN,
  PUBMAT_DESIGNS,
  type PubmatDesign,
} from "./designs";
import { posterLocation, type PubmatData } from "./params";
import { posterBackground, posterLogo } from "./assets";
import { posterQr } from "./qr-image";
import { posterImage } from "./jsx-renderer";
import { renderOffThread, exportPosterPng } from "./worker-client";
export { exportPosterPng } from "./worker-client";

/** Both the playground and production use the same theme dispatch and PNG bytes. */
export async function renderPubmatArtifact(
  data: PubmatData,
  design: PubmatDesign = DEFAULT_PUBMAT_DESIGN,
  debug = false,
  signal?: AbortSignal,
  priority = 0,
) {
  signal?.throwIfAborted();
  data = { ...data, location: posterLocation(data.location) };
  const theme = PUBMAT_DESIGNS[design];
  const [background, logo, qrLogo] = await Promise.all([
    posterBackground(data.backgroundImage, theme.backgrounds),
    posterLogo(data.companyLogo, theme.settings.logo),
    posterImage("/BetterInternshipLogo.png"),
  ]);
  const assets = {
    background,
    logo,
    qr: { ...posterQr(data.link, theme.settings.qrSize), logoSrc: qrLogo },
  };
  signal?.throwIfAborted();
  return renderOffThread({ data, assets, design, debug }, signal, priority);
}

export async function renderPubmat(
  data: PubmatData,
  design: PubmatDesign = DEFAULT_PUBMAT_DESIGN,
): Promise<Blob> {
  return exportPosterPng((await renderPubmatArtifact(data, design)).svg);
}
