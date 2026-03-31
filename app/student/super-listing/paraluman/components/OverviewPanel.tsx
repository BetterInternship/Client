"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CEOProfile } from "./types";

type OverviewPanelProps = {
  hasChallengeVideo: boolean;
  challengeVideoUrl: string;
  ceoProfile: CEOProfile;
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
  ceoProfile,
  onGoToApply: onGoToHowToApply,
}: OverviewPanelProps) {
  return (
    <div className="space-y-16 pt-4 sm:pt-8">
      <div className="space-y-4">
        <div className="inline-block rounded-[0.33em] border border-[rgba(114,6,140,0.4)] bg-white px-4 py-2">
          <p className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.2em] text-[#72068c]">
            Who We Are
          </p>
        </div>
        <div className="max-w-3xl rounded-[0.33em] border-2 border-[rgba(114,6,140,0.2)] bg-white p-6 shadow-[0_16px_38px_-28px_rgba(114,6,140,0.65)] sm:p-8">
          <p className="[font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/75 sm:text-base">
            Our newsroom product stack is built for fast bilingual publishing,
            from drafting and translation to review and release.
            <span className="mt-6 block">
              As an intern, you will help design and ship tools that improve
              editorial velocity, reduce manual steps, and raise story quality
              for real readers.
            </span>
            <span className="mt-6 block">
              We care about execution, ownership, and your ability to turn clear
              problem statements into shipped systems.
              <span className="font-bold text-[#72068c]">
                {" "}
                Build quickly. Iterate from feedback. Ship with impact.
              </span>{" "}
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex">
          <div className="inline-block rounded-[0.33em] border border-[rgba(114,6,140,0.4)] bg-white px-4 py-2">
            <p className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.2em] text-[#72068c]">
              Work With
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-6 text-left sm:flex-row sm:items-end">
          <div className="relative h-52 w-52 flex-shrink-0 overflow-hidden rounded-[0.33em] border-2 border-[rgba(114,6,140,0.3)] shadow-xl sm:h-72 sm:w-72">
            <Image
              src={ceoProfile.imageSrc}
              alt={ceoProfile.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="max-w-md align-bottom">
            <Link
              href={ceoProfile.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 [font-family:var(--font-paraluman-heading)] text-2xl font-black uppercase tracking-tight sm:text-3xl"
            >
              <span className="bg-gradient-to-r from-[#72068c] to-[#5a0570] bg-clip-text text-transparent transition-colors">
                {ceoProfile.name}
              </span>
              <ArrowUpRight className="h-5 w-5 text-[#72068c] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
            <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-black/65 sm:text-lg">
              {ceoProfile.role}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="inline-block rounded-[0.33em] border border-[rgba(114,6,140,0.4)] bg-white px-4 py-2">
          <p className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.2em] text-[#72068c]">
            The Opportunity
          </p>
        </div>

        {hasChallengeVideo && (
          <div className="relative overflow-hidden rounded-[0.33em] border-2 border-[rgba(114,6,140,0.3)] bg-black pt-[56.25%] shadow-lg">
            <iframe
              src={challengeVideoUrl}
              title="Paraluman challenge video"
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}

        <div className="max-w-3xl rounded-[0.33em] bg-gradient-to-br from-[#72068c] via-[#5a0570] to-[#4a0460] p-8 text-white shadow-[0_24px_55px_-30px_rgba(114,6,140,0.88)]">
          <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.4rem,3vw,2rem)] font-black leading-tight text-white">
            Even though you are just an intern, you will be working with the
            impact makers of this country.
          </p>
          <p className="mt-4 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-white/85 sm:text-base">
            What you build will be used by real readers across the Philippines.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="inline-block rounded-[0.33em] border border-[rgba(114,6,140,0.4)] bg-white px-4 py-2">
          <p className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.2em] text-[#72068c]">
            FAQ
          </p>
        </div>
        <div className="rounded-[0.33em] border-2 border-[rgba(114,6,140,0.2)] bg-white px-6 py-3 shadow-[0_16px_38px_-28px_rgba(114,6,140,0.65)]">
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`faq-${index}`}
                className="border-[rgba(114,6,140,0.14)]"
              >
                <AccordionTrigger className="[font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.06em] text-[#72068c] hover:no-underline sm:text-base">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="[font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/70">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[0.33em] border-2 border-[rgba(114,6,140,0.45)] bg-gradient-to-br from-[#72068c] via-[#5a0570] to-[#4a0460] p-6 text-white shadow-[0_24px_55px_-30px_rgba(114,6,140,0.88)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,transparent_38%,rgba(255,255,255,0.06)_72%,transparent_100%)]" />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="[font-family:var(--font-paraluman-heading)] text-2xl text-white uppercase tracking-[-0.02em] sm:text-3xl">
              Be Part of Something Bigger
            </p>
          </div>
          <Button
            type="button"
            onClick={onGoToHowToApply}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-white bg-white/95 px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-[#72068c] transition-all duration-200 hover:bg-white hover:shadow-lg sm:w-auto"
          >
            How to apply?
          </Button>
        </div>
      </div>
    </div>
  );
}
