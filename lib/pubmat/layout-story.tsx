import type { PubmatData } from "./params";
import {
  ACCENT,
  Brand,
  Canvas,
  clamp,
  companySize,
  cornerShapes,
  Corners,
  DetailsList,
  detailRows,
  Pill,
  QrFrame,
  titleSize,
  type Qr,
} from "./parts";

const WIDTH = 1080;
const HEIGHT = 1920;

/**
 * The 9:16 story. Instagram, Facebook and TikTok lay their own controls over
 * roughly the top 250px and bottom 340px, so everything sits between those,
 * stacked in one column.
 */
export function StoryLayout({ data, qr }: { data: PubmatData; qr: Qr }) {
  const rows = detailRows(data);
  const headWidth = 860;
  const size = titleSize(data.title, headWidth, 1.3);

  return (
    <Canvas width={WIDTH} height={HEIGHT}>
      <Corners
        src={cornerShapes(WIDTH, HEIGHT)}
        width={WIDTH}
        height={HEIGHT}
      />

      <div
        style={{
          position: "absolute",
          left: 70,
          top: 230,
          width: 940,
          height: HEIGHT - 230 - 270,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", marginLeft: -20 }}>
          <Pill height={76} fontSize={32} />
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", width: headWidth }}
        >
          <div
            style={{
              ...clamp(4),
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
                ...clamp(2),
                marginTop: 26,
                fontSize: companySize(data.company, 1.2),
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: -0.02 * 60,
                color: ACCENT,
              }}
            >
              {`at ${data.company}`}
            </div>
          ) : null}
        </div>

        <DetailsList
          rows={rows}
          label={24}
          value={42}
          valueLong={36}
          longAt={30}
          gap={24}
          dot={26}
        />

        <div style={{ display: "flex", alignItems: "center" }}>
          <QrFrame qr={qr} size={360} border={12} radius={20} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 44,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 60,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: -0.02 * 60,
                color: ACCENT,
                marginBottom: 26,
              }}
            >
              Scan to apply
            </div>
            <Brand logoSize={52} fontSize={34} />
          </div>
        </div>
      </div>
    </Canvas>
  );
}
