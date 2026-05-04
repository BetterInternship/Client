"use client";

const JOB_METADATA = [
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
] as const;

export function JobDetailsRail() {
  return (
    <aside>
      <div className="grid gap-5">
        {JOB_METADATA.map((item) => (
          <div key={item.label}>
            <p className="[font-family:var(--font-paraluman-mono)] text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#052338]/35">
              {item.label}
            </p>
            <p className="mt-1 [font-family:var(--font-paraluman-body)] text-sm leading-6 text-[#052338]/80">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}
