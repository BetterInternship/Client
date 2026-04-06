"use client";

import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

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
      <div className="overflow-hidden rounded-[0.33em] border-2 border-[#2574BB]/35 shadow-[0_24px_55px_-35px_rgba(37,116,187,0.6)]">
        <div className="relative bg-gradient-to-br from-[#edf6ff] via-[#e3efff] to-[#d6e8ff] px-6 py-6 text-black sm:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_92%_8%,rgba(243,217,138,0.26),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.2)_0%,transparent_42%,rgba(255,255,255,0.08)_74%,transparent_100%)]" />
          <div className="relative z-10">
            <div className="space-y-10">
              <div className="space-y-3">
                <p className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.16em] text-[#1f68a9]/80 sm:text-sm">
                  Challenge Brief
                </p>
                <p className="[font-family:var(--font-paraluman-heading)] text-2xl font-black leading-[1.16] tracking-[-0.02em] text-[#1f68a9] sm:text-3xl">
                  <span className="inline-block w-fit bg-[#f3d98a] px-2 py-0.5">
                    Find a pain point within
                  </span>
                  <br />
                  <span className="mt-1 inline-block w-fit bg-[#f3d98a] px-2 py-0.5">
                    Cebu Pacific&apos;s app/website.
                  </span>
                  <br />
                  <span className="mt-1 inline-block w-fit bg-[#f3d98a] px-2 py-0.5">
                    Rebuild it to be{" "}
                    <span className="font-black text-[#2574BB]">
                      10x better
                    </span>
                    .
                  </span>
                </p>
                <p className="[font-family:var(--font-paraluman-body)] text-sm text-[#163a5b]/85 sm:text-base">
                  Show us clear product thinking, practical judgment, and
                  execution quality.
                </p>

                <p className="[font-family:var(--font-paraluman-mono)] text-xs uppercase tracking-[0.12em] text-[#163a5b]/75 sm:text-sm ">
                  Official Links
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center [font-family:var(--font-paraluman-body)] text-sm text-black/80 sm:text-base">
                  <a
                    href="https://www.cebupacificair.com/en-PH/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[0.33em] border border-[#173957]/20 bg-white/35 px-3 py-2 text-xs font-semibold text-[#173957] transition-colors hover:bg-white hover:text-[#0f3150] sm:w-auto sm:justify-start sm:py-1.5 sm:text-sm"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Website
                  </a>
                  <a
                    href="https://apps.apple.com/us/app/cebu-pacific/id1210712639"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[0.33em] border border-[#173957]/20 bg-white/35 px-3 py-2 text-xs font-semibold text-[#173957] transition-colors hover:bg-white hover:text-[#0f3150] sm:w-auto sm:justify-start sm:py-1.5 sm:text-sm"
                  >
                    App Store
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.inkglobal.cebu.android&hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[0.33em] border border-[#173957]/20 bg-white/35 px-3 py-2 text-xs font-semibold text-[#173957] transition-colors hover:bg-white hover:text-[#0f3150] sm:w-auto sm:justify-start sm:py-1.5 sm:text-sm"
                  >
                    Google Play
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <Button
                  type="button"
                  onClick={onGoToApply}
                  size={"lg"}
                  className="rounded-[0.33em] border-2 border-[#2574BB] bg-[#2574BB] px-7 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:bg-[#1c5a92] hover:shadow-lg sm:w-auto"
                >
                  Submit Work
                </Button>
                <p className="[font-family:var(--font-paraluman-body)] text-[10px] leading-tight text-black/75 sm:text-[11px]">
                  No resume needed. Response in 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6 border-t border-[#2574BB]/22 bg-white px-6 py-7 sm:px-8 sm:py-8">
          <section className="space-y-2 border-b border-[#2574BB]/16 pb-6">
            <p className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase text-[#1f68a9]">
              Goal
            </p>
            <ul className="list-disc pl-5 [font-family:var(--font-paraluman-body)] text-sm leading-7 text-black/80 sm:text-base">
              <li>Show us how you think.</li>
              <li>Why does this problem matter?</li>
              <li>Why did you make those changes?</li>
              <li>How does your solution improve the experience?</li>
              <li>If we&apos;re impressed, you&apos;re in.</li>
            </ul>
          </section>

          <section className="space-y-2 border-b border-[#2574BB]/16 pb-6">
            <p className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase text-[#1f68a9]">
              What We&apos;re Looking For
            </p>
            <ol className="list-decimal pl-8 [font-family:var(--font-paraluman-body)] text-sm leading-7 text-black/80 sm:text-base space-y-3">
              <li>
                <span className="font-black">Taste and judgment</span>
                <br />
                Did you pick the right problem? Is it actually worth solving?
              </li>
              <li>
                <span className="font-black">Thinking</span>
                <br />
                How deep did you go? Did you understand the Cebu Pacific
                experience, or did you only make something look nicer?
              </li>
              <li>
                <span className="font-black">Execution</span>
                <br />
                Did you actually build something working, or were you only
                presenting ideas?
              </li>
              <li>
                <span className="font-black">Creativity and initiative</span>
                <br />
                This internship doesn&apos;t have much handholding. We&apos;re
                looking for someone who takes initiative and figures things out.
              </li>
              <li>
                <span className="font-black">Effort and attitude</span>
                <br />
                Skill matters, but how you approach the work matters more.
              </li>
            </ol>
          </section>

          <section className="space-y-2 border-b border-[#2574BB]/16 pb-6">
            <p className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase text-[#1f68a9]">
              Submission Requirements
            </p>
            <ol className="list-decimal pl-8 [font-family:var(--font-paraluman-body)] text-sm leading-7 text-black/80 sm:text-base">
              <li>
                Your redesign or solution as a deployed working prototype, not a
                wireframe.
              </li>
              <li>
                A short video pitch as a compelling story for a non-technical
                audience, not a technical deep dive.
              </li>
            </ol>
          </section>

          <section className="space-y-2">
            <p className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase text-[#1f68a9]">
              Before You Start
            </p>
            <p className="[font-family:var(--font-paraluman-body)] text-sm leading-7 text-black/80 sm:text-base">
              This internship isn&apos;t about being the best programmer or the
              best designer. It&apos;s about being able to solve problems.
            </p>
            <p className="[font-family:var(--font-paraluman-body)] text-sm leading-7 text-black/80 sm:text-base">
              Most people will scroll past this. Some will start, but few will
              finish. We&apos;re looking for the few resilient ones who will
              follow through.
            </p>
          </section>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[0.33em] border-2 border-[#2574BB]/38 bg-gradient-to-br from-[#edf6ff] via-[#e4f0ff] to-[#d8e9ff] p-6 text-[#173957] shadow-[0_24px_55px_-30px_rgba(37,116,187,0.62)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_85%,rgba(243,217,138,0.22),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.16)_0%,transparent_38%,rgba(255,255,255,0.06)_72%,transparent_100%)]" />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="">
            <p className="[font-family:var(--font-paraluman-heading)] text-2xl text-[#1f68a9] uppercase tracking-[-0.02em] sm:text-3xl !font-black">
              Ready to turn this into a real opportunity?
            </p>
            <p className="[font-family:var(--font-paraluman-body)] text-[10px] leading-tight text-[#1d466f]/80 sm:text-[11px]">
              No resume needed. Response in 24 hours
            </p>
          </div>
          <div className="w-full sm:w-auto sm:text-right">
            <Button
              type="button"
              onClick={onGoToApply}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#d8c17b] bg-[#ecd389] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-[#173957] transition-all duration-200 hover:bg-[#e2c36b] hover:shadow-[0_12px_26px_-14px_rgba(236,211,137,0.9)] sm:w-auto"
            >
              Submit Work
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
