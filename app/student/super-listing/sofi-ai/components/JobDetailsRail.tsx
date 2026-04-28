"use client";

const JOB_METADATA = [
  { label: "Location", value: "Remote" },
  { label: "Employment Type", value: "Part-time" },
  { label: "Duration", value: "3 months" },
  { label: "Department", value: "Design & Product" },
  {
    label: "Compensation",
    value: "Stipend provided. Amount discussed during onboarding",
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




