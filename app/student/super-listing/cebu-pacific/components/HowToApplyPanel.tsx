"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, Globe } from "lucide-react";

type HowToApplyPanelProps = {
  challengePdfUrl?: string;
  onGoToApply: () => void;
};

type SectionTitleProps = {
  title: string;
};

function SectionTitle({ title }: SectionTitleProps) {
  return (
    <h2 className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.35rem,2.6vw,2rem)] font-medium tracking-[-0.03em] text-[#173f69]">
      {title}
    </h2>
  );
}

export function HowToApplyPanel({
  challengePdfUrl,
  onGoToApply,
}: HowToApplyPanelProps) {
  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="space-y-4 border-t border-[#2574BB]/10 pt-8 first:border-t-0 first:pt-0">
        <div className="space-y-3">
          <h2 className="max-w-3xl [font-family:var(--font-paraluman-heading)] text-4xl font-bold leading-[1.25] tracking-[-0.04em] text-[#173f69] pb-1 border-b-[5px] w-fit border-b-[#173f69] border-opacity-80">
            Find{" "}
            <span className="bg-[#f8d64e]/50 px-1">
              one meaningful pain point
            </span>
            <br /> in Cebu Pacific&apos;s digital experience
            <br /> and rebuild it to be{" "}
            <span className="bg-[#f8d64e]/50 px-1">10x better.</span>
          </h2>
          <p className="max-w-3xl [font-family:var(--font-paraluman-body)] pt-4 text-base leading-7 text-[#173957] opacity-80 sm:text-lg sm:leading-8">
            Show clear product thinking, practical judgment, and execution
            quality through a working output, not just a concept.
          </p>
        </div>

        <div className="space-y-3 pt-5">
          <p className="[font-family:var(--font-paraluman-body)] font-semibold text-[#1f68a9]/64">
            Official links
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <a
              href={challengePdfUrl || "https://www.cebupacificair.com/en-PH/"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#2574BB]/10 bg-white px-3 py-2 text-sm text-[#173f69] transition-colors hover:bg-[#edf5ff]"
            >
              <Globe className="h-4 w-4" />
              Website
            </a>
            <a
              href="https://apps.apple.com/us/app/cebu-pacific/id1210712639"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#2574BB]/10 bg-white px-3 py-2 text-sm text-[#173f69] transition-colors hover:bg-[#edf5ff]"
            >
              <ArrowUpRight className="h-4 w-4" />
              App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.inkglobal.cebu.android&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#2574BB]/10 bg-white px-3 py-2 text-sm text-[#173f69] transition-colors hover:bg-[#edf5ff]"
            >
              <ArrowUpRight className="h-4 w-4" />
              Google Play
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-[#2574BB]/10 pt-8">
        <SectionTitle title="Goal" />
        <ul className="space-y-3 [font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#173957] opacity-80 sm:text-base">
          <li>Show how you think through a real passenger problem.</li>
          <li>
            Explain why the issue matters and what changed in your solution.
          </li>
          <li>Make the improvement feel concrete, useful, and believable.</li>
        </ul>
      </section>

      <section className="space-y-4 border-t border-[#2574BB]/10 pt-8">
        <SectionTitle title="What we're looking for" />
        <div className="space-y-4 [font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#173957] opacity-80 sm:text-base">
          <p>
            <span className="font-semibold text-[#173f69]">Judgment.</span> Did
            you choose a problem worth solving?
          </p>
          <p>
            <span className="font-semibold text-[#173f69]">Depth.</span> Did you
            understand the Cebu Pacific experience beyond surface UI?
          </p>
          <p>
            <span className="font-semibold text-[#173f69]">Execution.</span> Did
            you build something working instead of only presenting slides?
          </p>
        </div>
      </section>

      <section className="space-y-4 border-t border-[#2574BB]/10 pt-8">
        <SectionTitle title="Submission requirements" />
        <div className="space-y-4 [font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#173957] opacity-80 sm:text-base">
          <p>
            A deployed working prototype or tangible build, not only a
            wireframe.
          </p>
          <p>
            A short video pitch that tells the story clearly for a non-technical
            audience.
          </p>
          <p>
            One clean submission link plus your contact details in the next tab.
          </p>
        </div>
      </section>

      <section className="space-y-4 border-t border-[#2574BB]/10 pt-8">
        <SectionTitle title="Before you start" />
        <div className="space-y-4 bg-[rgba(250,243,220,0.84)] px-5 py-5 [font-family:var(--font-paraluman-body)] rounded-[0.33em] text-base leading-7 text-[#173957] opacity-80 sm:px-6 sm:py-6 sm:text-lg sm:leading-8">
          <p>This is about solving problems, not looking polished on paper.</p>
          <p>
            Most people will scroll past this. Some will start. Few will finish.
            Cebu Pacific is looking for the ones who can follow through.
          </p>
        </div>

        <div className="border-t border-[#2574BB]/12 bg-white/80 pt-5">
          <Button
            type="button"
            onClick={onGoToApply}
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#173f69] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-medium tracking-[-0.02em] text-white transition-all duration-200 hover:bg-[#123456]"
          >
            Submit work
          </Button>
        </div>
      </section>
    </div>
  );
}
