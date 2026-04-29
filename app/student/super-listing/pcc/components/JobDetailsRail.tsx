"use client";

import { pccProfile } from "../../../companies/pcc/data";

export function JobDetailsRail() {
  return (
    <aside className="">
      <div className="grid gap-0 border border-[#2574BB]/12 bg-[#fbfdff] px-5 py-5 shadow-[0_18px_40px_-30px_rgba(19,70,111,0.35)] sm:grid-cols-3 lg:grid-cols-1 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none">
        {pccProfile.jobDetails.map((item) => (
          <div
            key={item.label}
            className="border-b border-[#2574BB]/10 px-0 py-4 first:pt-0 last:border-b-0 last:pb-0 sm:border-b-0 sm:py-0 sm:pr-4 lg:px-0 lg:pb-6 lg:pr-0"
          >
            <p className="[font-family:var(--font-paraluman-body)] text-xs font-semibold text-[#1f68a9]/62 opacity-60">
              {item.label}
            </p>
            <p className="mt-1 [font-family:var(--font-paraluman-heading)] text-lg font-medium leading-6 tracking-[-0.03em] text-[#173f69] sm:text-xl">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}
