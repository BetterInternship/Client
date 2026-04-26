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
    <h2 className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.35rem,2.6vw,2rem)] font-medium tracking-[-0.03em] text-[#0D3B33]">
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
      <section className="space-y-4 border-t border-[#07C4A7]/10 pt-8 first:border-t-0 first:pt-0">
        <div className="space-y-3">
          <h2 className="max-w-3xl [font-family:var(--font-paraluman-heading)] text-4xl font-bold leading-[1.25] tracking-[-0.04em] text-[#0D3B33] pb-1 border-b-[5px] w-fit border-b-[#0D3B33] border-opacity-80">
            Build a{" "}
            <span className="bg-[#07C4A7]/20 px-1">
              TikTok hook analysis frontend
            </span>
            <br /> that makes AI feedback easy to trust and act on.
          </h2>
          <p className="max-w-3xl [font-family:var(--font-paraluman-body)] pt-4 text-base leading-7 text-[#184d45] opacity-80 sm:text-lg sm:leading-8">
            Sofi AI is focused on applied AI: customer automation, AI
            assistants, and workflow tools that real businesses use. This
            challenge is a smaller version of that same product problem: design
            a frontend for a backend that analyzes TikTok hooks and returns
            useful AI feedback. Your interface should help a user understand why
            a hook works, where attention may drop, and what to try next.
          </p>
        </div>

        <div className="space-y-3 pt-5">
          <p className="[font-family:var(--font-paraluman-body)] font-semibold text-[#07C4A7]/64">
            Official links
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <a
              href={challengePdfUrl || "https://sofitech.ai/"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#07C4A7]/10 bg-white px-3 py-2 text-sm text-[#0D3B33] transition-colors hover:bg-[#e9fffb]"
            >
              <Globe className="h-4 w-4" />
              Website
            </a>
            <a
              href="https://www.linkedin.com/company/sofi-ai-tech-solution"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#07C4A7]/10 bg-white px-3 py-2 text-sm text-[#0D3B33] transition-colors hover:bg-[#e9fffb]"
            >
              <ArrowUpRight className="h-4 w-4" />
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-[#07C4A7]/10 pt-8">
        <SectionTitle title="Goal" />
        <ul className="space-y-3 [font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#184d45] opacity-80 sm:text-base">
          <li>Create a clear input flow for a TikTok link, caption, script, or hook text.</li>
          <li>Present hook score, retention risk, clarity, emotional pull, niche fit, and suggested rewrites.</li>
          <li>Make AI analysis feel specific, structured, and useful for a creator or business team.</li>
          <li>Include states for loading, failed analysis, empty input, and original-versus-improved comparison.</li>
        </ul>
      </section>

      <section className="space-y-4 border-t border-[#07C4A7]/10 pt-8">
        <SectionTitle title="What we're looking for" />
        <div className="space-y-4 [font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#184d45] opacity-80 sm:text-base">
          <p>
            <span className="font-semibold text-[#0D3B33]">Judgment.</span> Did
            you turn AI output into something a real user can understand and
            trust?
          </p>
          <p>
            <span className="font-semibold text-[#0D3B33]">Taste.</span> Does
            the interface feel like it belongs inside a fast-moving AI startup?
          </p>
          <p>
            <span className="font-semibold text-[#0D3B33]">Execution.</span>{" "}
            Did you show enough product states for this to feel like a real app,
            not a static mockup?
          </p>
        </div>
      </section>

      <section className="space-y-4 border-t border-[#07C4A7]/10 pt-8">
        <SectionTitle title="Submission requirements" />
        <div className="space-y-4 [font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#184d45] opacity-80 sm:text-base">
          <p>
            A workable prototype, live demo, Figma, video walkthrough, or
            document that clearly shows the frontend experience.
          </p>
          <p>
            Your flow must include input, analysis loading, result summary,
            scoring, suggested rewrites, and original-versus-improved
            comparison.
          </p>
          <p>
            Include a short explanation of your product decisions: what you
            prioritized, what you simplified, and what you would build next if
            given backend access.
          </p>
        </div>
      </section>

      <section className="space-y-4 border-t border-[#07C4A7]/10 pt-8">
        <SectionTitle title="Before you start" />
        <div className="space-y-4 bg-[rgba(231,255,250,0.84)] px-5 py-5 [font-family:var(--font-paraluman-body)] rounded-[0.33em] text-base leading-7 text-[#184d45] opacity-80 sm:px-6 sm:py-6 sm:text-lg sm:leading-8">
          <p>
            Bottom line: make AI feedback feel useful enough that someone would
            actually improve their hook before posting.
          </p>
          <p>
            Your solution should feel like a product interface, not a report
            generator.
          </p>
        </div>

        <div className="border-t border-[#07C4A7]/12 bg-white/80 pt-5">
          <Button
            type="button"
            onClick={onGoToApply}
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#0D3B33] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-medium tracking-[-0.02em] text-white transition-all duration-200 hover:bg-[#0a2f29]"
          >
            Submit work
          </Button>
        </div>
      </section>
    </div>
  );
}



