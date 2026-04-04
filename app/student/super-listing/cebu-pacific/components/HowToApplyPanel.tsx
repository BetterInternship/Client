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
      <div className="relative overflow-hidden rounded-[0.33em] border-2 border-[rgba(255,193,0,0.5)] bg-gradient-to-br from-[#ffc100] via-[#e4af00] to-[#c89400] px-6 py-10 text-black shadow-[0_24px_55px_-30px_rgba(255,193,0,0.88)] sm:px-8 sm:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,transparent_38%,rgba(255,255,255,0.06)_72%,transparent_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <div className="space-y-3">
            <h2 className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.8rem,6.8vw,4.2rem)] font-black uppercase leading-[0.9] tracking-[-0.03em] text-[#2574BB]">
              Build Better Digital Travel
            </h2>
          </div>

          <div className="w-full sm:w-auto">
            <Button
              type="button"
              onClick={onGoToApply}
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#2574BB] bg-[#2574BB] px-8 [font-family:var(--font-paraluman-heading)] text-base font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:bg-[#1c5a92] hover:shadow-lg sm:h-16 sm:w-auto sm:px-10 sm:text-lg"
            >
              Go to submit
            </Button>
            <p className="mt-2 [font-family:var(--font-paraluman-mono)] text-[10px] leading-tight text-black/75 sm:text-[11px]">
              No resume needed. Response in 24 hours
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[0.33em] border-2 border-[rgba(255,193,0,0.3)] bg-white shadow-[0_24px_55px_-35px_rgba(255,193,0,0.75)]">
        <div className="space-y-6 px-6 py-7 sm:px-8 sm:py-8">
          <section className="space-y-2 border-b border-[rgba(255,193,0,0.24)] pb-6">
            <p className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase text-[#6b5000]">
              This Challenge Is Your First Mission
            </p>
            <p className="[font-family:var(--font-paraluman-mono)] text-sm font-semibold leading-7 text-[#6b5000] sm:text-base">
              Design a practical digital solution that improves one part of the
              Cebu Pacific passenger journey.
            </p>
            <p className="[font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/80 sm:text-base">
              Think of this as a preview of how you will work here: real
              constraints, real decisions, and real impact from day one. We
              evaluate clarity and judgment over polish. You do not need a
              perfect output to stand out.
            </p>
          </section>

          <section className="space-y-2 border-b border-[rgba(255,193,0,0.24)] pb-6">
            <p className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase text-[#6b5000]">
              What You'll Build
            </p>
            <ul className="list-disc pl-5 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/80 sm:text-base">
              <li>Pick one journey: booking, check-in, or trip management</li>
              <li>Map the pain points and user flow</li>
              <li>Design a simple but high-impact product improvement</li>
              <li>Show how your solution works in practice</li>
            </ul>
          </section>

          <section className="space-y-2 border-b border-[rgba(255,193,0,0.24)] pb-6">
            <p className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase text-[#6b5000]">
              Deliverables
            </p>
            <ul className="list-disc pl-5 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/80 sm:text-base">
              <li>1-page solution brief</li>
              <li>Working prototype or clickable flow</li>
              <li>Short walkthrough (video or written)</li>
            </ul>
          </section>

          <section className="space-y-2 border-b border-[rgba(255,193,0,0.24)] pb-6">
            <p className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase text-[#6b5000]">
              Prototype Must Allow
            </p>
            <ul className="list-disc pl-5 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/80 sm:text-base">
              <li>A clear start state and user goal</li>
              <li>At least one full journey from start to completion</li>
              <li>Simple error or edge-case handling</li>
              <li>Visible success state</li>
            </ul>
          </section>

          <section className="space-y-2 border-b border-[rgba(255,193,0,0.24)] pb-6">
            <p className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase text-[#6b5000]">
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
            <p className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase text-[#6b5000]">
              Constraint
            </p>
            <p className="[font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/80 sm:text-base">
              Small team. Limited budget. Keep it simple.
            </p>
          </section>

          <div className="rounded-[0.33em] border border-[rgba(255,193,0,0.35)] bg-[#ffc100]/12 px-4 py-3">
            <p className="[font-family:var(--font-paraluman-mono)] text-sm font-semibold leading-7 text-[#5f4600] sm:text-base">
              How would you reduce passenger friction without adding complexity
              for operations?
            </p>
          </div>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[0.33em] border-2 border-[rgba(255,193,0,0.5)] bg-gradient-to-br from-[#ffc100] via-[#e4af00] to-[#c89400] p-6 text-black shadow-[0_24px_55px_-30px_rgba(255,193,0,0.88)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,transparent_38%,rgba(255,255,255,0.06)_72%,transparent_100%)]" />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="">
            <p className="[font-family:var(--font-paraluman-heading)] text-2xl text-[#2574BB] uppercase tracking-[-0.02em] sm:text-3xl">
              Ready to turn this into a real opportunity?
            </p>
            <p className="[font-family:var(--font-paraluman-mono)] text-[10px] leading-tight text-black/75 sm:text-[11px]">
              No resume needed. Response in 24 hours
            </p>
          </div>
          <div className="w-full sm:w-auto sm:text-right">
            <Button
              type="button"
              onClick={onGoToApply}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#2574BB] bg-[#2574BB] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:bg-[#1c5a92] hover:shadow-lg sm:w-auto"
            >
              Go to submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
