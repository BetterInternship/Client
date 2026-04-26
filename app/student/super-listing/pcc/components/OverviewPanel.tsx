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
      "PCC has scale but weak network activation. Member data is scattered, company strengths are not easy to surface, and routing introductions still depends on slow manual coordination. Your solution should turn that into a usable operating system for member connections.",
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
  "Read the challenge brief and map where the current member journey breaks: onboarding delays, weak profile completeness, and slow partner discovery.",
  "Build a workable flow with direct sign-up, structured profile capture, grouped participation, and incentive logic that improves response behavior.",
  "Submit one clear link and your details. Include a short walkthrough showing how your flow reduces friction from signup to introduction.",
];

const INTERNSHIP_OKRS = [
  "A company can complete onboarding and profile setup quickly in one clear flow.",
  "Members can identify and request relevant introductions without slow manual routing.",
  "Incentives increase profile completeness and improve inquiry response consistency.",
  "You can clearly explain business impact, product decisions, and tradeoffs from a real organizational problem, not a simulated exercise.",
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
              <p>This internship will be like no other.</p>
              <p>
                You are going to build a platform that will solve{" "}
                <strong>one of PCCI&apos;s biggest problems</strong>.
              </p>
              <p>
                It&apos;s like LinkedIn, but localized for Philippine
                businesses. Your initial users will be us, PCCI, the{" "}
                <strong>
                  largest business organisation in the Philippines with 80,000
                  member companies.
                </strong>
              </p>
              <p>
                And yes, this sounds like too big of a project to give to an
                intern, but we&apos;re doing it anyway.
              </p>
              <p>
                Most internships give you grunt work. Here, you&apos;ll be
                given a lot of resources, freedom, and mentorship to bring this
                dream to reality. You&apos;ll be given tasks that you are not
                qualified to do, but that means{" "}
                <strong>you&apos;ll grow faster</strong>.
              </p>
              <p>
                This project is the perfect opportunity to give you industry
                exposure. Not only are you shipping a solution to a live problem
                that involves real business owners, but you are also placed
                within close proximity to the businesses involved.
              </p>
              <p>
                By the end of it, you&apos;ll have a project you can show, and
                a story that will make any employer want to hire you.
              </p>
              <p>
                And BTW,{" "}
                <strong>we don&apos;t look at grades or resumes.</strong> Check
                the challenge for more details.
              </p>
              <div className="space-y-4 pt-2">
                <p className="[font-family:var(--font-paraluman-heading)] text-lg font-medium tracking-[-0.02em] text-[#173f69] sm:text-xl">
                  Project details
                </p>
                <div className="space-y-5">
                  <p>
                    <strong>PCCI has 80,000 businesses in its network.</strong>{" "}
                    But it&apos;s hard for these businesses to talk to each
                    other.
                  </p>
                  <p>
                    Businesses like these usually try to connect with each other
                    to find the best partnerships that optimize their line of
                    work.
                  </p>
                  <p>
                    But in a sea of thousands of members with no centralized
                    contact list, it&apos;s almost impossible for businesses to
                    find each other in this community.
                  </p>
                  <p>
                    This internship involves working closely with members of
                    PCCI and their data. The goal is to create a platform that
                    makes it easier for businesses to find each other, and to
                    network when they do.
                  </p>
                  <p>
                    But most important of all,{" "}
                    <strong>
                      the platform should incentivize businesses to connect.
                    </strong>{" "}
                    Sometimes, businesses within PCCI aren&apos;t even held
                    back by the lack of a platform: some businesses just prefer
                    not to respond to requests because they&apos;re used to
                    their usual sets of connections and don&apos;t bother
                    looking for more.
                  </p>
                </div>
              </div>
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
                    Focus on solving PCC's full friction loop: signup, profile
                    quality, discoverability, connection routing, and
                    incentives.
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
