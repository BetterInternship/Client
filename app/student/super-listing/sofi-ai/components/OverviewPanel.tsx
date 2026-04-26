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
      "Students and early builders who can structure ambiguous product problems, justify interface decisions, and deliver practical frontend outputs.",
  },
  {
    question: "What is the core problem to solve?",
    answer:
      "Sofi AI builds practical AI systems, but practical AI still needs strong product interfaces. Your challenge is to turn backend intelligence into a frontend that users can understand, trust, and act on.",
  },
  {
    question: "Does this need to be a real, workable app?",
    answer:
      "Yes. The output should show a usable flow that feels like something a fast-moving AI startup could test with real users.",
  },
  {
    question: "What should the frontend include?",
    answer:
      "For the challenge, include the TikTok hook-analysis flow: input for a TikTok link, caption, script, or hook text; a results dashboard; hook score; retention risk; clarity; emotional pull; niche fit; suggested rewrites; loading, failed, and empty states.",
  },
];

const HOW_TO_APPLY_STEPS = [
  "Read the challenge brief and map the journey: input, analysis, scoring, rewrite suggestions, comparison, and next action.",
  "Build a workable frontend concept or prototype that makes AI hook analysis feel fast, trustworthy, and useful.",
  "Submit one clear link and your details. Include a short walkthrough showing how your flow turns backend analysis into better creative decisions.",
];

const INTERNSHIP_OKRS = [
  "A user can submit a TikTok link, caption, script, or hook text through one clear flow.",
  "The results view communicates hook score, retention risk, clarity, emotional pull, niche fit, and suggested rewrites.",
  "The interface includes useful states for loading, failed analysis, empty input, and original-versus-improved comparison.",
  "You can clearly explain product decisions, tradeoffs, and edge cases from a real AI product problem.",
];

