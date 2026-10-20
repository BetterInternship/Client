import type { IRefsContext, Job } from "@/lib/db/db.types";
import type { PubmatData } from "./params";

type RefNames = Pick<
  IRefsContext,
  "to_job_mode_name" | "to_job_type_name" | "to_job_pay_freq_name"
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
  const freq = known(refs.to_job_pay_freq_name(job.salary_freq));
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
): PubmatData {
  const preferences = job.internship_preferences;
  const setup = [
    ...(preferences?.job_setup_ids ?? []).map((id) =>
      known(refs.to_job_mode_name(id)),
    ),
    ...(preferences?.job_commitment_ids ?? []).map((id) =>
      known(refs.to_job_type_name(id)),
    ),
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    title: job.title ?? "",
    company: (job.employer ?? job.employers)?.name ?? "",
    location: job.location ?? undefined,
    setup: setup || undefined,
    pay: payLabel(job, refs),
    deadline: deadlineLabel(job.application_deadline),
    link,
  };
}
