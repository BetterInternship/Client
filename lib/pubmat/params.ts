/**
 * What a listing pubmat shows. The layouts are sized for these lengths, so
 * `clampPubmatData` trims every field to fit before anything is drawn.
 */

export interface PubmatData {
  title: string;
  company: string;
  description?: string;
  /** Resolved image URL, not the employer's GCS object key. */
  companyLogo?: string;
  location?: string;
  /** Work mode and commitment, already joined, e.g. "Hybrid · Part-time". */
  setup?: string;
  pay?: string;
  deadline?: string;
  /** The listing's short share link; encoded into the QR code. */
  link: string;
}

const TEXT_LIMITS = {
  title: 120,
  company: 80,
  description: 150,
  location: 80,
  setup: 60,
  pay: 40,
  deadline: 40,
} as const;

const tidy = (value: string | undefined, max: number) =>
  (value ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export function clampPubmatData(data: PubmatData): PubmatData {
  const clamped: PubmatData = {
    title: tidy(data.title, TEXT_LIMITS.title),
    company: tidy(data.company, TEXT_LIMITS.company),
    link: data.link.trim(),
  };
  for (const field of [
    "description",
    "location",
    "setup",
    "pay",
    "deadline",
  ] as const) {
    const value = tidy(data[field], TEXT_LIMITS[field]);
    if (value) clamped[field] = value;
  }
  return clamped;
}
