type HowToApplyPanelProps = {
  onGoToApply: () => void;
};

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="[font-family:var(--font-paraluman-heading)] text-base font-bold tracking-[-0.025em] text-[#052338]">
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

export function HowToApplyPanel({ onGoToApply }: HowToApplyPanelProps) {
  return (
    <div className="[font-family:var(--font-paraluman-body)] text-sm leading-6 text-[#184d45]/86 sm:text-[0.9rem] space-y-5">
      <section className="space-y-3.5">
        <h1 className="[font-family:var(--font-paraluman-heading)] text-[1.45rem] font-bold leading-tight tracking-[-0.035em] text-[#052338] sm:text-[1.55rem]">
          Application Process
        </h1>
        <p>
          We&apos;re doing this differently. Instead of resumes, we want to see
          how you actually think and build.
        </p>
      </section>

      <section className="space-y-3">
        <SectionTitle>The Challenge</SectionTitle>
        <p>
          You&apos;ll design a new product that we&apos;re planning to release.
          We have a rough product vision, backend, and strategy. Your role is
          to:
        </p>
        <AsteriskList
          items={[
            "Bring it to life through design.",
            "Create a clear user flow.",
            "Give suggestions on how the product could be better.",
          ]}
        />
        <p>
          This does not need to be fully functional. What matters is your
          ability to create a clear, thoughtful vision, and to make us
          understand how it should look.
        </p>
        <p>
          We&apos;ll give you the direction and you are given the freedom to
          shape the user journey, make product and design decisions, and define
          how the experience should feel. Use any tools you want, including AI,
          references, or your own workflow.
        </p>
      </section>

      <div className="-mx-5 space-y-5 border-y border-[#00A886]/12 bg-[#E8FFF9]/50 px-5 py-5 sm:-mx-6 sm:px-6">
        <section className="space-y-3">
          <SectionTitle>The Product</SectionTitle>
          <div className="space-y-3">
            <div>
              <p className="[font-family:var(--font-paraluman-heading)] text-xl font-bold tracking-[-0.035em] text-[#052338]">
                GIA
              </p>
              <p className="[font-family:var(--font-paraluman-mono)] text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#00A886]">
                Generative Influencer Analyst
              </p>
            </div>
            <p>
              GIA is a web-based analytics platform powered by SOFI AI. She
              helps TikTok creators understand their content in a simple, human
              way without needing to be technical.
            </p>
            <div className="space-y-2">
              <p className="font-semibold text-[#052338]">Use case:</p>
              <AsteriskList
                items={[
                  "You feed her your Tiktok profile link.",
                  "She gives you back a readable report with hook scores, audience signals, sentiment analysis, and suggestions on what to post next.",
                ]}
              />
            </div>
            <div className="pt-2 space-y-1">
              <p>Here is a sample of the report that GIA generates.</p>
              <div className="space-y-1">
                <a
                  href="/assets/Copy of hook_analysis_report (4)-1.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00A886] underline hover:text-[#00A886]/80 transition-colors block"
                >
                  Sample #1
                </a>
                <a
                  href="/assets/tiktok_hook_analysis_jazmin.chualife__r=1&_t=ZS-95pLZslyNsH-2.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00A886] underline hover:text-[#00A886]/80 transition-colors block"
                >
                  Sample #2
                </a>
              </div>
            </div>
            <div className="pt-2 space-y-1">
              <p>Also, here&apos;s a sample landing page we made:</p>
              <a
                href="https://sofi-ai-gia.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00A886] underline hover:text-[#00A886]/80 transition-colors block"
              >
                https://sofi-ai-gia.netlify.app/
              </a>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle>Who it&apos;s for</SectionTitle>
          <p>
            TikTok creators in the Philippines who don&apos;t speak fluent
            analytics: people who see their metrics but don&apos;t fully
            understand them.
          </p>
        </section>

        <section className="space-y-3">
          <SectionTitle>What You Will Build</SectionTitle>
          <div className="[font-family:var(--font-paraluman-body)] space-y-4 text-sm leading-6 text-[#184d45]/86 sm:text-[0.9rem]">
            <div className="space-y-2">
              <p>
                <span className="font-semibold text-[#052338]">
                  1. Landing Page:
                </span>{" "}
                We have an existing version of the landing page. Your task is to
                improve or redesign it.
              </p>
              <p>Think about:</p>
              <AsteriskList
                items={[
                  "How you would improve conversion.",
                  "How clearly the product is communicated.",
                  "What would make creators immediately understand the value.",
                ]}
              />
            </div>
            <div className="space-y-2">
              <p>
                <span className="font-semibold text-[#052338]">
                  2. Product Flow:
                </span>{" "}
                Design the end-to-end user experience for the actual product,
                from inputting a TikTok profile link to receiving and viewing
                the generated report.
              </p>
              <p>As you design, consider:</p>
              <AsteriskList
                items={[
                  "Is a PDF the best way to present the report? Or would a dashboard work better?",
                  "Should we be inputting the Tiktok profile link only? Are there any other details to input that would be useful?",
                  "Is anything missing in the current user flow?",
                  "Or, should this product exist at all? Do you have any suggestions on what we should be making instead?",
                ]}
              />
              <p>
                You have full flexibility in how you structure this experience.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle>How we&apos;ll evaluate</SectionTitle>
          <div className="[font-family:var(--font-paraluman-body)] space-y-2 text-sm leading-6 text-[#184d45]/86 sm:text-[0.9rem]">
            <p>
              <span className="font-semibold text-[#052338]">1. Thinking:</span>{" "}
              How you approach the problem and make decisions.
            </p>
            <p>
              <span className="font-semibold text-[#052338]">2. Design:</span>{" "}
              Clarity, usability, and overall execution.
            </p>
            <p>
              <span className="font-semibold text-[#052338]">
                3. Communication:
              </span>{" "}
              How well you explain your work and ideas.
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
    </div>
  );
}
