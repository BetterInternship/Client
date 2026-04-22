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
      "Students and early builders who can structure ambiguous problems, justify decisions, and deliver practical outputs.",
  },
  {
    question: "What is the core problem to solve?",
    answer:
      "Philippine Chamber of Commerce has a large member base but limited visibility into who those companies are and how they can help each other. Your solution should turn that database into a living network.",
  },
  {
    question: "Does this need to be a real, workable app?",
    answer:
      "Yes. The output should show a usable flow that companies can sign up to, complete profiles in, and use to connect with relevant members.",
  },
  {
    question: "What should the incentive model look like?",
    answer:
      "Design a points-based system that rewards useful participation and makes network actions feel worth doing.",
  },
];

const HOW_TO_APPLY_STEPS = [
  "Read the challenge brief and map how a company joins, builds profile data, and finds connections.",
  "Build a workable product flow with direct sign-up, grouped community participation, and incentive logic.",
  "Submit one clear link and your details. Include a short walkthrough of your point economy and user journey.",
];

const INTERNSHIP_OVERVIEW_PARAGRAPHS = [
  "This challenge asks you to build a usable app for the Philippine Chamber of Commerce community. The goal is to make the member database actually useful, not just a directory.",
  "Every company should have a meaningful profile, be searchable by relevant criteria, and be able to connect with other businesses in the network quickly.",
  "The system should bypass current bottlenecks by allowing companies to sign up directly and participate through clear group-based pathways.",
];

const INTERNSHIP_OKRS = [
  "A company can complete onboarding and profile setup in one clear flow.",
  "Members can discover and request introductions to relevant companies through the app.",
  "Gamification incentives increase profile completion and inquiry response behavior.",
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
                  What Success Looks Like
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
                    Focus on a complete network loop: signup, profile, discover,
                    connect, and incentives.
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
