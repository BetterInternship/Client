import { Job, RefsData } from "@/lib/db/db.types";
import { createRefHelpers } from "@/lib/db/ref-lookup";
import { markdownToHtml } from "@/lib/utils/markdown-utils";

interface RefOption {
  id: number;
  name: string;
}

/*
 * Converts a date to ISO 8601 format, or returns undefined if the date is invalid.
 */
function toIsoDate(
  value: string | Date | null | undefined,
): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/*
 * Converts a frequency name to a standardized salary unit text.
 */
function toSalaryUnitText(freqName: string): string {
  const lower = freqName.toLowerCase();

  switch (lower) {
    case "hour":
    case "hourly":
      return "HOUR";
    case "day":
    case "daily":
      return "DAY";
    case "week":
    case "weekly":
      return "WEEK";
    case "year":
    case "yearly":
    case "annual":
      return "YEAR";
    default:
      return "MONTH";
  }
}

/**
 * Build job listing JSON for a listing as per schema.org. Return null for hibernating/unlisted jobs.
 * @param job Job to make schema for.
 * @param refs Reference data for lookups.
 * @returns Job listing schema.
 */
export function buildJobListingSchema(
  job: Job,
  refs: RefsData,
): Record<string, unknown> | null {
  if (job.hibernating || job.is_unlisted) return null;

  const jobModeHelpers = createRefHelpers(refs.job_modes as RefOption[]);
  const jobTypeHelpers = createRefHelpers(refs.job_types as RefOption[]);
  const jobPayFreqHelpers = createRefHelpers(refs.job_pay_freq as RefOption[]);

  const setupNames = (job.internship_preferences?.job_setup_ids ?? []).map(
    (id) => jobModeHelpers.toName(id),
  );

  const isFullyRemote =
    setupNames.length > 0 &&
    setupNames.every((name) => name.toLowerCase().includes("remote"));

  const employmentType = Array.from(
    new Set(
      [
        "INTERN",
        ...(job.internship_preferences?.job_commitment_ids ?? []).map((id) =>
          jobTypeHelpers.toName(id),
        ),
      ]
        .map((name) => {
          const lower = name.toLowerCase();
          if (lower === "intern") return "INTERN";
          if (lower.includes("full")) return "FULL_TIME";
          if (lower.includes("part")) return "PART_TIME";
          return null;
        })
        .filter((v): v is "INTERN" | "FULL_TIME" | "PART_TIME" => v !== null),
    ),
  );

  const description = job.description ? markdownToHtml(job.description) : "";

  // form schema based on https://schema.org/JobPosting
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description,
    datePosted: toIsoDate(job.last_activated_at ?? job.created_at),
    hiringOrganization: {
      "@type": "Organization",
      name: job.employer?.name ?? "BetterInternship",
    },
    employmentType,
    identifier: {
      "@type": "PropertyValue",
      name: "BetterInternship",
      value: job.id,
    },
    directApply: true,
  };

  if (isFullyRemote) {
    schema.jobLocationType = "TELECOMMUTE";
    schema.applicantLocationRequirements = {
      "@type": "Country",
      name: "Philippines",
    };
  } else {
    schema.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location ?? undefined,
        addressCountry: "PH",
      },
    };
  }

  if (job.end_date && !job.is_year_round) {
    const endDateMs = Number(job.end_date) * 1000;

    if (!Number.isNaN(endDateMs)) {
      schema.validThrough = new Date(endDateMs).toISOString();
    }
  }

  if (job.salary) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "PHP",
      value: {
        "@type": "QuantitativeValue",
        value: job.salary,
        unitText: toSalaryUnitText(jobPayFreqHelpers.toName(job.salary_freq)),
      },
    };
  }

  return schema;
}
