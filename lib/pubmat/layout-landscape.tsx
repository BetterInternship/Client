import type { PubmatData } from "./params";
import {
  ACCENT,
  Brand,
  Canvas,
  clamp,
  companySize,
  Corners,
  detailRows,
  INK,
  landscapeCorner,
  MUTED,
  Pill,
  QrFrame,
  titleSize,
  type Qr,
} from "./parts";

const WIDTH = 1200;
const HEIGHT = 630;

/**
 * The 1.91:1 card LinkedIn, X and Facebook show beside a link. Two columns —
 * title and details on the left, the QR on the right — so the details run as a
 * wrapping grid instead of the tall list the other layouts use.
 */
export function LandscapeLayout({ data, qr }: { data: PubmatData; qr: Qr }) {
  const rows = detailRows(data);
  const leftWidth = 700;
  const scale = 0.66;
  const size = titleSize(data.title, leftWidth, scale);

  return (
    <Canvas width={WIDTH} height={HEIGHT}>
      <Corners
        src={landscapeCorner(WIDTH, HEIGHT)}
        width={WIDTH}
        height={HEIGHT}
      />

      <div
        style={{
          position: "absolute",
          left: 56,
          top: 40,
          width: leftWidth,
          height: HEIGHT - 80,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", marginLeft: -6 }}>
          <Pill height={50} fontSize={21} padX={30} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              ...clamp(3),
              fontSize: size,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: -0.035 * size,
            }}
          >
            {data.title}
          </div>
          {data.company ? (
            <div
              style={{
                ...clamp(1),
                marginTop: 12,
                fontSize: companySize(data.company, 0.62),
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: -0.02 * 31,
                color: ACCENT,
              }}
            >
              {`at ${data.company}`}
            </div>
          ) : null}
        </div>

        {/* Location, the longest value, gets a row to itself; the rest pair up. */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            columnGap: 20,
            rowGap: 8,
          }}
        >
          {rows.map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                flexDirection: "column",
                width: row.label === "Location" ? leftWidth : 336,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 14,
                  fontWeight: 400,
                  letterSpacing: 1.1,
                  textTransform: "uppercase",
                  color: MUTED,
                }}
              >
                {row.label}
              </div>
              <div
                style={{
                  ...clamp(1),
                  fontSize: 25,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  letterSpacing: -0.02 * 25,
                  color: INK,
                }}
              >
                {row.value}
              </div>
            </div>
          ))}
        </div>

        <Brand logoSize={34} fontSize={23} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 812,
          top: 150,
          width: 332,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <QrFrame qr={qr} size={332} border={8} radius={14} />
        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: -0.02 * 34,
            color: ACCENT,
          }}
        >
          Scan to apply
        </div>
      </div>
    </Canvas>
  );
}
