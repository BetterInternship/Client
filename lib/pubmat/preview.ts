import { exportPosterPng } from "./worker-client";

/** A snapshot: exports always rasterize this preview, never newer editor state. */
export function posterPreview(svg: string, key: string) {
  let png: Promise<Blob> | undefined;
  return {
    svg,
    key,
    url: URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })),
    getPng: () => {
      png ??= exportPosterPng(svg).catch((error) => {
        png = undefined;
        throw error;
      });
      return png;
    },
  };
}

export async function downloadPoster(
  getPng: () => Promise<Blob>,
  filename: string,
) {
  const blob = await getPng();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  // Give the browser time to begin reading the download before releasing it.
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
