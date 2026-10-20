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
  DIVIDER,
  ladderSize,
  Pill,
  QrFrame,
  type Qr,
} from "./parts";
import { fitTitle, wrapLines } from "./fit";

/**
 * The 1080-wide feed layouts: the square (1080×1080) and the 4:5 portrait
 * (1080×1350). Same composition, with the portrait's extra height spent on a
 * roomier title block and the gap above the details.
 */
export function PostLayout({
  data,
  qr,
  height,
}: {
  data: PubmatData;
  qr: Qr;
  height: 1080 | 1350;
}) {
  const width = 1080;
  const extra = height - 1080;
  const scale = extra ? 1.1 : 1;
  const rows = detailRows(data);

  const pill = { top: 70 + Math.round(extra * 0.15), left: 50 };
  const head = {
    left: 66,
    top: 168 + Math.round(extra * 0.2),
    width: 840,
    height: 316 + Math.round(extra * 0.55),
  };
  const content = { top: 504 + extra, height: 368 };
  const list = { left: 83, width: 548 };
  const frame = { left: 651, size: 368 };
  const divider = { left: 65, top: 904 + extra, width: 908, height: 3 };
  const footer = { left: 73, top: 934 + extra, width: 934 };

  // The title and the company line share the head box, and the title is the
  // one that gives: it shrinks until it sets in two lines with the company
  // underneath, rather than taking a third line and pushing into either.
  const companyFont = companySize(data.company, scale);
  const companyGap = 22;
  const companyLines = data.company
    ? Math.min(
        2,
        wrapLines(
          `at ${data.company}`,
          companyFont,
          700,
          head.width * 0.98,
          -1,
        ),
      )
    : 0;
  const companyHeight = companyLines
    ? companyGap + companyLines * companyFont * 1.1
    : 0;
  const size = fitTitle(data.title, {
    width: head.width,
    maxLines: 2,
    maxSize: ladderSize(data.title, scale),
    minSize: Math.round(40 * scale),
    maxHeight: head.height - companyHeight,
  });
  // A title squeezed small shouldn't end up smaller than the line under it.
  // Only ever smaller than what was budgeted for above, so it can't add a line.
  const companyShown = Math.min(companyFont, Math.round(size * 0.9));

  return (
    <Canvas width={width} height={height}>
      <Corners
        src={cornerShapes(width, height)}
        width={width}
        height={height}
      />

      <div
        style={{
          position: "absolute",
          left: pill.left,
          top: pill.top,
          display: "flex",
        }}
      >
        <Pill />
      </div>

      {/* title, then who's hiring */}
      <div
        style={{
          position: "absolute",
          left: head.left,
          top: head.top,
          width: head.width,
          height: head.height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            ...clamp(2),
            fontSize: size,
            fontWeight: 800,
            // Below ~1.1 the line clamp's overflow:hidden shears descenders.
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
              marginTop: companyGap,
              fontSize: companyShown,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -0.02 * 50,
              color: ACCENT,
            }}
          >
            {`at ${data.company}`}
          </div>
        ) : null}
      </div>

      {/* details, centred against the QR frame */}
      <div
        style={{
          position: "absolute",
          left: list.left,
          top: content.top,
          width: list.width,
          height: content.height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <DetailsList rows={rows} />
      </div>

      <QrFrame
        qr={qr}
        size={frame.size}
        style={{ position: "absolute", left: frame.left, top: content.top }}
      />

      <div
        style={{
          position: "absolute",
          left: divider.left,
          top: divider.top,
          width: divider.width,
          height: divider.height,
          backgroundColor: DIVIDER,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: footer.left,
          top: footer.top,
          width: footer.width,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 43,
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: -0.02 * 43,
            color: ACCENT,
          }}
        >
          Scan to apply
        </div>
        <Brand />
      </div>
    </Canvas>
  );
}
