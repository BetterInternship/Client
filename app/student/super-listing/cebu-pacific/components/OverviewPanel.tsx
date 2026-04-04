"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type OverviewPanelProps = {
  onGoToApply: () => void;
};

type SectionTitleProps = {
  title: string;
};

const WORK_STREAMS = [
  {
    title: "Improve Booking Flow",
    description:
      "Design and ship practical improvements that help passengers complete bookings with less friction.",
  },
  {
    title: "Make Check-In Simpler",
    description:
      "Build clearer and faster check-in experiences across mobile and web touchpoints.",
  },
  {
    title: "Build Ops-Friendly Tools",
    description:
      "Create simple internal-facing features that help teams support travelers at scale.",
  },
];

const BENEFITS = [
  {
    title: "Impact Real Travelers",
    description:
      "Your work touches real passenger journeys, not throwaway mock tasks.",
  },
  {
    title: "Get Tight Feedback Loops",
    description:
      "You work closely with product and engineering teams for direct, practical feedback.",
  },
  {
    title: "Build a Strong Portfolio Story",
    description:
      "Leave with a real operational challenge solved and documented end-to-end.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Who can apply for this internship?",
    answer:
      "Any builder who can execute fast and think clearly. We prioritize output and learning speed.",
  },
  {
    question: "Do I need a resume to apply?",
    answer:
      "No resume needed. Your challenge output and quality of execution matter most.",
  },
  {
    question: "What should I include in my submission link?",
    answer:
      "Share one clear link that shows your solution end-to-end (docs, demo, code, or walkthrough).",
  },
  {
    question: "How quickly will I hear back?",
    answer:
      "We aim to review quickly and send an update within 24 hours for qualified submissions.",
  },
];

function SectionTitle({ title }: SectionTitleProps) {
  return (
    <div className="space-y-2">
      <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.25rem,2.4vw,1.8rem)] font-black tracking-[-0.01em] text-[#5f4600]">
        {title}
      </p>
      <div className="h-1.5 w-20 rounded-full bg-gradient-to-r from-[#ffc100] via-[#e4af00] to-[#c89400]" />
    </div>
  );
}

export function OverviewPanel({
  onGoToApply: onGoToHowToApply,
}: OverviewPanelProps) {
  return (
    <div className="space-y-16 pt-4 sm:pt-8">
      <section className="space-y-6">
        <SectionTitle title="About Cebu Pacific" />
        <div className="relative overflow-hidden rounded-[0.33em] border border-[rgba(255,193,0,0.42)] bg-gradient-to-br from-[#ffc100] via-[#e4af00] to-[#c89400] p-6 text-black shadow-[0_24px_56px_-30px_rgba(255,193,0,0.78)] sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.2)_0%,transparent_32%,rgba(255,255,255,0.1)_58%,transparent_100%)]" />
          <div className="relative z-10 space-y-3">
            <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.4rem,3.2vw,2rem)] font-black uppercase tracking-[-0.02em] text-[#2574BB]">
              Building Better Travel Experiences
            </p>
            <p className="mt-4 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/85 sm:text-base">
              Cebu Pacific is one of the Philippines' leading airlines, focused
              on making travel more accessible for everyone. This internship
              track focuses on practical product work across booking, check-in,
              and support journeys with speed, clarity, and reliability.
            </p>
            <Button
              asChild
              className="mt-1 inline-flex h-11 items-center gap-2 rounded-[0.33em] border border-black/25 bg-black/5 px-4 [font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.1em] text-black shadow-[0_12px_26px_-18px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-all duration-200 hover:bg-black hover:text-[#ffc100]"
            >
              <Link
                href="https://www.cebupacificair.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit cebupacificair.com
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="space-y-6">
        <SectionTitle title="What you will work on" />
        <div className="rounded-[0.33em]">
          <div className="relative">
            <div className="grid gap-4 md:grid-cols-3">
              {WORK_STREAMS.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[0.33em] border border-[rgba(255,193,0,0.45)] bg-white p-5 shadow-[0_16px_30px_-22px_rgba(255,193,0,0.7)]"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase tracking-[0.01em] text-[#5f4600]">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-3 [font-family:var(--font-paraluman-mono)] text-sm leading-6 text-black/75">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle title="What you will get" />
        <div className="relative overflow-hidden rounded-[0.33em] border border-[rgba(255,193,0,0.48)] bg-gradient-to-br from-[#ffc100] via-[#e4af00] to-[#c89400] shadow-[0_20px_44px_-26px_rgba(255,193,0,0.85)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,transparent_38%,rgba(255,255,255,0.06)_72%,transparent_100%)]" />
          <div className="relative">
            <ul className="divide-y divide-black/15">
              {BENEFITS.map((item, index) => (
                <li
                  key={item.title}
                  className="flex items-start gap-4 px-4 py-4 sm:px-5 sm:py-5"
                >
                  <span className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-black/20 bg-black/10 [font-family:var(--font-paraluman-mono)] text-[11px] font-bold text-black">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="[font-family:var(--font-paraluman-heading)] text-base font-black uppercase tracking-[0.01em] text-black sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 [font-family:var(--font-paraluman-mono)] text-sm leading-6 text-black/75">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <SectionTitle title="FAQs" />
        <div className="rounded-[0.33em] border-2 border-[rgba(255,193,0,0.35)] bg-white px-6 py-3 shadow-[0_16px_38px_-28px_rgba(255,193,0,0.7)]">
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`faq-${index}`}
                className="border-[rgba(255,193,0,0.26)]"
              >
                <AccordionTrigger className="[font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.06em] text-[#6b5000] hover:no-underline sm:text-base">
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

      <div className="relative overflow-hidden rounded-[0.33em] border-2 border-[rgba(255,193,0,0.5)] bg-gradient-to-br from-[#ffc100] via-[#e4af00] to-[#c89400] p-6 text-black shadow-[0_24px_55px_-30px_rgba(255,193,0,0.88)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,transparent_38%,rgba(255,255,255,0.06)_72%,transparent_100%)]" />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="">
            <p className="[font-family:var(--font-paraluman-heading)] text-2xl text-[#2574BB] uppercase tracking-[-0.02em] sm:text-3xl">
              Up for the challenge?
            </p>
            <p className="[font-family:var(--font-paraluman-mono)] text-[10px] leading-tight text-black/75 sm:text-[11px]">
              No resume needed. Response in 24 hours
            </p>
          </div>
          <div className="w-full sm:w-auto sm:text-right">
            <Button
              type="button"
              onClick={onGoToHowToApply}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#2574BB] bg-[#2574BB] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:bg-[#1c5a92] hover:shadow-lg sm:w-auto"
            >
              Start challenge
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
