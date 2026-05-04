"use client";

import { Button } from "@/components/ui/button";

type OverviewPanelProps = {
  onGoToApply: () => void;
};

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="[font-family:var(--font-paraluman-heading)] text-base font-bold tracking-[-0.025em] text-[#052338] text-xl">
      {children}
    </h2>
  );
}

function AsteriskList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span className="mt-0.5 shrink-0 [font-family:var(--font-paraluman-mono)] text-sm font-semibold leading-6 text-[#00A886]">
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
    <div className="[font-family:var(--font-paraluman-body)] text-sm leading-6 text-[#184d45]/86 sm:text-[0.9rem] space-y-5">
      <section className="space-y-3.5">
        <h1 className="[font-family:var(--font-paraluman-heading)] text-[1.45rem] font-bold leading-tight tracking-[-0.035em] text-[#052338] sm:text-[1.55rem]">
          Lead the marketing of AI products.
        </h1>
        <div className="space-y-3">
          <p>
            This is not a typical marketing internship. You will be leading the
            marketing of products that we are actively preparing to launch.
          </p>
          <p>
            We already have a solid product and engineering team. And right now,
            we are looking for someone who can bring GIA to the world through
            content and storytelling.
          </p>
          <p>
            If you do well, there are many more projects lined up... and
            potentially a full-time role!
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle>What you'll do</SectionTitle>
        <AsteriskList
          items={[
            "Market GIA to TikTok creators in the Philippines.",
            "Build campaigns, content, and marketing strategies that drive awareness.",
            "Work closely with a team focused on AI and product development.",
          ]}
        />
      </section>

      <section className="space-y-3">
        <SectionTitle>What&apos;s special</SectionTitle>
        <AsteriskList
          items={[
            "You'll have real responsibility from day one.",
            "Your work will affect real businesses.",
            "You'll experience how a Filipino AI tech startup operates.",
          ]}
        />
      </section>

      <section className="space-y-3">
        <SectionTitle>This is for you if</SectionTitle>
        <AsteriskList
          items={[
            "Girly pop 💅",
            "Is chronically online on TikTok and knows trends.",
            "You love consuming, analyzing content, and creating content.",
            "Can do simple TikTok edits and carousels. (canvas lang yan 😉)",
          ]}
        />
      </section>

      <section className="space-y-3">
        <SectionTitle>Qualifications</SectionTitle>
        <div className="space-y-3">
          <p className="[font-family:var(--font-paraluman-heading)] text-lg font-bold tracking-[-0.035em] text-[#052338]">
            None.
          </p>
          <p>
            We don&apos;t care about grades or credentials. We want to see if
            you can do real work. Complete the challenge and show us what you
            can do.
          </p>
        </div>
      </section>

      <section className="mt-7 border-l border-[#00A886]/30 pl-4 italic text-[#184d45]/68">
        Note: This role won&apos;t be for everyone. But for the right person,
        this could be the best internship experience you&apos;ll get.
      </section>

      <div className="mt-7 pt-1">
        <Button
          type="button"
          onClick={onGoToChallenge}
          className="h-11 rounded-md bg-[#052338] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold text-white hover:bg-[#0D3B33]"
        >
          I want a chance!
        </Button>
      </div>
    </div>
  );
}
