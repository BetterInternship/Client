import { create } from "qrcode";
import jsQR from "jsqr";
import type { PubmatData } from "../params";
import { PubmatFitError } from "../core";
import { selectedIcon } from "./icons";
import { PUBMAT_V2_BACKGROUNDS } from "./index";

const SIZE = 1080;
const navy = "#00113F";
const blue = "#087CFF";
const chip = "#E2EFFF";
const cache = new Map<string, Promise<HTMLImageElement>>();
let fontReady: Promise<void> | undefined;

function loadFont() {
  fontReady ??= new FontFace(
    "Pubmat V2 Inter",
    'url("/fonts/pubmat/Inter-Variable.ttf")',
    { weight: "100 900" },
  )
    .load()
    .then((font) => {
      document.fonts.add(font);
    });
  return fontReady;
}

function image(src: string) {
  let result = cache.get(src);
  if (!result) {
    result = (async () => {
      const response = src.startsWith("data:")
        ? undefined
        : await fetch(src, { credentials: "include" });
      if (response && !response.ok)
        throw new Error("Could not load the poster image.");
      const objectUrl = response
        ? URL.createObjectURL(await response.blob())
        : undefined;
      const img = new Image();
      try {
        img.src = objectUrl ?? src;
        await img.decode();
        return img;
      } finally {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      }
    })().catch((error) => {
      cache.delete(src);
      throw error;
    });
    cache.set(src, result);
  }
  return result;
}

function fitText(
  ctx: CanvasRenderingContext2D,
  value: string,
  box: { x: number; y: number; width: number; height: number },
  size: number,
  minSize: number,
  maxLines: number,
  lineAdvance: number,
  weight = 400,
) {
  for (let current = size; current >= minSize; current--) {
    ctx.font = `${weight} ${current}px "Pubmat V2 Inter"`;
    const lines: string[] = [];
    for (const word of value.trim().split(/\s+/)) {
      const previous = lines.at(-1);
      if (previous && ctx.measureText(`${previous} ${word}`).width <= box.width)
        lines[lines.length - 1] += ` ${word}`;
      else lines.push(word);
    }
    if (lines.length > maxLines) continue;
    const metrics = lines.map((line) => ctx.measureText(line));
    if (metrics.some((metric) => metric.width > box.width)) continue;
    const height =
      metrics[0].actualBoundingBoxAscent +
      (lines.length - 1) * lineAdvance +
      metrics.at(-1)!.actualBoundingBoxDescent;
    if (height > box.height) continue;
    return { current, lines, metrics, height };
  }
  return undefined;
}

function drawFitted(
  ctx: CanvasRenderingContext2D,
  value: string,
  box: { x: number; y: number; width: number; height: number },
  options: {
    size: number;
    minSize: number;
    maxLines: number;
    advance: number;
    weight?: number;
    color: string;
    align?: "left" | "center";
  },
) {
  const fit = fitText(
    ctx,
    value,
    box,
    options.size,
    options.minSize,
    options.maxLines,
    options.advance,
    options.weight,
  );
  if (!fit)
    throw new PubmatFitError(
      "title",
      "This text does not fit the poster. Shorten it in Edit poster.",
    );
  ctx.font = `${options.weight ?? 400} ${fit.current}px "Pubmat V2 Inter"`;
  ctx.fillStyle = options.color;
  fit.lines.forEach((line, index) => {
    const x =
      options.align === "center"
        ? box.x + (box.width - fit.metrics[index].width) / 2
        : box.x;
    ctx.fillText(
      line,
      x,
      box.y + fit.metrics[0].actualBoundingBoxAscent + index * options.advance,
    );
  });
  return fit;
}

