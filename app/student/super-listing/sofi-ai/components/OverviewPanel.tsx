"use client";

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

export function OverviewPanel({
  onGoToApply: onGoToChallenge,
}: OverviewPanelProps) {
  return (
    <div className="[font-family:var(--font-paraluman-body)] text-sm leading-8 text-[#184d45]/86 sm:text-[0.95rem]">
      <section className="space-y-5">
        <h1 className="[font-family:var(--font-paraluman-heading)] text-2xl font-bold leading-tight tracking-[-0.035em] text-[#052338] sm:text-[1.7rem]">
          Build product interfaces for AI tools businesses actually use.
        </h1>
        <div className="space-y-4">
          <p>
            This internship is for builders who want to work inside a real,
            traction-driven AI startup, not a simulated school project.
          </p>
          <p>
            Sofi AI builds practical AI systems for businesses: AI assistants,
            customer support automation, and workflow tools that help teams
            automate customer interactions, streamline operations, and scale.
          </p>
          <p>
            Your challenge is one slice of that world: design the interface for
            a <strong>TikTok hook-analysis backend</strong>. The backend can
            analyze the hook, but users still need a clear product experience
            that tells them what to do next.
          </p>
          <p>
            <strong>We do not look at grades or resumes.</strong> The
            challenge-first format helps Sofi AI evaluate product taste,
            interface judgment, and execution better than resume-only screening.
          </p>
        </div>
      </section>

      <section className="mt-9 space-y-4 border-t border-[#052338]/10 pt-8">
        <SectionTitle>What you&apos;ll do</SectionTitle>
        <AsteriskList
          items={[
            "Turn AI analysis into clear, useful frontend flows.",
            "Design the input, loading, results, scoring, rewrite, and comparison states.",
            "Make AI feedback feel specific, trustworthy, and actionable for creators or business teams.",
          ]}
        />
      </section>

      <section className="mt-9 space-y-4 border-t border-[#052338]/10 pt-8">
        <SectionTitle>What success looks like</SectionTitle>
        <AsteriskList items={INTERNSHIP_OKRS} />
      </section>

      <section className="mt-9 space-y-4 border-t border-[#052338]/10 pt-8">
        <SectionTitle>How to apply</SectionTitle>
        <AsteriskList items={HOW_TO_APPLY_STEPS} />
        <div className="pt-2">
          <Button
            type="button"
            onClick={onGoToChallenge}
            className="h-11 rounded-md bg-[#052338] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold text-white hover:bg-[#0D3B33]"
          >
            View challenge
          </Button>
        </div>
      </section>

      <section className="mt-9 border-l border-[#00A886]/30 pl-4 italic text-[#184d45]/68">
        Note: This role will not be for everyone. But for the right person, this
        could be the best internship experience you&apos;ll get.
      </section>

      <section className="mt-9 space-y-2 border-t border-[#052338]/10 pt-8">
        <SectionTitle>FAQs</SectionTitle>
        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`faq-${index}`}
              className="border-[#052338]/10"
            >
              <AccordionTrigger className="[font-family:var(--font-paraluman-heading)] text-left text-sm font-bold tracking-[-0.025em] text-[#052338] hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="[font-family:var(--font-paraluman-body)] text-sm leading-8 text-[#184d45]/78">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
