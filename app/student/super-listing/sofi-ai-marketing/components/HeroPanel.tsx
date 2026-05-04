"use client";

export function HeroPanel() {
  return (
    <section className="px-0 py-1 sm:py-2">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
        <div className="space-y-6">
          <div className="max-w-4xl space-y-4">
            <h1 className="[font-family:var(--font-paraluman-heading)] text-[clamp(2rem,5vw,4.4rem)] font-medium leading-[0.98] tracking-[-0.05em] text-[#0D3B33]">
              Marketing Intern
            </h1>
            <p className="max-w-3xl [font-family:var(--font-paraluman-body)] text-base leading-7 text-[#184d45]/78 sm:text-lg sm:leading-8">
              Lead the launch marketing for GIA, a SOFI AI product that helps
              TikTok creators understand their analytics through clear,
              human-readable insights.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <p className="w-full border-b-[4px] border-[#07C4A7] pb-1 [font-family:var(--font-paraluman-heading)] text-3xl font-bold leading-[1.08] tracking-[-0.02em] text-[#07C4A7] sm:w-auto sm:pb-0 sm:leading-none sm:tracking-normal">
              No resume needed. Response in 24 hours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
