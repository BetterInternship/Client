import type { CompanySection } from "../data";

type WhatWeOfferSectionProps = {
  section: CompanySection;
};

export function WhatWeOfferSection({ section }: WhatWeOfferSectionProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="rounded-[2rem] border border-[#f3d98a]/70 bg-[#fffaf0] px-6 py-7 shadow-[0_22px_50px_-40px_rgba(243,217,138,0.9)] sm:px-8 sm:py-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2574BB]/70">
          {section.eyebrow}
        </p>
        <h2 className="mt-4 [font-family:var(--font-cebu-company-heading)] text-3xl font-black tracking-[-0.03em] text-[#1f68a9] sm:text-4xl">
          {section.title}
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[#35526b] sm:text-lg">
          {section.body}
        </p>
      </div>
    </section>
  );
}
