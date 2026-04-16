"use client";

import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type OverviewPanelProps = {
  onGoToApply: () => void;
};

type SectionTitleProps = {
  title: string;
};

const FAQ_ITEMS = [
  {
    question: "Who can apply for this internship?",
    answer:
      "Any builder who can execute fast, think clearly, and finish what they start. We care more about output and judgment than polish on paper.",
  },
  {
    question: "Do I need a resume to apply?",
    answer:
      "No. Cebu Pacific wants to see how you solve a real problem through the challenge, not how well you package yourself in a PDF.",
  },
  {
    question: "What should I prepare before opening the challenge tab?",
    answer:
      "You should be ready to inspect Cebu Pacific's product experience closely, identify one real pain point, and explain why your chosen problem matters.",
  },
  {
    question: "How quickly will I hear back?",
    answer:
      "Qualified submissions are reviewed quickly, with a response within 24 hours.",
  },
];

const HOW_TO_APPLY_STEPS = [
  "Read the challenge brief carefully and pick one problem worth solving.",
  "Build a working prototype that improves the Cebu Pacific experience.",
  "Submit one clear link and your details. Cebu Pacific responds within 24 hours.",
];

const INTERNSHIP_OVERVIEW_PARAGRAPHS = [
  "This internship is outcome-driven. Your job is to improve Cebu Pacific's booking experience in ways that are measurable, not just visually polished.",
  "You will identify high-friction moments in the booking journey, propose practical product and UX improvements, then ship and validate a working solution.",
];

const INTERNSHIP_OKRS = [
  "80% of first-time users complete a booking in 60 seconds or less.",
  "Reduce booking-related complaints and support tickets by 50%.",
  'At least 90% of users rate the booking experience as "easy" or "very easy."',
];

function SectionTitle({ title }: SectionTitleProps) {
  return (
    <div className="space-y-1.5">
      <h2 className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.35rem,2.6vw,2rem)] font-medium tracking-[-0.03em] text-[#173f69]">
        {title}
      </h2>
    </div>
  );
}

function ContentCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("p-0", className)}>{children}</div>;
}

export function OverviewPanel({
  onGoToApply: onGoToChallenge,
}: OverviewPanelProps) {
  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="space-y-8 sm:space-y-10">
        <section className="space-y-4 border-t border-[#2574BB]/10 pt-8 first:border-t-0 first:pt-0">
          <SectionTitle title="Internship overview" />
          <ContentCard>
            <div className="space-y-5 [font-family:var(--font-paraluman-body)] text-base leading-7 text-[#173957] opacity-80 sm:text-lg sm:leading-8">
              {INTERNSHIP_OVERVIEW_PARAGRAPHS.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <div className="rounded-[0.33em] border border-[#2574BB]/12 bg-[linear-gradient(180deg,rgba(239,246,255,0.82)_0%,rgba(255,255,255,0.98)_100%)] px-5 py-5 sm:px-6 sm:py-6">
                <p className="[font-family:var(--font-paraluman-heading)] text-lg font-medium tracking-[-0.02em] text-[#173f69] sm:text-xl">
                  Internship OKRs
                </p>
                <ul className="mt-4 space-y-3">
                  {INTERNSHIP_OKRS.map((okr) => (
                    <li key={okr} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#2574BB]" />
                      <p className="text-base leading-7 text-[#173957]/82 sm:text-lg sm:leading-8">
                        {okr}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ContentCard>
        </section>

        <section className="space-y-4 border-t border-[#2574BB]/10 pt-8">
          <SectionTitle title="FAQs" />
          <ContentCard>
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem
                  key={item.question}
                  value={`faq-${index}`}
                  className="border-[#2574BB]/12"
                >
                  <AccordionTrigger className="[font-family:var(--font-paraluman-heading)] text-left text-base font-medium tracking-[-0.02em] text-[#173f69] hover:no-underline sm:text-lg">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="[font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#173957] opacity-70 sm:text-base">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ContentCard>
        </section>

        <section className="space-y-4 border-t border-[#2574BB]/10 pt-8">
          <SectionTitle title="How to apply" />
          <ContentCard className="bg-[linear-gradient(180deg,rgba(239,246,255,0.82)_0%,rgba(255,255,255,0.98)_100%)] px-5 py-5 sm:px-6 sm:py-6">
            <div className="space-y-6">
              <ol className="space-y-4">
                {HOW_TO_APPLY_STEPS.map((step, index) => (
                  <li key={step} className="flex items-start gap-4">
                    <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center border border-[#2574BB]/16 bg-white [font-family:var(--font-paraluman-heading)] text-sm font-medium text-[#173f69] shadow-[0_10px_20px_-16px_rgba(23,63,105,0.5)]">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 [font-family:var(--font-paraluman-body)] text-base leading-7 text-[#173957]/78 sm:text-lg sm:leading-8">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>

              <div className="flex flex-col gap-4 border-t border-[#2574BB]/12 bg-white/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="[font-family:var(--font-paraluman-heading)] text-xl font-medium tracking-[-0.03em] text-[#173f69]">
                    Open the challenge brief when you&apos;re ready.
                  </p>
                  <p className="[font-family:var(--font-paraluman-body)] text-sm text-[#173957]/72">
                    Review the prompt, then come back to submit a working
                    output.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={onGoToChallenge}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-[#173f69] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-medium tracking-[-0.02em] text-white transition-all duration-200 hover:bg-[#123456]"
                >
                  View challenge
                </Button>
              </div>
            </div>
          </ContentCard>
        </section>
      </div>
    </div>
  );
}
