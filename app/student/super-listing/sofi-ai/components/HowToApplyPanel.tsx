"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, Globe } from "lucide-react";

type HowToApplyPanelProps = {
  challengePdfUrl?: string;
  onGoToApply: () => void;
};

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="[font-family:var(--font-paraluman-heading)] text-lg font-bold tracking-[-0.025em] text-[#052338]">
      {children}
    </h2>
  );
}

function AsteriskList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-0.5 shrink-0 [font-family:var(--font-paraluman-mono)] text-sm font-semibold leading-8 text-[#00A886]">
            *
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function HowToApplyPanel({
  challengePdfUrl,
  onGoToApply,
}: HowToApplyPanelProps) {
  return (
    <div className="[font-family:var(--font-paraluman-body)] text-sm leading-8 text-[#184d45]/86 sm:text-[0.95rem]">
      <section className="space-y-5">
        <h1 className="[font-family:var(--font-paraluman-heading)] text-2xl font-bold leading-tight tracking-[-0.035em] text-[#052338] sm:text-[1.7rem]">
          Build a TikTok hook analysis frontend that makes AI feedback easy to
          trust and act on.
        </h1>
        <p>
          Sofi AI is focused on applied AI: customer automation, AI assistants,
          and workflow tools that real businesses use. This challenge is a
          smaller version of that same product problem.
        </p>
        <p>
          Design a frontend for a backend that analyzes TikTok hooks and returns
          useful AI feedback. Your interface should help a user understand why a
          hook works, where attention may drop, and what to try next.
        </p>
      </section>

      <section className="mt-9 space-y-4 border-t border-[#052338]/10 pt-8">
        <SectionTitle>Goal</SectionTitle>
        <AsteriskList
          items={[
            "Create a clear input flow for a TikTok link, caption, script, or hook text.",
            "Present hook score, retention risk, clarity, emotional pull, niche fit, and suggested rewrites.",
            "Make AI analysis feel specific, structured, and useful for a creator or business team.",
            "Include states for loading, failed analysis, empty input, and original-versus-improved comparison.",
          ]}
        />
      </section>

      <section className="mt-9 space-y-4 border-t border-[#052338]/10 pt-8">
        <SectionTitle>What we&apos;re looking for</SectionTitle>
        <div className="space-y-4">
          <p>
            <strong className="text-[#052338]">Judgment.</strong> Did you turn
            AI output into something a real user can understand and trust?
          </p>
          <p>
            <strong className="text-[#052338]">Taste.</strong> Does the
            interface feel like it belongs inside a fast-moving AI startup?
          </p>
          <p>
            <strong className="text-[#052338]">Execution.</strong> Did you show
            enough product states for this to feel like a real app, not a static
            mockup?
          </p>
        </div>
      </section>

      <section className="mt-9 space-y-4 border-t border-[#052338]/10 pt-8">
        <SectionTitle>Submission requirements</SectionTitle>
        <div className="space-y-4">
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

      <section className="mt-9 space-y-4 border-t border-[#052338]/10 pt-8">
        <SectionTitle>Before you start</SectionTitle>
        <div className="border-l border-[#00A886]/30 pl-4">
          <p>
            Bottom line: make AI feedback feel useful enough that someone would
            actually improve their hook before posting. Your solution should
            feel like a product interface, not a report generator.
          </p>
        </div>
      </section>
    </div>
  );
}
