import { LandscapeLayout } from "./layout-landscape";
import { PostLayout } from "./layout-post";
import { StoryLayout } from "./layout-story";
import type { PubmatFormat } from "./formats";
import type { PubmatData } from "./params";
import { qrCode } from "./qr";

/**
 * The listing pubmat — the same look as the university "Top" pubmats (corner
 * shapes, burst-flanked pill, QR in an accent frame), for one listing instead
 * of three, in whichever layout `format` names. Inter throughout.
 */
export function PubmatTemplate({
  data,
  format,
}: {
  data: PubmatData;
  format: PubmatFormat;
}) {
  const qr = qrCode(data.link);

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
