import type { CompanySection } from "../data";

type WhoWeAreSectionProps = {
  section: CompanySection;
};

export function WhoWeAreSection({ section }: WhoWeAreSectionProps) {
  return (
    <section className="px-6 py-12 sm:px-8 sm:py-14 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[0.33rem] border border-[#2574BB]/12 bg-[#f8fcff] px-6 py-7 shadow-[0_22px_50px_-40px_rgba(37,116,187,0.45)] sm:px-8 sm:py-9 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2574BB]/70">
            {section.eyebrow}
          </p>
          <h2 className="[font-family:var(--font-cebu-company-heading)] mt-4 text-3xl font-black tracking-[-0.03em] text-[#1f68a9] sm:text-4xl">
            {section.title}
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
            <p className="text-base leading-8 text-[#35526b] sm:text-lg">
              {section.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