function SectionTitle({ title }: SectionTitleProps) {
  return (
    <div className="space-y-1.5">
      <h2 className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.35rem,2.6vw,2rem)] font-medium tracking-[-0.03em] text-[#0D3B33]">
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
        <section className="space-y-4 border-t border-[#07C4A7]/10 pt-8 first:border-t-0 first:pt-0">
          <SectionTitle title="Internship overview" />
          <ContentCard>
            <div className="space-y-5 [font-family:var(--font-paraluman-body)] text-base leading-7 text-[#184d45] opacity-80 sm:text-lg sm:leading-8">
              <p>This internship will be like no other.</p>
              <p>
                You are going to work with a real, traction-driven AI startup
                that builds tools businesses already use and pay for.
              </p>
              <p>
                Sofi AI, also known as Sofitech AI, builds practical AI systems
                for businesses: AI assistants, customer support automation, and
                workflow tools that help teams automate customer interactions,
                streamline operations, and scale.
              </p>
              <p>
                What sets Sofi AI apart is execution. The company has{" "}
                <strong>millions of users across its platforms</strong>,
                consistent revenue generation, and recognition from global
                programs like Google for Startups and NVIDIA.
              </p>
              <p>
                It is led by Sophia Nicole Sy, a young Filipino founder known
                for building in public, being active in the Women in Tech and
                startup community, and leading a team that focuses on execution,
                not just ideas.
              </p>
              <p>
                Your challenge is one slice of that world: design the interface
                for a <strong>TikTok hook-analysis backend</strong>. The backend
                can analyze the hook, but users still need a clear product
                experience that tells them what to do next.
              </p>
              <p>
                By the end of it, you&apos;ll have a project you can show, and
                a story that proves you can turn AI capabilities into usable
                software for real users.
              </p>
              <p>
                And BTW,{" "}
                <strong>we don&apos;t look at grades or resumes.</strong> Check
                the challenge for more details.
              </p>
              <div className="space-y-4 pt-2">
                <p className="[font-family:var(--font-paraluman-heading)] text-lg font-medium tracking-[-0.02em] text-[#0D3B33] sm:text-xl">
                  Project details
                </p>
                <div className="space-y-5">
                  <p>
                    <strong>Sofi AI is a fast-growing applied AI startup.</strong>{" "}
                    The company focuses on turning AI into practical tools:
                    customer support automation, AI assistants, and workflow
                    systems that are already being used by real clients and
                    users at scale.
                  </p>
                  <p>
                    For this challenge, imagine Sofi AI has a backend that can
                    evaluate a TikTok hook. Your job is to build the frontend
                    experience around it.
                  </p>
                  <p>
                    A user should be able to submit a TikTok link, caption,
                    script, or hook text. The product should then show a clear
                    results dashboard with scoring, retention risk, clarity,
                    emotional pull, niche fit, and suggested rewrites.
                  </p>
                  <p>
                    But the most important part is the same thing Sofi AI cares
                    about across its products: practical usefulness. The
                    interface should make AI output feel specific,
                    understandable, and actionable enough that someone would
                    actually improve their hook before posting.
                  </p>
                </div>
              </div>
              <div className="rounded-[0.33em] border border-[#07C4A7]/12 bg-[linear-gradient(180deg,rgba(239,255,251,0.82)_0%,rgba(255,255,255,0.98)_100%)] px-5 py-5 sm:px-6 sm:py-6">
                <p className="[font-family:var(--font-paraluman-heading)] text-lg font-medium tracking-[-0.02em] text-[#0D3B33] sm:text-xl">
                  What Success Looks Like
                </p>
                <ul className="mt-4 space-y-3">
                  {INTERNSHIP_OKRS.map((okr) => (
                    <li key={okr} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#07C4A7]" />
                      <p className="text-base leading-7 text-[#184d45]/82 sm:text-lg sm:leading-8">
                        {okr}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ContentCard>
        </section>

        <section className="space-y-4 border-t border-[#07C4A7]/10 pt-8">
          <SectionTitle title="FAQs" />
          <ContentCard>
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem
                  key={item.question}
                  value={`faq-${index}`}
                  className="border-[#07C4A7]/12"
                >
                  <AccordionTrigger className="[font-family:var(--font-paraluman-heading)] text-left text-base font-medium tracking-[-0.02em] text-[#0D3B33] hover:no-underline sm:text-lg">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="[font-family:var(--font-paraluman-body)] text-sm leading-7 text-[#184d45] opacity-70 sm:text-base">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ContentCard>
        </section>

        <section className="space-y-4 border-t border-[#07C4A7]/10 pt-8">
          <SectionTitle title="How to apply" />
          <ContentCard className="bg-[linear-gradient(180deg,rgba(239,255,251,0.82)_0%,rgba(255,255,255,0.98)_100%)] px-5 py-5 sm:px-6 sm:py-6">
            <div className="space-y-6">
              <ol className="space-y-4">
                {HOW_TO_APPLY_STEPS.map((step, index) => (
                  <li key={step} className="flex items-start gap-4">
                    <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center border border-[#07C4A7]/16 bg-white [font-family:var(--font-paraluman-heading)] text-sm font-medium text-[#0D3B33] shadow-[0_10px_20px_-16px_rgba(13,59,51,0.5)]">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 [font-family:var(--font-paraluman-body)] text-base leading-7 text-[#184d45]/78 sm:text-lg sm:leading-8">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>

              <div className="flex flex-col gap-4 border-t border-[#07C4A7]/12 bg-white/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="[font-family:var(--font-paraluman-heading)] text-xl font-medium tracking-[-0.03em] text-[#0D3B33]">
                    Open the challenge brief when you&apos;re ready.
                  </p>
                  <p className="[font-family:var(--font-paraluman-body)] text-sm text-[#184d45]/72">
                    Focus on product clarity: input flow, result hierarchy,
                    rewrite UX, comparison states, and trust.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={onGoToChallenge}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-[#0D3B33] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-medium tracking-[-0.02em] text-white transition-all duration-200 hover:bg-[#0a2f29]"
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



