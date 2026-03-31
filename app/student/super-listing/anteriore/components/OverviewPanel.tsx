"use client";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { OverviewContent } from "./types";

type OverviewPanelProps = {
  hasChallengeVideo: boolean;
  challengeVideoUrl: string;
  content: OverviewContent;
  onGoToApply: () => void;
};

const FAQ_ITEMS = [
  {
    question: "Who can apply for this internship?",
    answer:
      "Any builder who can ship fast and learn quickly. We care more about output than pedigree.",
  },
  {
    question: "Do I need a resume to apply?",
    answer:
      "No resume needed. Your challenge output and execution quality matter most.",
  },
  {
    question: "What should I include in my submission link?",
    answer:
      "Send one clear link that shows your work end-to-end (docs, demo, code, or walkthrough).",
  },
  {
    question: "How quickly will I hear back?",
    answer:
      "We aim to review quickly and send an update within 24 hours for qualified submissions.",
  },
];

export function OverviewPanel({
  hasChallengeVideo,
  challengeVideoUrl,
  content,
  onGoToApply: onGoToHowToApply,
}: OverviewPanelProps) {
  return (
    <div className="space-y-16 pt-4 sm:pt-8">
      <div className="space-y-4">
        <div className="inline-block rounded-[0.33em] border border-[#274b7d]/40 bg-white px-4 py-2">
          <p className="[font-family:var(--font-anteriore-mono)] text-xs font-bold uppercase tracking-[0.2em] text-[#274b7d]">
            Work With
          </p>
        </div>

        <div className="max-w-3xl rounded-[0.33em] border-2 border-[#274b7d]/30 bg-gradient-to-br from-[#203e68] via-[#1b3458] to-[#162c49] p-6 text-white shadow-[0_24px_50px_-28px_rgba(39,75,125,0.9)] sm:p-8">
          <p className="[font-family:var(--font-anteriore-heading)] text-[clamp(1.2rem,2.6vw,1.9rem)] font-black leading-tight tracking-[-0.02em] text-white">
            "{content.workWith.quote}"
          </p>
          <p className="mt-4 [font-family:var(--font-anteriore-mono)] text-xs uppercase tracking-[0.08em] text-white sm:text-sm">
            - {content.workWith.speaker}
            <span className="text-white/55">
              , {content.workWith.speakerTitle}
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="inline-block rounded-[0.33em] border border-[#274b7d]/40 bg-white px-4 py-2">
          <p className="[font-family:var(--font-anteriore-mono)] text-xs font-bold uppercase tracking-[0.2em] text-[#274b7d]">
            The Opportunity
          </p>
        </div>

        {hasChallengeVideo && (
          <div className="relative overflow-hidden rounded-[0.33em] border-2 border-[#274b7d]/30 bg-black pt-[56.25%] shadow-[0_24px_50px_-28px_rgba(39,75,125,0.45)]">
            <iframe
              src={challengeVideoUrl}
              title="Anteriore founder video"
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}

        <div className="max-w-4xl rounded-[0.33em] border border-[#274b7d]/40 bg-white px-4 py-2 sm:p-8">
          <p className="[font-family:var(--font-anteriore-heading)] text-[clamp(1.2rem,2.6vw,1.9rem)] font-black leading-tight tracking-[-0.02em] text-[#274b7d]">
            {content.opportunity}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="inline-block rounded-[0.33em] border border-[#274b7d]/40 bg-white px-4 py-2">
          <p className="[font-family:var(--font-anteriore-mono)] text-xs font-bold uppercase tracking-[0.2em] text-[#274b7d]">
            FAQ
          </p>
        </div>
        <div className="rounded-[0.33em] border-2 border-[#274b7d]/20 bg-white px-6 py-3 shadow-[0_16px_38px_-28px_rgba(39,75,125,0.65)]">
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`faq-${index}`}
                className="border-[#274b7d]/14"
              >
                <AccordionTrigger className="[font-family:var(--font-anteriore-heading)] text-sm font-bold uppercase tracking-[0.06em] text-[#274b7d] hover:no-underline sm:text-base">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="[font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/70">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[0.33em] border-2 border-[#274b7d]/45 bg-gradient-to-br from-[#274b7d] via-[#1b3458] to-[#162c49] p-6 text-white shadow-[0_24px_55px_-30px_rgba(39,75,125,0.88)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,transparent_38%,rgba(255,255,255,0.06)_72%,transparent_100%)]" />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="[font-family:var(--font-anteriore-heading)] text-2xl uppercase tracking-[-0.02em] sm:text-3xl text-white">
              Build this with us
            </p>
          </div>
          <div className="w-full sm:w-auto sm:text-right">
            <Button
              type="button"
              onClick={onGoToHowToApply}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-white bg-white/95 px-5 [font-family:var(--font-anteriore-heading)] text-sm font-bold uppercase tracking-[0.1em] text-[#274b7d] transition-all duration-200 hover:bg-white hover:shadow-lg sm:w-auto"
            >
              How to apply?
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
