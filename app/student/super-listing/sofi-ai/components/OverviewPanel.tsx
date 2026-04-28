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
      "Anyone who can think clearly about product design, user flow, and interface execution. We care more about your challenge output than your grades or credentials.",
  },
  {
    question: "Do I need to build a fully functional product?",
    answer:
      "No. The challenge should show a clear product experience and logical user journey. It can be a prototype, deployed concept, or working interface as long as you can explain your decisions.",
  },
  {
    question: "What kind of work will I do if selected?",
    answer:
      "You will help design products that Sofi AI is actively preparing to launch, working around user flows, wireframes, product interfaces, and AI-powered product experiences.",
  },
  {
    question: "What makes a strong submission?",
    answer:
      "Strong submissions show thoughtful decision-making, clear design execution, and strong communication. We want to understand how you think, not just what the final screens look like.",
  },
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
          Design products that will actually get launched.
        </h1>
        <div className="space-y-4">
          <p>
            This is not a typical UI/UX internship. You will be leading the
            design of products that we are actively preparing to launch.
          </p>
          <p>
            We already have a solid backend engineering team. And right now, we
            are looking for someone who can bring the product to life through
            design, user flow, and experience.
          </p>
          <p>
            If you do well, there are many more projects lined up... and
            potentially a full-time role.
          </p>
        </div>
      </section>

      <section className="mt-9 space-y-4 border-t border-[#052338]/10 pt-8">
        <SectionTitle>What you&apos;ll do</SectionTitle>
        <AsteriskList
          items={[
            "Design products that will be launched.",
            "Create user flows, wireframes, and product interfaces.",
            "Work closely with a team focused on AI and product development.",
          ]}
        />
      </section>

      <section className="mt-9 space-y-4 border-t border-[#052338]/10 pt-8">
        <SectionTitle>What&apos;s special</SectionTitle>
        <AsteriskList
          items={[
            "You'll have real responsibility from day one.",
            "Your work will have real users.",
            "You'll experience how a Filipino AI tech startup operates.",
          ]}
        />
      </section>

      <section className="mt-9 space-y-4 border-t border-[#052338]/10 pt-8">
        <SectionTitle>This is for you if</SectionTitle>
        <AsteriskList
          items={[
            "You want to be pushed and challenged.",
            "You enjoy working in a fast-paced startup environment.",
            "You're okay with high responsibility and fast growth.",
            "You genuinely love design and building products.",
            "You are resilient and willing to learn from mistakes.",
          ]}
        />
      </section>

      <section className="mt-9 space-y-4 border-t border-[#052338]/10 pt-8">
        <SectionTitle>Qualifications</SectionTitle>
        <div className="space-y-4">
          <p className="[font-family:var(--font-paraluman-heading)] text-xl font-bold tracking-[-0.035em] text-[#052338]">
            None.
          </p>
          <p>
            We don&apos;t care about grades or credentials. We want to see if
            you can do real work. Complete the challenge and show us what you
            can do.
          </p>
        </div>
      </section>

      <section className="mt-9 border-l border-[#00A886]/30 pl-4 italic text-[#184d45]/68">
        Note: This role won&apos;t be for everyone. But for the right person,
        this could be the best internship experience you&apos;ll get.
      </section>

      <div className="mt-9 pt-2">
        <Button
          type="button"
          onClick={onGoToChallenge}
          className="h-11 rounded-md bg-[#052338] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold text-white hover:bg-[#0D3B33]"
        >
          View challenge
        </Button>
      </div>
    </div>
  );
}
