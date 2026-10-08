/**
 * helpers for uploading a logo during recruiter registration.
 */

export const REGISTRATION_LOGO_KEY = "hire-registration-logo";

// adhere to client-side pfp size limits.
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = (1024 * 1024) / 4;

export const LOGO_REQUIREMENTS = "Square JPEG, PNG, or WebP, up to 256 KB.";

type LogoResult = { dataUrl: string } | { error: string };

const readAsDataUrl = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Unreadable file."));
    reader.readAsDataURL(file);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Unreadable image."));
    img.src = src;
  });

// validate picked file.
export const readLogoFile = async (file: File): Promise<LogoResult> => {
  if (!ALLOWED_TYPES.includes(file.type))
    return { error: "Please upload a JPEG, PNG, or WebP image." };
  if (file.size > MAX_BYTES)
    return { error: "Image size must be less than 0.25MB." };

  try {
    const dataUrl = await readAsDataUrl(file);
    const img = await loadImage(dataUrl);
    if (img.width !== img.height) return { error: "Image must be square." };
    return { dataUrl };
  } catch {
    return { error: "Couldn't read that image. Try a different one." };
  }
};

// temp store logo in sessionStorage to be uploaded after registration.
export const storePendingLogo = (dataUrl: string | null) => {
  try {
    if (dataUrl) sessionStorage.setItem(REGISTRATION_LOGO_KEY, dataUrl);
    else sessionStorage.removeItem(REGISTRATION_LOGO_KEY);
  } catch {
    // blank catch block because sessionStorage will throw an error if disabled/full
    // but not worth crashing the app over.
  }
};

// return pending logo file and remove it from sessionStorage, or null if none.
export const takePendingLogo = (): File | null => {
  try {
    const dataUrl = sessionStorage.getItem(REGISTRATION_LOGO_KEY);
    sessionStorage.removeItem(REGISTRATION_LOGO_KEY);
    const match = dataUrl && /^data:([^;,]+);base64,(.*)$/.exec(dataUrl);
    if (!match) return null;

    const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
    return new File([bytes], "logo", { type: match[1] });
  } catch {
    return null;
  }
};
