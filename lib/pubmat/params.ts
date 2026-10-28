/** Poster input. Templates fit the wording rather than silently truncating it. */

export type PubmatFontStyle = "modern" | "professional" | "editorial";

export interface PubmatData {
  title: string;
  company: string;
  description?: string;
  /** Resolved image URL, not the employer's GCS object key. */
  companyLogo?: string;
  location?: string;
  /** Legacy work-mode field; commitment/type values are intentionally omitted. */
  setup?: string;
  /** Work mode only, without commitment/type (used by v2 chips). */
  workMode?: string;
  pay?: string;
  /** Optional display supplied for tight information strips; never invent one. */
  payCompact?: string;
  deadline?: string;
  /** The listing's short share link; encoded into the QR code. */
  link: string;
  backgroundImage?: string;
  backgroundPosition?: { x: number; y: number; scale: number };
  fontStyle?: PubmatFontStyle;
}

/** Keep detail chips usable across every theme without changing the listing. */
export const PUBMAT_LOCATION_MAX_LENGTH = 24;

export function posterLocation(value: string | null | undefined) {
  const location = value?.trim();
  if (!location) return undefined;
  if (location.length <= PUBMAT_LOCATION_MAX_LENGTH) return location;
  return `${location.slice(0, PUBMAT_LOCATION_MAX_LENGTH - 1).trimEnd()}…`;
}

/** Short, broadly applicable poster copy used for every listing poster. */
export const DEFAULT_PUBMAT_DESCRIPTION =
  "Build real-world skills through meaningful internship experience.";
