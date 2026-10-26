import type { IRefsContext, Job } from "@/lib/db/db.types";
import type { PubmatData } from "./params";

type RefNames = Pick<
  IRefsContext,
  "toJobModeName" | "toJobTypeName" | "toJobPayFreqName"
>;

// The refs helpers answer "Not specified" for an id they don't know.
const known = (name: string | null | undefined) =>
  name && name !== "Not specified" ? name : null;

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/**
 * Pay reads the way the listing page does (components/shared/jobs.tsx):
 * allowance 0 is a paid listing, with the amount when one was entered. Unpaid
 * and credit-only listings get no pay row rather than a "₱0".
 */
function payLabel(job: Job, refs: RefNames): string | undefined {
  if (job.allowance !== 0) return undefined;
  const salary = Number(job.salary);
  if (!job.salary || Number.isNaN(salary) || salary <= 0) return "Paid";
  const freq = known(refs.toJobPayFreqName(job.salary_freq));
  // The refs name it "Day"; the pubmat reads better as "₱500/day".
  return freq
    ? `${peso.format(salary)}/${freq.toLowerCase()}`
    : peso.format(salary);
}

function deadlineLabel(deadline: number | null | undefined) {
  if (!deadline) return undefined;
  return new Date(deadline).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  });
}

/** Maps a listing, plus its minted share link, onto what the pubmat shows. */
export function pubmatDataFromJob(
  job: Job,
  refs: RefNames,
  link: string,
  fullDescription = false,
): PubmatData {
  const preferences = job.internship_preferences;
  const setup = [
    ...(preferences?.job_setup_ids ?? []).map((id) =>
      known(refs.toJobModeName(id)),
    ),
    ...(preferences?.job_commitment_ids ?? []).map((id) =>
      known(refs.toJobTypeName(id)),
    ),
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    title: job.title ?? "",
    company: (job.employer ?? job.employers)?.name ?? "",
    description: fullDescription ? plainTextDescription(job.description) : descriptionExcerpt(job.description),
    location: job.location ?? undefined,
    setup: setup || undefined,
    pay: payLabel(job, refs),
    deadline: deadlineLabel(job.application_deadline),
    link,
  };
}

/** Plain-text excerpt only; never send markup or invented copy to the poster. */
export function descriptionExcerpt(value: string | null | undefined) {
  const text = plainTextDescription(value);
  if (!text) return undefined;
  if (text.length <= 145) return text;
  return `${text.slice(0, 142).replace(/\s+\S*$/, "").trimEnd()}…`;
}

/** Full plain text for the new measured layouts; never silently shortened. */
export function plainTextDescription(value: string | null | undefined) {
  if (!value) return undefined;
  const text = value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;|&gt;/gi, " ")
    .replace(/[#*_`~>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return undefined;
  return text;
}
