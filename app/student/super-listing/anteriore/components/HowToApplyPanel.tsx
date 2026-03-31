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
      <div className="overflow-hidden rounded-[0.33em] border-2 border-[#274b7d]/22 bg-white shadow-[0_24px_55px_-35px_rgba(39,75,125,0.75)]">
        <div className="flex flex-col gap-6 bg-gradient-to-br from-[#274b7d] via-[#1b3458] to-[#162c49] px-6 py-7 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-8">
          <p className="[font-family:var(--font-anteriore-heading)] text-2xl font-black uppercase tracking-[-0.02em] text-white sm:text-3xl">
            Complete this challenge to apply
          </p>

          <div className="w-full sm:w-auto sm:text-right">
            <Button
              type="button"
              onClick={onGoToApply}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-white bg-white/95 px-5 [font-family:var(--font-anteriore-heading)] text-sm font-bold uppercase tracking-[0.1em] text-[#274b7d] transition-all duration-200 hover:bg-white hover:shadow-lg sm:w-auto"
            >
              Apply
            </Button>
            <p className="mt-1.5 [font-family:var(--font-anteriore-mono)] text-[10px] leading-tight text-white/75 sm:text-[11px]">
              No resume needed. Response in 24 hours
            </p>
          </div>
        </div>

        <div className="space-y-6 px-6 py-7 sm:px-8 sm:py-8">
          <section className="space-y-2 border-b border-[#274b7d]/14 pb-6">
            <p className="[font-family:var(--font-anteriore-heading)] text-lg font-black uppercase text-[#274b7d]">
              Challenge: Build the Future of Multilingual Journalism
            </p>
            <p className="[font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/80 sm:text-base">
              Make journalism accessible across languages. Build something real.
              Ship it.
            </p>
            <p className="[font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/80 sm:text-base">
              Build a system that publishes a news article in English and
              Filipino at the same time.
            </p>
          </section>

          <section className="space-y-2 border-b border-[#274b7d]/14 pb-6">
            <p className="[font-family:var(--font-anteriore-heading)] text-lg font-black uppercase text-[#274b7d]">
              What You'll Build
            </p>
            <ul className="list-disc pl-5 [font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/80 sm:text-base">
              <li>Input English article</li>
              <li>Generate Filipino version</li>
              <li>Review before publish</li>
              <li>Publish both versions</li>
            </ul>
          </section>

          <section className="space-y-2 border-b border-[#274b7d]/14 pb-6">
            <p className="[font-family:var(--font-anteriore-heading)] text-lg font-black uppercase text-[#274b7d]">
              Deliverables
            </p>
            <ul className="list-disc pl-5 [font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/80 sm:text-base">
              <li>1-page design note</li>
              <li>Working prototype</li>
              <li>Demo login</li>
            </ul>
          </section>

          <section className="space-y-2 border-b border-[#274b7d]/14 pb-6">
            <p className="[font-family:var(--font-anteriore-heading)] text-lg font-black uppercase text-[#274b7d]">
              Prototype Must Allow
            </p>
            <ul className="list-disc pl-5 [font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/80 sm:text-base">
              <li>Login</li>
              <li>Submit and view article</li>
              <li>See Filipino version</li>
              <li>Approve</li>
              <li>View published result</li>
            </ul>
          </section>

          <section className="space-y-2 border-b border-[#274b7d]/14 pb-6">
            <p className="[font-family:var(--font-anteriore-heading)] text-lg font-black uppercase text-[#274b7d]">
              Evaluation
            </p>
            <p className="[font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/80 sm:text-base">
              Clarity - Practicality - Flow - Tradeoffs
            </p>
          </section>

          <section className="space-y-2">
            <p className="[font-family:var(--font-anteriore-heading)] text-lg font-black uppercase text-[#274b7d]">
              Constraint
            </p>
            <p className="[font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/80 sm:text-base">
              Small team. Limited budget. Keep it simple.
            </p>
          </section>

          <div className="rounded-[0.33em] border border-[#274b7d]/24 bg-[#274b7d]/5 px-4 py-3">
            <p className="[font-family:var(--font-anteriore-mono)] text-sm font-semibold leading-7 text-[#1b3458] sm:text-base">
              How do you make reliable journalism accessible across languages
              without slowing it down?
            </p>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[0.33em] border-2 border-[#274b7d]/45 bg-gradient-to-br from-[#274b7d] via-[#1b3458] to-[#162c49] p-6 text-white shadow-[0_24px_55px_-30px_rgba(39,75,125,0.88)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,transparent_38%,rgba(255,255,255,0.06)_72%,transparent_100%)]" />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="[font-family:var(--font-anteriore-heading)] text-2xl uppercase tracking-[-0.02em] text-white sm:text-3xl">
              Ready to apply?
            </p>
          </div>
          <div className="w-full sm:w-auto sm:text-right">
            <Button
              type="button"
              onClick={onGoToApply}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-white bg-white/95 px-5 [font-family:var(--font-anteriore-heading)] text-sm font-bold uppercase tracking-[0.1em] text-[#274b7d] transition-all duration-200 hover:bg-white hover:shadow-lg sm:w-auto"
            >
              Apply
            </Button>
            <p className="mt-1.5 [font-family:var(--font-anteriore-mono)] text-[10px] leading-tight text-white/75 sm:text-[11px]">
              No resume needed. Response in 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
