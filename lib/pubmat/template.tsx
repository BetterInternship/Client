import { AuraLayout } from "./layout-aura";
import { LandscapeLayout } from "./layout-landscape";
import { PostLayout } from "./layout-post";
import { StoryLayout } from "./layout-story";
import type { PubmatDesign } from "./designs";
import type { PubmatFormat } from "./formats";
import type { PubmatData } from "./params";
import { qrCode } from "./qr";

/**
 * The listing pubmat, in whichever `design` is asked for (designs.ts). The
 * classic one — the same look as the university "Top" pubmats (corner shapes,
 * burst-flanked pill, QR in an accent frame), Inter throughout — comes in each
 * layout `format` names. Every other design is square only, so `format` is
 * ignored for them.
 */
export function PubmatTemplate({
  data,
  format,
  design,
}: {
  data: PubmatData;
  format: PubmatFormat;
  design: PubmatDesign;
}) {
  const qr = qrCode(data.link);

  switch (design) {
    case "aura":
      return <AuraLayout data={data} qr={qr} />;
    case "classic":
      switch (format) {
        case "portrait":
          return <PostLayout data={data} qr={qr} height={1350} />;
        case "story":
          return <StoryLayout data={data} qr={qr} />;
        case "landscape":
          return <LandscapeLayout data={data} qr={qr} />;
        case "square":
          return <PostLayout data={data} qr={qr} height={1080} />;
      }
  }
}
