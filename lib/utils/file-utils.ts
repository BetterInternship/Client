import Resizer from "react-image-file-resizer";

type ImageOutputMap = {
  file: File;
  base64: string;
  buffer: Buffer;
};

type ImageSize = {
  width: number;
  height: number;
};

export function truncateFileName(name: string, limit: number = 10): string {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex === -1) {
    // No extension, just truncate if needed.
    return name.length > limit ? name.substring(0, limit) + "..." : name;
  }
  const baseName = name.substring(0, dotIndex);
  const extension = name.substring(dotIndex); // includes the dot
  return baseName.length > limit
    ? baseName.substring(0, limit) + "..." + extension
    : name;
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function resizeImage<T extends keyof ImageOutputMap = "file">(
  image: File,
  quality: number,
  format: "JPEG" | "PNG" | "WEBP" = "JPEG",
  size: ImageSize = { width: 2000, height: 2000 },
  output: T = "file" as T
): Promise<ImageOutputMap[T]> {
  return new Promise((resolve, reject) => {
    Resizer.imageFileResizer(
      image,
      size.width,
      size.height,
      format,
      quality,
      0,
      (uri) => {
        if (output === "file") {
          resolve(uri as ImageOutputMap[T]);
        } else if (output === "base64") {
          resolve(uri as ImageOutputMap[T]);
        } else if (output === "buffer") {
          const arrayBuffer = base64ToArrayBuffer(uri as string);
          const buffer = Buffer.from(arrayBuffer);
          resolve(buffer as ImageOutputMap[T]);
        } else {
          resolve(uri as ImageOutputMap[T]);
        }
      },
      output
    );
  });
}
export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: "accurate" | "normal";
  } = {}
) {
  const { decimals = 0, sizeType = "normal" } = opts;

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === "accurate" ? accurateSizes[i] ?? "Bytest" : sizes[i] ?? "Bytes"
  }`;
}

export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectURL = URL.createObjectURL(file);
    img.onload = () => {
      const dimensions = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(objectURL);
      resolve(dimensions);
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(objectURL);
      reject(error);
    };
    img.src = objectURL;
  });
}

export function getURLFileName(url: string) {
  return url.split("/").pop() || "file.jpg";
}
