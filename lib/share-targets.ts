import type { Job } from "@/lib/db/db.types";

/** What gets posted: the listing's short link, plus words to go with it. */
export interface SharePost {
  url: string;
  /** One-line summary, for platforms that take a caption. */
  text: string;
  /** Headline, for email. */
  subject: string;
}

export const sharePostFromJob = (job: Job, url: string): SharePost => {
  const company = (job.employer ?? job.employers)?.name;
  const subject = [job.title, company].filter(Boolean).join(" at ");
  const text = [subject, job.location].filter(Boolean).join(" · ");
  return {
    url,
    subject: subject || "Internship on BetterInternship",
    text: `${text ? `${text} — ` : ""}apply on BetterInternship.`,
  };
};

const q = encodeURIComponent;

/**
 * Where a listing can be shared to, each with a link that opens that
 * platform's own share screen already filled in. Facebook and LinkedIn only
 * take the URL — they build the card from the page's own preview — while the
 * rest also carry the text. Instagram and TikTok have no such link, which is
 * what the pubmat is for.
 */
export const SHARE_TARGETS = [
  {
    id: "facebook",
    label: "Facebook",
    href: ({ url }: SharePost) =>
      `https://www.facebook.com/sharer/sharer.php?u=${q(url)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: ({ url }: SharePost) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${q(url)}`,
  },
  {
    id: "x",
    label: "X",
    href: ({ url, text }: SharePost) =>
      `https://x.com/intent/post?text=${q(text)}&url=${q(url)}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: ({ url, text }: SharePost) =>
      `https://wa.me/?text=${q(`${text} ${url}`)}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    href: ({ url, text }: SharePost) =>
      `https://t.me/share/url?url=${q(url)}&text=${q(text)}`,
  },
] as const;

export type ShareTargetId = (typeof SHARE_TARGETS)[number]["id"];
