/** Poster input. Templates fit the wording rather than silently truncating it. */

export interface PubmatData {
  title: string;
  company: string;
  description?: string;
  /** Resolved image URL, not the employer's GCS object key. */
  companyLogo?: string;
  location?: string;
  /** Work mode and commitment, already joined, e.g. "Hybrid · Part-time". */
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
}

/** Short, broadly applicable poster copy used for every listing poster. */
export const DEFAULT_PUBMAT_DESCRIPTION =
  "Build real-world skills through meaningful internship experience.";
