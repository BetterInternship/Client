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
  textClassName?: string;
};

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

const HOW_TO_APPLY_STEPS = [
  "Open the challenge brief and review the task.",
  "Build your solution and upload it in one clear link.",
  "Submit your link and details. We respond within 24 hours.",
];

function SectionTitle({ title, textClassName }: SectionTitleProps) {
  return (
    <div className="w-full">
      <div className="flex items-stretch gap-2.5">
        <span
          aria-hidden="true"
          className="w-[0.3em] shrink-0 bg-[#2574BB] h-[2em] my-auto opacity-50"
        />
        <p
          className={`text-left [font-family:var(--font-paraluman-heading)] text-[clamp(1.25rem,2.4vw,1.8rem)] font-black tracking-[-0.01em] ${textClassName ?? "text-[#1f68a9]"}`}
        >
          {title}
        </p>
      </div>
    </div>
  );
}

export function OverviewPanel({
  onGoToApply: onGoToHowToApply,
}: OverviewPanelProps) {
  return (
    <div className="space-y-16 pt-4 sm:pt-8">
      <section className="space-y-2">
        <SectionTitle title="About Cebu Pacific" />
        <div className="relative w-full overflow-hidden rounded-[0.33em] border border-[rgba(37,116,187,0.4)] bg-[#edf6ff] p-6 text-[#173957] shadow-[0_24px_56px_-30px_rgba(37,116,187,0.45)] sm:p-8">
          <div className="relative z-10 space-y-3">
            <div className="space-y-8 [font-family:var(--font-paraluman-body)] text-lg leading-8 text-[#173957]/95 sm:text-xl">
              <p className="text-lg leading-8 text-[#173957]/95 sm:text-xl">
                We are the leading airline in the Philippines, operating flights
                to over 60 destinations across 14 countries.
              </p>
              <p className="text-lg leading-8 text-[#173957]/95 sm:text-xl">
                But even as a leading airline, we know we can still be better.
              </p>
              <p className="[font-family:var(--font-paraluman-heading)] text-2xl font-black leading-tight tracking-[-0.02em] text-[#1f68a9]">
                That&apos;s where you come in.
              </p>
            </div>
            <Button
              asChild
              className="mt-1 inline-flex h-11 items-center gap-2 rounded-[0.33em] border border-[#2574BB]/30 bg-white/60 px-4 [font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.1em] text-[#1f68a9] shadow-[0_12px_26px_-18px_rgba(37,116,187,0.35)] backdrop-blur-sm transition-all duration-200 hover:bg-[#2574BB] hover:text-white"
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
      <section className="space-y-2">
        <SectionTitle title="What you will work on" />
        <div className="relative w-full overflow-hidden rounded-[0.33em] border border-[#2574BB]/35 bg-[#edf6ff] p-6 text-[#173957] shadow-[0_20px_38px_-26px_rgba(37,116,187,0.35)] sm:p-8">
          <div className="relative z-10 space-y-5">
            <div className="space-y-8 [font-family:var(--font-paraluman-body)] text-lg leading-8 text-[#153a5b]/92 sm:text-xl">
              <p className="text-lg font-semibold leading-8 text-[#153a5b] sm:text-xl">
                For this internship, we are not assigning roles upfront.
              </p>
              <p className="text-lg leading-8 text-[#153a5b]/92 sm:text-xl">
                <span className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase tracking-[0.06em] text-[#2574BB] sm:text-xl">
                  Why?
                </span>{" "}
                We&apos;re not looking for someone to follow instructions.
                We&apos;re looking for someone who can solve problems with their
                own initiative.
              </p>
              <p className="text-lg leading-8 text-[#153a5b]/92 sm:text-xl">
                Once you pass the challenge, we&apos;ll see what you&apos;re
                capable of first, then we&apos;ll give you projects based on
                your talents and strengths.
              </p>

              <p className="[font-family:var(--font-paraluman-heading)] text-2xl font-black leading-tight tracking-[-0.02em] text-[#1f68a9]">
                If you get in, you&apos;re here to build <br />
                and to make flying better for Every Juan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <SectionTitle title="What you will get" />
        <div className="relative w-full overflow-hidden rounded-[0.33em] border border-[#2574BB]/40 bg-[#edf6ff] p-6 text-[#173957] shadow-[0_26px_48px_-30px_rgba(37,116,187,0.46)] sm:p-8">
          <div className="relative z-10 space-y-8 [font-family:var(--font-paraluman-body)] text-lg leading-8 text-[#173957]/95 sm:text-xl">
            <p className="text-lg leading-8 sm:text-xl">
              What you build may be used by millions of Filipinos, including
              your family and friends.
            </p>
            <p className="text-lg leading-8 sm:text-xl">
              In most internships, you do grunt work. Here, you make changes
              that could impact a top airline in our country.
            </p>
            <p className="[font-family:var(--font-paraluman-heading)] text-2xl font-black leading-tight tracking-[-0.02em] text-[#1f68a9]">
              You walk away with a story <br />
              that makes people stop and listen.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <SectionTitle title="How to apply" />
        <div className="relative w-full overflow-hidden rounded-[0.33em] border border-[#9b8955]/20 bg-[#f6eccf] p-6 text-[#173957] shadow-[0_26px_48px_-30px_rgba(37,116,187,0.46)] sm:p-8">
          <div className="relative z-10 space-y-5">
            <ol className="mx-auto w-full">
              {HOW_TO_APPLY_STEPS.map((step, index) => (
                <li
                  key={step}
                  className="relative flex items-start gap-4 pb-5 pl-1"
                >
                  {index < HOW_TO_APPLY_STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute left-[0.98rem] top-8 h-[calc(100%-0.25rem)] w-px bg-[#2574BB]/30"
                    />
                  )}
                  <span className="relative z-10 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#2574BB]/25 bg-white [font-family:var(--font-paraluman-heading)] text-xs font-black uppercase tracking-[0.03em] text-[#1f68a9] shadow-[0_8px_18px_-14px_rgba(37,116,187,0.7)]">
                    {index + 1}
                  </span>
                  <p className="pt-0.5 [font-family:var(--font-paraluman-body)] text-lg leading-8 text-[#153a5b]/92 sm:text-xl">
                    {step}
                  </p>
                </li>
              ))}
            </ol>

            <div className="flex w-full flex-col gap-3 rounded-[0.33em] border border-[#2574BB]/22 bg-white/75 px-4 py-3.5 shadow-[0_12px_24px_-22px_rgba(37,116,187,0.55)] sm:flex-row sm:items-center sm:justify-between">
              <p className="[font-family:var(--font-paraluman-body)] text-lg font-semibold leading-8 text-[#153a5b]/95 sm:text-xl">
                No resume needed. 24h response.
              </p>
              <Button
                type="button"
                onClick={onGoToHowToApply}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#d8c17b] bg-[#ecd389] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-[#173957] transition-all duration-200 hover:bg-[#e2c36b] hover:shadow-[0_12px_26px_-14px_rgba(236,211,137,0.9)] sm:w-auto"
              >
                View challenge
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-2">
        <SectionTitle title="FAQs" />
        <div className="w-full rounded-[0.33em] border-2 border-[#2574BB]/30 bg-white px-6 py-3 shadow-[0_16px_38px_-28px_rgba(37,116,187,0.5)]">
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`faq-${index}`}
                className="border-[#2574BB]/20"
              >
                <AccordionTrigger className="[font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.06em] text-[#1f68a9] hover:no-underline sm:text-lg">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="[font-family:var(--font-paraluman-body)] text-lg leading-8 text-black/70 sm:text-xl">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-[0.33em] border-2 border-[#2574BB]/38 bg-[#edf6ff] p-6 text-[#173957] shadow-[0_24px_55px_-30px_rgba(37,116,187,0.62)] sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="">
            <p className="[font-family:var(--font-paraluman-heading)] text-2xl text-[#1f68a9] uppercase tracking-[-0.02em] sm:text-3xl font-black">
              Up for the challenge?
            </p>
            <p className="[font-family:var(--font-paraluman-body)] leading-tight text-[#1d466f]/80 sm:text-xs">
              No resume needed. Response in 24 hours
            </p>
          </div>
          <div className="w-full sm:w-auto sm:text-right">
            <Button
              type="button"
              onClick={onGoToHowToApply}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#d8c17b] bg-[#ecd389] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-[#173957] transition-all duration-200 hover:bg-[#e2c36b] hover:shadow-[0_12px_26px_-14px_rgba(236,211,137,0.9)] sm:w-auto"
            >
              View challenge
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
