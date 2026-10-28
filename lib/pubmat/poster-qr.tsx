import type { PosterAssets } from "./theme-types";

/** Shared QR artwork; themes own placement and the surrounding scan text. */
export function PosterQr({ qr }: { qr: PosterAssets["qr"] }) {
  const logoSize = qr.size * 0.2;
  const logoOffset = (qr.size - logoSize) / 2;

  return (
    <div
      data-poster="qr"
      style={{
        display: "flex",
        position: "relative",
        width: qr.size,
        height: qr.size,
        flexShrink: 0,
      }}
    >
      <img src={qr.src} width={qr.size} height={qr.size} alt="" />
      {qr.logoSrc && (
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: logoOffset,
            top: logoOffset,
            width: logoSize,
            height: logoSize,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={qr.logoSrc}
            width={logoSize}
            height={logoSize}
            alt=""
            style={{ objectFit: "contain" }}
          />
        </div>
      )}
    </div>
  );
}
