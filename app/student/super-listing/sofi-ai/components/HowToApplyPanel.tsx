type HowToApplyPanelProps = {
  onGoToApply: () => void;
};

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

export function HowToApplyPanel({
  onGoToApply,
}: HowToApplyPanelProps) {
  return (
    <div className="[font-family:var(--font-paraluman-body)] text-sm leading-8 text-[#184d45]/86 sm:text-[0.95rem]">
      <section className="space-y-5">
        <h1 className="[font-family:var(--font-paraluman-heading)] text-2xl font-bold leading-tight tracking-[-0.035em] text-[#052338] sm:text-[1.7rem]">
          Application Process
        </h1>
        <p>
          We&apos;re doing this differently. Instead of resumes, we want to see
          how you actually think and build.
        </p>
      </section>

      <section className="mt-9 space-y-4 border-t border-[#052338]/10 pt-8">
        <SectionTitle>The Challenge</SectionTitle>
        <p>
          You&apos;ll design a new product that we&apos;re planning to release.
          We already have the product vision, backend, and core strategy. Your
          role is to:
        </p>
        <AsteriskList
          items={[
            "Bring it to life through design.",
            "Create a clear user flow.",
            "Translate the idea into a working interface.",
          ]}
        />
        <p>
          This does not need to be a fully functional product. What matters is
          your ability to create a clear, thoughtful vision, and to make us
          understand how it should look.
        </p>
        <p>
          We&apos;ll give you direction. How you execute is up to you. You are
          given the freedom to shape the user journey, make product and design
          decisions, and define how the experience should feel. Use any tools
          you want, including AI, references, or your own workflow.
        </p>
      </section>

      <section className="mt-9 space-y-4 border-t border-[#052338]/10 pt-8">
        <SectionTitle>The Product</SectionTitle>
        <div className="space-y-4">
          <div>
            <p className="[font-family:var(--font-paraluman-heading)] text-2xl font-bold tracking-[-0.035em] text-[#052338]">
              GIA
            </p>
            <p className="[font-family:var(--font-paraluman-mono)] text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#00A886]">
              Generative Influencer Analyst
            </p>
          </div>
          <p>
            GIA is a web-based analytics platform powered by SOFI AI. She helps
            TikTok creators understand their content in a simple, human way
            without needing to be technical.
          </p>
          <p>
            You feed her your profile link. She gives you back a readable report
            with hook scores, audience signals, sentiment analysis, and
            suggestions on what to post next.
          </p>
        </div>
      </section>

      <section className="mt-9 space-y-4 border-t border-[#052338]/10 pt-8">
        <SectionTitle>Who it&apos;s for</SectionTitle>
        <p>
          TikTok creators in the Philippines who don&apos;t speak fluent
          analytics: people who see their metrics but don&apos;t fully
          understand them.
        </p>
      </section>

      <section className="mt-9 space-y-4 border-t border-[#052338]/10 pt-8">
        <SectionTitle>What makes it different</SectionTitle>
        <AsteriskList
          items={[
            "Reads comments, not just views. Surfaces what the audience is actually asking for.",
            "Scores hooks on a 10-point scale and tells you why.",
            "Outputs a shareable PDF report, not a dashboard you have to interpret.",
            "Conversational tone. GIA talks like a friend with receipts.",
          ]}
        />
      </section>

      <section className="mt-9 space-y-4 border-t border-[#052338]/10 pt-8">
        <SectionTitle>How we&apos;ll evaluate</SectionTitle>
        <div className="space-y-4">
          <p>
            <strong className="text-[#052338]">1. Thinking:</strong> How you
            approach the problem and make decisions.
          </p>
          <p>
            <strong className="text-[#052338]">2. Design:</strong> Clarity,
            usability, and overall execution.
          </p>
          <p>
            <strong className="text-[#052338]">3. Communication:</strong> How
            well you explain your work and ideas.
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={onGoToApply}
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#052338] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold text-white transition-all duration-200 hover:bg-[#0D3B33]"
          >
            Submit work
          </button>
        </div>
      </section>
    </div>
  );
}
