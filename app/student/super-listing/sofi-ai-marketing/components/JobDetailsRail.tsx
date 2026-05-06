"use client";

type JobMetadataItem = {
  label: string;
  value: string;
  labelClassName?: string;
  valueClassName?: string;
};

const JOB_METADATA: readonly JobMetadataItem[] = [
  {
    label: "Location",
    value:
      " 2nd Floor, Bookman Building, Quezon Ave, Santa Mesa Heights, Quezon City, Metro Manila",
  },
  {
    label: "Employment Type",
    value: "Project Based / Flexible Internship",
  },
  { label: "Work Mode", value: "Hybrid (1-2x per week onsite)" },
  {
    label: "Compensation",
    value:
      "Per hour or project based (negotiable. if you're good, we can pay more!)",
  },
  {
    label: "Deadline",
    value: "May 9, 2026",
    labelClassName: "font-semibold text-red-600",
    valueClassName: "font-semibold text-red-600",
  },
] as const;

export function JobDetailsRail() {
  return (
    <aside>
      <div className="grid gap-5">
        {JOB_METADATA.map((item) => (
          <div key={item.label}>
            <p
              className={`[font-family:var(--font-paraluman-mono)] text-[0.62rem] font-semibold uppercase tracking-[0.14em] ${
                item.labelClassName ?? "text-[#052338]/35"
              }`}
            >
              {item.label}
            </p>
            <p
              className={`mt-1 [font-family:var(--font-paraluman-body)] text-sm leading-6 ${
                item.valueClassName ?? "text-[#052338]/80"
              }`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}
