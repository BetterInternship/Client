import { ImageResponse } from "next/og";
import { loadPubmatFonts } from "@/lib/pubmat/fonts";
import { PUBMAT_FORMATS, parsePubmatFormat } from "@/lib/pubmat/formats";
import { parsePubmatParams } from "@/lib/pubmat/params";
import { PubmatTemplate } from "@/lib/pubmat/template";

/**
 * GET /api/pubmat — a listing's pubmat as a PNG. Query params are the fields
 * of PubmatData (lib/pubmat/params.ts), plus `format` (lib/pubmat/formats.ts,
 * the square when absent) and `download=1`, which makes the browser save the
 * image instead of showing it.
 *
 * Lives under app/hire because the host rewrites in next.config.mjs send the
 * hire hosts' paths there. Reach it as hire.localhost in dev: on plain
 * localhost the same path rewrites into app/student.
 */

export const runtime = "nodejs";

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = parsePubmatParams(searchParams);
  if (!parsed.ok) {
    return new Response(parsed.error, { status: 400 });
  }
  const format = parsePubmatFormat(searchParams.get("format"));
  const { width, height } = PUBMAT_FORMATS[format];

  const headers: Record<string, string> = {
    "Cache-Control": "public, max-age=300",
  };
  if (searchParams.has("download")) {
    const name = slug(`${parsed.data.title}-${parsed.data.company}`);
    headers["Content-Disposition"] =
      `attachment; filename="${name || "listing"}-${format}-pubmat.png"`;
  }

  try {
    return new ImageResponse(
      <PubmatTemplate data={parsed.data} format={format} />,
      { width, height, fonts: loadPubmatFonts(), headers },
    );
  } catch (error) {
    console.error("[pubmat] render failed", error);
    return new Response("Couldn't make the pubmat.", { status: 500 });
  }
}