function cover(
  ctx: CanvasRenderingContext2D,
  source: HTMLImageElement,
  position: { x: number; y: number; scale: number },
  upload: boolean,
) {
  const scale =
    Math.max(SIZE / source.naturalWidth, SIZE / source.naturalHeight) *
    position.scale;
  const width = source.naturalWidth * scale;
  const height = source.naturalHeight * scale;
  const x = (SIZE - width) * position.x;
  const y = (SIZE - height) * position.y;
  ctx.drawImage(source, x, y, width, height);
  if (upload) {
    const wash = ctx.createLinearGradient(0, 0, SIZE, 0);
    wash.addColorStop(0, "rgba(255,255,255,.94)");
    wash.addColorStop(0.65, "rgba(255,255,255,.72)");
    wash.addColorStop(1, "rgba(255,255,255,.18)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }
}

export async function renderPubmatV2(data: PubmatData): Promise<Blob> {
  await loadFont();
  const selected = data.backgroundImage?.startsWith("data:")
    ? data.backgroundImage
    : (PUBMAT_V2_BACKGROUNDS.find((item) => item.id === data.backgroundImage)
        ?.src ?? PUBMAT_V2_BACKGROUNDS[0].src!);
  const source = await image(selected);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Your browser could not open the poster canvas.");
  const position = data.backgroundPosition ?? { x: 0.5, y: 0.5, scale: 1 };
  cover(
    ctx,
    source,
    position,
    data.backgroundImage?.startsWith("data:") ?? false,
  );
  ctx.textBaseline = "alphabetic";

  // Build from the bottom upward: action group, chips, then primary copy.
  const actionY = 811;
  const chipsY = actionY - 62 - 48;
  const primaryBottom = chipsY - 16;
  const titleMeasure = fitText(
    ctx,
    data.title,
    { x: 65, y: 0, width: 650, height: 360 },
    130,
    90,
    3,
    115,
  );
  if (!titleMeasure)
    throw new PubmatFitError(
      "title",
      "This text does not fit the poster. Shorten it in Edit poster.",
    );
  const descriptionMeasure = data.description
    ? fitText(
        ctx,
        data.description,
        { x: 69, y: 0, width: 680, height: 140 },
        35,
        30,
        3,
        42,
      )
    : undefined;
  if (data.description && !descriptionMeasure)
    throw new PubmatFitError(
      "description",
      "This description does not fit the poster. Shorten it in Edit poster.",
    );
  const descriptionY = descriptionMeasure
    ? primaryBottom - descriptionMeasure.height
    : primaryBottom;
  const titleY =
    descriptionY - (descriptionMeasure ? 28 : 0) - titleMeasure.height;
  if (data.companyLogo) {
    const logo = await image(data.companyLogo);
    const scale = Math.min(390 / logo.naturalWidth, 102 / logo.naturalHeight);
    ctx.drawImage(
      logo,
      63,
      titleY - 24 - 102,
      logo.naturalWidth * scale,
      logo.naturalHeight * scale,
    );
  }

  drawFitted(
    ctx,
    data.title,
    { x: 65, y: titleY, width: 650, height: titleMeasure.height },
    { size: 130, minSize: 90, maxLines: 3, advance: 115, color: navy },
  );
  if (data.description && descriptionMeasure) {
    drawFitted(
      ctx,
      data.description,
      { x: 69, y: descriptionY, width: 680, height: descriptionMeasure.height },
      { size: 35, minSize: 30, maxLines: 3, advance: 42, color: navy },
    );
  }

  const details = [
    ["location", data.location, "icons/location.svg"],
    ["setup", data.workMode ?? data.setup, "icons/work-setup.svg"],
    ["pay", data.payCompact ?? data.pay, "icons/compensation.svg"],
  ].filter((item): item is [string, string, string] =>
    Boolean(item[1]?.trim()),
  );
  // The chip group is deliberately separated from the primary copy group.
  let cursor = 69;
  for (const [, value, iconAsset] of details) {
    ctx.font = `700 24px "Pubmat V2 Inter"`;
    const width = Math.min(
      300,
      Math.max(150, ctx.measureText(value).width + 19 * 2 + 34 + 12),
    );
    ctx.fillStyle = chip;
    ctx.beginPath();
    ctx.roundRect(cursor, chipsY, width, 62, 28);
    ctx.fill();
    const icon = await image(selectedIcon(iconAsset, navy));
    ctx.drawImage(icon, cursor + 19, chipsY + 14, 34, 34);
    ctx.fillStyle = navy;
    ctx.fillText(value, cursor + 19 + 34 + 12, chipsY + 40);
    cursor += width + 16;
  }

  const qr = create(data.link, { errorCorrectionLevel: "L" });
  const quiet = 0;
  // Use the next whole module size so the QR grows crisply instead of being
  // fractionally stretched. It is anchored to the shared left and bottom
  // rulers rather than centered inside the old white card.
  const step = Math.ceil(224 / qr.modules.size);
  if (step < 3)
    throw new PubmatFitError(
      "link",
      "This listing link is too long for the poster QR.",
    );
  const qrSize = step * (qr.modules.size + quiet * 2);
  const qx = 69;
  // The action group remains bottom-anchored, independent of optional copy.
  const qy = 1035 - qrSize;
  ctx.fillStyle = "#FFFFFF";
  // Intentionally no white card or quiet-zone padding: the QR modules sit
  // directly on the selected poster background.
  ctx.fillStyle = "#000000";
  for (let y = 0; y < qr.modules.size; y++)
    for (let x = 0; x < qr.modules.size; x++)
      if (qr.modules.data[y * qr.modules.size + x])
        ctx.fillRect(
          qx + (x + quiet) * step,
          qy + (y + quiet) * step,
          step,
          step,
        );

  drawFitted(
    ctx,
    "Scan to apply via",
    { x: 314, y: actionY + 156, width: 300, height: 34 },
    {
      size: 34,
      minSize: 30,
      maxLines: 1,
      advance: 36,
      weight: 700,
      color: navy,
      align: "left",
    },
  );
  drawFitted(
    ctx,
    "BetterInternship",
    { x: 314, y: actionY + 192, width: 300, height: 32 },
    {
      size: 34,
      minSize: 30,
      maxLines: 1,
      advance: 36,
      weight: 700,
      color: blue,
      align: "left",
    },
  );

  const pixels = ctx.getImageData(qx, qy, qrSize, qrSize);
  if (jsQR(pixels.data, qrSize, qrSize)?.data !== data.link)
    throw new PubmatFitError("link", "The poster QR could not be verified.");
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Could not export the poster.")),
      "image/png",
    ),
  );
}
