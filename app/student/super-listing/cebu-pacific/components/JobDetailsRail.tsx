"use client";

import { cebuPacificProfile } from "../../../companies/cebu-pacific/data";

export function JobDetailsRail() {
  return (
    <aside className="">
      <div className="grid gap-0 sm:grid-cols-3 lg:grid-cols-1">
        {cebuPacificProfile.jobDetails.map((item) => (
          <div
            key={item.label}
            className=" px-0 pb-4  sm:border-r sm:px-4 sm:last:border-r-0  lg:border-r-0 lg:px-0 "
          >
            <p className="[font-family:var(--font-paraluman-mono)] text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1f68a9]/62">
              {item.label}
            </p>
            <p className="mt-2 [font-family:var(--font-paraluman-heading)] text-lg font-medium leading-6 tracking-[-0.03em] text-[#173f69] sm:text-xl">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}
