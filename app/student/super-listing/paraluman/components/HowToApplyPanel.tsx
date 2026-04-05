"use client";

import { Button } from "@/components/ui/button";

type HowToApplyPanelProps = {
  challengePdfUrl?: string;
  onGoToApply: () => void;
};

export function HowToApplyPanel({
  challengePdfUrl: _challengePdfUrl,
  onGoToApply,
}: HowToApplyPanelProps) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[0.33em] border-2 border-[rgba(114,6,140,0.45)] bg-gradient-to-br from-[#72068c] via-[#5a0570] to-[#4a0460] px-6 py-10 text-white shadow-[0_24px_55px_-30px_rgba(114,6,140,0.88)] sm:px-8 sm:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,transparent_38%,rgba(255,255,255,0.06)_72%,transparent_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <div className="space-y-3">
            <h2 className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.8rem,6.8vw,4.2rem)] font-black uppercase leading-[0.9] tracking-[-0.03em] text-white">
              Build the Future of Multilingual Journalism
            </h2>
          </div>

          <div className="w-full sm:w-auto">
            <Button
              type="button"
              onClick={onGoToApply}
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-white bg-white/95 px-8 [font-family:var(--font-paraluman-heading)] text-base font-bold uppercase tracking-[0.1em] text-[#72068c] transition-all duration-200 hover:bg-white hover:shadow-lg sm:h-16 sm:w-auto sm:px-10 sm:text-lg"
            >
              Apply
            </Button>
            <p className="mt-2 [font-family:var(--font-paraluman-mono)] text-[10px] leading-tight text-white/75 sm:text-[11px]">
              No resume needed. Guaranteed response in 24 hours
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[0.33em] border-2 border-[rgba(114,6,140,0.22)] bg-white shadow-[0_24px_55px_-35px_rgba(114,6,140,0.75)]">
        <div className="space-y-6 px-6 py-7 sm:px-8 sm:py-8">
          <section className="space-y-2 border-b border-[rgba(114,6,140,0.14)] pb-6">
            <p className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase text-[#72068c]">
              This Challenge Is Your First Mission
            </p>
            <p className="[font-family:var(--font-paraluman-mono)] text-sm leading-7 text-[#72068c] sm:text-base font-semibold">
              Build a system that publishes a news article in English and
              Filipino at the same time.
            </p>
            <p className="[font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/80 sm:text-base">
              Think of this as a preview of how you will work here: real
              constraints, real decisions, and real impact from day one. We
              evaluate clarity and judgment over polish. You do not need a
              perfect output to stand out.
            </p>
          </section>

          <section className="space-y-2 border-b border-[rgba(114,6,140,0.14)] pb-6">
            <p className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase text-[#72068c]">
              What You'll Build
            </p>
            <ul className="list-disc pl-5 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/80 sm:text-base">
              <li>Input English article</li>
              <li>Generate Filipino version</li>
              <li>Review before publish</li>
              <li>Publish both versions</li>
            </ul>
          </section>

          <section className="space-y-2 border-b border-[rgba(114,6,140,0.14)] pb-6">
            <p className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase text-[#72068c]">
              Deliverables
            </p>
            <ul className="list-disc pl-5 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/80 sm:text-base">
              <li>1-page design note</li>
              <li>Working prototype</li>
              <li>Demo login</li>
            </ul>
          </section>

          <section className="space-y-2 border-b border-[rgba(114,6,140,0.14)] pb-6">
            <p className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase text-[#72068c]">
              Prototype Must Allow
            </p>
            <ul className="list-disc pl-5 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/80 sm:text-base">
              <li>Login</li>
              <li>Submit and view article</li>
              <li>See Filipino version</li>
              <li>Approve</li>
              <li>View published result</li>
            </ul>
          </section>

          <section className="space-y-2 border-b border-[rgba(114,6,140,0.14)] pb-6">
            <p className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase text-[#72068c]">
              How We Evaluate
            </p>
            <ul className="list-disc pl-5 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/80 sm:text-base">
              <li>Clarity</li>
              <li>Practicality</li>
              <li>Flow</li>
              <li>Tradeoffs</li>
              <li>Initiative</li>
            </ul>
          </section>

          <section className="space-y-2">
            <p className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase text-[#72068c]">
              Constraint
            </p>
            <p className="[font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/80 sm:text-base">
              Small team. Limited budget. Keep it simple.
            </p>
          </section>

          <div className="rounded-[0.33em] border border-[rgba(114,6,140,0.24)] bg-[#72068c]/5 px-4 py-3">
            <p className="[font-family:var(--font-paraluman-mono)] text-sm font-semibold leading-7 text-[#5a0570] sm:text-base">
              How do you make reliable journalism accessible across languages
              without slowing it down?
            </p>
          </div>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[0.33em] border-2 border-[rgba(114,6,140,0.45)] bg-gradient-to-br from-[#72068c] via-[#5a0570] to-[#4a0460] p-6 text-white shadow-[0_24px_55px_-30px_rgba(114,6,140,0.88)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,transparent_38%,rgba(255,255,255,0.06)_72%,transparent_100%)]" />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="">
            <p className="[font-family:var(--font-paraluman-heading)] text-2xl text-white uppercase tracking-[-0.02em] sm:text-3xl">
              Ready to turn this into a real opportunity?
            </p>
            <p className="[font-family:var(--font-paraluman-mono)] text-sm leading-7 text-white/85 sm:text-base">
              Start now while your momentum is high. We reply in 24 hours.
            </p>
          </div>
          <div className="w-full sm:w-auto sm:text-right">
            <Button
              type="button"
              onClick={onGoToApply}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-white bg-white/95 px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-[#72068c] transition-all duration-200 hover:bg-white hover:shadow-lg sm:w-auto"
            >
              Start submission
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
