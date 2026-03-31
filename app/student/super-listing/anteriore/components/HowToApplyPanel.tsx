"use client";

type HowToApplyPanelProps = {
  challengePdfUrl?: string;
};

export function HowToApplyPanel({
  challengePdfUrl: _challengePdfUrl,
}: HowToApplyPanelProps) {
  const stageOneQuestions = [
    "1) What is your goal in life?",
    "2) How do you plan on achieving said goal?",
    "3) What steps are you taking now to achieve said goal?",
    "4) What’s one technology you’re interested in? What about this technology interests you?",
    "5) How can you make money from this technology?",
  ];

  const stageTwoChecks = [
    "* How you approach unfamiliar problems",
    "* How you ask questions",
    "* How much initiative you take",
  ];

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[0.33em] border-2 border-[#274b7d]/22 bg-white shadow-[0_24px_55px_-35px_rgba(39,75,125,0.75)]">
        <div className="flex flex-col gap-6 bg-gradient-to-br from-[#274b7d] via-[#1b3458] to-[#162c49] px-6 py-7 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-8">
          <p className="[font-family:var(--font-anteriore-heading)] text-2xl font-black uppercase tracking-[-0.02em] text-white sm:text-3xl">
            Complete this challenge to apply
          </p>
        </div>

        <div className="space-y-6 px-6 py-7 sm:px-8 sm:py-8">
          <section className="space-y-2 border-b border-[#274b7d]/14 pb-6">
            <p className="[font-family:var(--font-anteriore-heading)] text-lg font-black uppercase tracking-[-0.01em] text-[#1b3458] sm:text-xl">
              There are 2 stages to the ANTERIORE CHALLENGE!
            </p>
          </section>

          <section className="space-y-2 border-b border-[#274b7d]/14 pb-6">
            <p className="[font-family:var(--font-anteriore-heading)] text-base font-black uppercase text-[#274b7d] sm:text-lg">
              Stage 1 — Your “Why”
            </p>
            <p className="[font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/85 sm:text-base">
              Answer the following questions:
            </p>
            <ul className="space-y-1 [font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/85 sm:text-base">
              {stageOneQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
            <p className="[font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/85 sm:text-base">
              After you’ve answered these questions, send your answers to me on
              Viber:{" "}
              <a
                href="viber://chat?number=%2B639271273470"
                className="inline-flex text-[#274b7d] underline underline-offset-4"
              >
                +639271273470
              </a>
            </p>
            <p className="[font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/85 sm:text-base">
              I will evaluate them, and then we can then proceed to the next
              stage.
            </p>
          </section>

          <section className="space-y-2 ">
            <p className="[font-family:var(--font-anteriore-heading)] text-base font-black uppercase text-[#274b7d] sm:text-lg">
              Stage 2 — The Actual Challenge
            </p>
            <p className="[font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/85 sm:text-base">
              You’ll be given a puzzle based on a custom programming language
              that I personally made.
            </p>
            <p className="[font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/85 sm:text-base">
              You will have 48 hours to work on it. During that time, you can
              ask unlimited questions.
            </p>
            <p className="[font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/85 sm:text-base">
              We’re doing this because we want to see:
            </p>
            <ul className="space-y-1 [font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/85 sm:text-base">
              {stageTwoChecks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="[font-family:var(--font-anteriore-mono)] text-sm leading-7 text-black/85 sm:text-base">
              This is also your chance to understand how we work and decide if
              this is the right environment for you.
            </p>
          </section>

          <section className="rounded-[0.33em] border border-[#274b7d] bg-[#274b7d]/5 px-4 py-3">
            <p className="[font-family:var(--font-anteriore-mono)] text-sm font-semibold leading-7 text-[#1b3458] sm:text-base">
              How do you make reliable journalism accessible across
              languages—without slowing it down? If you pass... you’re in!
            </p>
          </section>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[0.33em] border-2 border-[#274b7d]/45 bg-gradient-to-br from-[#274b7d] via-[#1b3458] to-[#162c49] p-6 text-white shadow-[0_24px_55px_-30px_rgba(39,75,125,0.88)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,transparent_38%,rgba(255,255,255,0.06)_72%,transparent_100%)]" />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="[font-family:var(--font-anteriore-heading)] text-2xl uppercase tracking-[-0.02em] text-white sm:text-3xl">
              Ready to apply?
            </p>
          </div>
          <a
            href="viber://chat?number=%2B639271273470"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-white bg-white/95 px-5 [font-family:var(--font-anteriore-heading)] text-sm font-bold uppercase tracking-[0.08em] text-[#274b7d] transition-all duration-200 hover:bg-white hover:shadow-lg sm:w-auto"
          >
            Message on Viber: +639271273470
          </a>
        </div>
      </div>
    </div>
  );
}
