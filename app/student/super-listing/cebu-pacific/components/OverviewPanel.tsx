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

function SectionTitle({ title, textClassName }: SectionTitleProps) {
  return (
    <div className="space-y-2">
      <p
        className={`[font-family:var(--font-paraluman-heading)] text-[clamp(1.25rem,2.4vw,1.8rem)] font-black tracking-[-0.01em] ${textClassName ?? "text-[#1f68a9]"}`}
      >
        {title}
      </p>
      <div className="h-1.5 w-20 rounded-full bg-[#2574BB]" />
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
        <div className="relative overflow-hidden rounded-[0.33em] border border-[rgba(37,116,187,0.4)] bg-[#edf6ff] p-6 text-[#173957] shadow-[0_24px_56px_-30px_rgba(37,116,187,0.45)] sm:p-8">
          <div className="relative z-10 space-y-3">
            <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.4rem,3.2vw,2rem)] font-black tracking-[-0.02em] text-[#1f68a9]">
              Let&apos;s fly every Juan.
            </p>
            <div className="mt-4 space-y-3 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-[#173957]/95 sm:text-base">
              <p className="text-[#173957]/95">
                We are the leading airline in the Philippines, operating flights
                to over 60 domestic and international destinations across 14
                countries.
              </p>
              <p className="text-[#173957]/95">
                But even as a leading airline, we know we can still be better.
              </p>
              <p className="[font-family:var(--font-paraluman-heading)] text-xl font-black leading-tight tracking-[-0.02em] text-[#1f68a9]">
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
      <section className="space-y-6">
        <SectionTitle title="What you will work on" />
        <div className="relative overflow-hidden rounded-[0.33em] border border-[#2574BB]/35 bg-[#edf6ff] p-6 text-[#173957] shadow-[0_20px_38px_-26px_rgba(37,116,187,0.35)] sm:p-8">
          <div className="relative z-10 space-y-5">
            <div className="space-y-4 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-[#153a5b]/92 sm:text-base">
              <p className="text-base font-semibold leading-7 text-[#153a5b] sm:text-lg">
                For this internship, we are not assigning roles upfront.
              </p>
              <p className="text-[#153a5b]/92">
                <span className="[font-family:var(--font-paraluman-heading)] text-base font-black uppercase tracking-[0.06em] text-[#2574BB] sm:text-lg">
                  Why?
                </span>{" "}
                Because we&apos;re not looking for someone to follow
                instructions. We&apos;re looking for someone who will go through
                their own initiatives to fix problems.
              </p>
              <p className="text-[#153a5b]/92">
                Once you pass the challenge, we&apos;ll see what you&apos;re
                capable of first, then we&apos;ll give you projects based on
                your talents and strengths.
              </p>
              <p className="text-[#153a5b]/92">
                Our plan is to let you work on real user problems - our website,
                app, systems, and maybe even the actual experience of flying.
              </p>
            </div>
            <p className="[font-family:var(--font-paraluman-heading)] text-2xl font-black leading-tight tracking-[-0.02em] text-[#0f3f67] sm:text-3xl">
              If you get in, you&apos;re here to build <br />
              and to make flying better for Every Juan.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle title="What you will get" />
        <div className="relative overflow-hidden rounded-[0.33em] border border-[#2574BB]/40 bg-[#edf6ff] p-6 text-[#173957] shadow-[0_26px_48px_-30px_rgba(37,116,187,0.46)] sm:p-8">
          <div className="relative z-10 space-y-4 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-[#173957]/95 sm:text-base">
            <p>
              What you build may be used by millions of Filipinos, including
              your family and friends.
            </p>
            <p>
              In most internships, you do grunt work. Here, you make changes
              that could impact a top airline in our country.
            </p>
            <p className="[font-family:var(--font-paraluman-heading)] text-2xl font-black leading-tight tracking-[-0.02em] text-[#1f68a9] sm:text-3xl">
              You walk away with a story that makes people stop and listen.
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <SectionTitle title="FAQs" />
        <div className="rounded-[0.33em] border-2 border-[#2574BB]/30 bg-white px-6 py-3 shadow-[0_16px_38px_-28px_rgba(37,116,187,0.5)]">
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`faq-${index}`}
                className="border-[#2574BB]/20"
              >
                <AccordionTrigger className="[font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.06em] text-[#1f68a9] hover:no-underline sm:text-base">
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

      <div className="relative overflow-hidden rounded-[0.33em] border-2 border-[#2574BB]/38 bg-[#edf6ff] p-6 text-[#173957] shadow-[0_24px_55px_-30px_rgba(37,116,187,0.62)] sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="">
            <p className="[font-family:var(--font-paraluman-heading)] text-2xl text-[#1f68a9] uppercase tracking-[-0.02em] sm:text-3xl font-black">
              Up for the challenge?
            </p>
            <p className="[font-family:var(--font-paraluman-mono)] text-[10px] leading-tight text-[#1d466f]/80 sm:text-[11px]">
              No resume needed. Response in 24 hours
            </p>
          </div>
          <div className="w-full sm:w-auto sm:text-right">
            <Button
              type="button"
              onClick={onGoToHowToApply}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#d8c17b] bg-[#ecd389] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-[#173957] transition-all duration-200 hover:bg-[#e2c36b] hover:shadow-[0_12px_26px_-14px_rgba(236,211,137,0.9)] sm:w-auto"
            >
              Start challenge
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
