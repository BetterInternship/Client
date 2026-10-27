const LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
/** The employer logo endpoint (imgUpload in the API) rejects bodies over 1 MB. */
const MAX_UPLOAD_BYTES = 1024 * 1024;
const MAX_SOURCE_BYTES = 5 * 1024 * 1024;
const MAX_SOURCE_PIXELS = 25_000_000;
/** The poster is 1080px square, so 512px is already more detail than shows. */
const MAX_EDGE = 512;

export type PubmatLogo = {
  /** Self-contained preview; survives the upload prompt unmounting. */
  src: string;
  /** Downscaled PNG, small enough for the logo endpoint. */
  blob: Blob;
};

export function validatePubmatLogoFile(file: Pick<File, "type" | "size">) {
  if (!LOGO_TYPES.has(file.type))
    throw new Error("Choose a PNG, JPG, or WebP logo.");
  if (!file.size)
    throw new Error("This file is empty. Please choose another image.");
  if (file.size > MAX_SOURCE_BYTES)
    throw new Error("This image is over 5 MB. Please choose a smaller logo.");
}

/**
 * Validates a picked logo, then re-encodes it as a PNG no larger than 512px on
 * its longest edge — the same bytes are used for the poster preview and for the
 * company-profile upload, so both always show the same image.
 */
export async function readPubmatLogo(file: File): Promise<PubmatLogo> {
  validatePubmatLogoFile(file);
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
    } catch {
      throw new Error("We couldn’t read this image. Please try another logo.");
    }
    if (
      !image.naturalWidth ||
      !image.naturalHeight ||
      image.naturalWidth * image.naturalHeight > MAX_SOURCE_PIXELS
    ) {
      throw new Error(
        "This image is too large to process. Choose a logo under 25 megapixels.",
      );
    }

    const scale = Math.min(
      1,
      MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error(
        "Your browser couldn’t process the logo. You can still continue without it.",
      );
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob)
      throw new Error(
        "Your browser couldn’t process the logo. You can still continue without it.",
      );
    if (blob.size > MAX_UPLOAD_BYTES)
      throw new Error(
        "This logo is too detailed to upload. Please choose a simpler image.",
      );

    return { src: await blobToDataUrl(blob), blob };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else
        reject(
          new Error("We couldn’t prepare this logo. Please try another image."),
        );
    };
    reader.onerror = () =>
      reject(
        new Error("We couldn’t prepare this logo. Please try another image."),
      );
    reader.readAsDataURL(blob);
  });
}
