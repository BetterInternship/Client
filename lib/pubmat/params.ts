/**
 * What a listing pubmat shows, and how it travels from the dashboard to the
 * /api/pubmat route as query params.
 *
 * The route can't ask who is calling — the <img> preview and the download link
 * are plain GETs — so it trusts none of this: every field is clamped, and the
 * QR may only point at our own domain, otherwise the route would print a
 * BetterInternship-branded poster around any link someone typed in.
 */

export interface PubmatData {
  title: string;
  company: string;
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
  location: 80,
  setup: 60,
  pay: 40,
  deadline: 40,
} as const;

type TextField = keyof typeof TEXT_LIMITS;

const OPTIONAL_FIELDS: TextField[] = ["location", "setup", "pay", "deadline"];

const tidy = (value: string | null | undefined, max: number) =>
  (value ?? "").replace(/\s+/g, " ").trim().slice(0, max);

/**
 * Our own domain, or localhost outside production so the preview works in dev.
 * Short links are student-domain links (/l/<slug>), but any subdomain is ours.
 */
export function isAllowedPubmatLink(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  const host = url.hostname;
  if (
    url.protocol === "https:" &&
    (host === "betterinternship.com" || host.endsWith(".betterinternship.com"))
  ) {
    return true;
  }
  return (
    process.env.NODE_ENV !== "production" &&
    (host === "localhost" || host.endsWith(".localhost"))
  );
}

export type ParsedPubmat =
  | { ok: true; data: PubmatData }
  | { ok: false; error: string };

export function parsePubmatParams(params: URLSearchParams): ParsedPubmat {
  const title = tidy(params.get("title"), TEXT_LIMITS.title);
  if (!title) return { ok: false, error: "A listing title is required." };

  const link = (params.get("link") ?? "").trim();
  if (!isAllowedPubmatLink(link)) {
    return { ok: false, error: "The link must be a BetterInternship link." };
  }

  const data: PubmatData = {
    title,
    company: tidy(params.get("company"), TEXT_LIMITS.company),
    link,
  };
  for (const field of OPTIONAL_FIELDS) {
    const value = tidy(params.get(field), TEXT_LIMITS[field]);
    if (value) data[field] = value;
  }
  return { ok: true, data };
}

export function pubmatSearchParams(data: PubmatData): URLSearchParams {
  const params = new URLSearchParams();
  params.set("title", data.title);
  if (data.company) params.set("company", data.company);
  for (const field of OPTIONAL_FIELDS) {
    const value = data[field];
    if (value) params.set(field, value);
  }
  params.set("link", data.link);
  return params;
}
