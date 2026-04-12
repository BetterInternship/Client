"use client";
import { cebuPacificProfile } from "../../../companies/cebu-pacific/data";

export function HeroPanel() {
  return (
    <section className="px-0 py-1 sm:py-2">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
        <div className="space-y-6">
          <div className="max-w-4xl space-y-4">
            <h1 className="[font-family:var(--font-paraluman-heading)] text-[clamp(2rem,5vw,4.4rem)] font-medium leading-[0.98] tracking-[-0.05em] text-[#173f69]">
              Product &amp; Web Interns
            </h1>
            <p className="max-w-3xl [font-family:var(--font-paraluman-body)] text-base leading-7 text-[#173957]/78 sm:text-lg sm:leading-8">
              {cebuPacificProfile.subheadline}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <p className="w-full border-b-[3px] border-warning/80 pb-1 [font-family:var(--font-paraluman-heading)] text-[clamp(0.98rem,4.6vw,1.2rem)] font-bold leading-[1.08] tracking-[-0.02em] text-warning sm:w-auto sm:border-b-4 sm:pb-0 sm:text-2xl sm:leading-none sm:tracking-normal">
              No resume needed. Response in 24 hours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
