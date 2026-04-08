"use client";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cebuPacificProfile } from "../../../companies/cebu-pacific/data";

type OverviewPanelProps = {
  onGoToApply: () => void;
};

type SectionTitleProps = {
  title: string;
  textClassName?: string;
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
      "Qualified submissions are reviewed quickly, with a target response within 24 hours.",
  },
];

const HOW_TO_APPLY_STEPS = [
  "Read the challenge brief carefully and pick one problem worth solving.",
  "Build a working prototype that improves the Cebu Pacific experience.",
  "Submit one clear link and your details. Cebu Pacific responds within 24 hours.",
];

function SectionTitle({ title, textClassName }: SectionTitleProps) {
  return (
    <div className="w-full">
      <div className="flex items-stretch gap-2.5">
        <span
          aria-hidden="true"
          className="my-auto h-[2em] w-[0.3em] shrink-0 bg-[#2574BB] opacity-50"
        />
        <p
          className={`text-left [font-family:var(--font-paraluman-heading)] text-[clamp(1.25rem,2.4vw,1.8rem)] font-black tracking-[-0.01em] ${textClassName ?? "text-[#1f68a9]"}`}
        >
          {title}
        </p>
      </div>
    </div>
  );
}

export function OverviewPanel({
  onGoToApply: onGoToChallenge,
}: OverviewPanelProps) {
  return (
    <div className="space-y-16 pt-4 sm:pt-8">
      <section className="space-y-2">
        <SectionTitle title="Job details" />
        <div className="grid gap-4 md:grid-cols-3">
          {cebuPacificProfile.jobDetails.map((item) => (
            <div
              key={item.label}
              className="rounded-[0.33em] border border-[#2574BB]/30 bg-white p-5 shadow-[0_16px_38px_-28px_rgba(37,116,187,0.45)]"
            >
              <p className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.12em] text-[#2574BB]/80">
                {item.label}
              </p>
              <p className="mt-2 [font-family:var(--font-paraluman-heading)] text-2xl font-black tracking-[-0.02em] text-[#1f68a9]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <SectionTitle title="Role overview" />
        <div className="relative w-full overflow-hidden rounded-[0.33em] border border-[#2574BB]/35 bg-[#edf6ff] p-6 text-[#173957] shadow-[0_20px_38px_-26px_rgba(37,116,187,0.35)] sm:p-8">
          <div className="relative z-10 space-y-6 [font-family:var(--font-paraluman-body)] text-lg leading-8 text-[#153a5b]/92 sm:text-xl">
            {cebuPacificProfile.roleOverview.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <SectionTitle title="Why skip resume" />
        <div className="relative w-full overflow-hidden rounded-[0.33em] border border-[#9b8955]/20 bg-[#f6eccf] p-6 text-[#173957] shadow-[0_26px_48px_-30px_rgba(37,116,187,0.46)] sm:p-8">
          <div className="relative z-10 space-y-6 [font-family:var(--font-paraluman-body)] text-lg leading-8 text-[#173957]/95 sm:text-xl">
            {cebuPacificProfile.whySkipResume.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p className="[font-family:var(--font-paraluman-heading)] text-2xl font-black leading-tight tracking-[-0.02em] text-[#1f68a9]">
              This listing is designed to reward builders, not paperwork.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <SectionTitle title="FAQs" />
        <div className="w-full rounded-[0.33em] border-2 border-[#2574BB]/30 bg-white px-6 py-3 shadow-[0_16px_38px_-28px_rgba(37,116,187,0.5)]">
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`faq-${index}`}
                className="border-[#2574BB]/20"
              >
                <AccordionTrigger className="[font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.06em] text-[#1f68a9] hover:no-underline sm:text-lg">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="[font-family:var(--font-paraluman-body)] text-lg leading-8 text-black/70 sm:text-xl">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="space-y-2">
        <SectionTitle title="How to apply" />
        <div className="relative w-full overflow-hidden rounded-[0.33em] border border-[#2574BB]/40 bg-[#edf6ff] p-6 text-[#173957] shadow-[0_26px_48px_-30px_rgba(37,116,187,0.46)] sm:p-8">
          <div className="relative z-10 space-y-5">
            <ol className="mx-auto w-full">
              {HOW_TO_APPLY_STEPS.map((step, index) => (
                <li
                  key={step}
                  className="relative flex items-start gap-4 pb-5 pl-1"
                >
                  {index < HOW_TO_APPLY_STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute left-[0.98rem] top-8 h-[calc(100%-0.25rem)] w-px bg-[#2574BB]/30"
                    />
                  )}
                  <span className="relative z-10 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#2574BB]/25 bg-white [font-family:var(--font-paraluman-heading)] text-xs font-black uppercase tracking-[0.03em] text-[#1f68a9] shadow-[0_8px_18px_-14px_rgba(37,116,187,0.7)]">
                    {index + 1}
                  </span>
                  <p className="pt-0.5 [font-family:var(--font-paraluman-body)] text-lg leading-8 text-[#153a5b]/92 sm:text-xl">
                    {step}
                  </p>
                </li>
              ))}
            </ol>

            <div className="flex w-full flex-col gap-3 rounded-[0.33em] border border-[#2574BB]/22 bg-white/75 px-4 py-3.5 shadow-[0_12px_24px_-22px_rgba(37,116,187,0.55)] sm:flex-row sm:items-center sm:justify-between">
              <p className="[font-family:var(--font-paraluman-body)] text-lg font-semibold leading-8 text-[#153a5b]/95 sm:text-xl">
                Open the challenge brief to start.
              </p>
              <Button
                type="button"
                onClick={onGoToChallenge}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#d8c17b] bg-[#ecd389] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-[#173957] transition-all duration-200 hover:bg-[#e2c36b] hover:shadow-[0_12px_26px_-14px_rgba(236,211,137,0.9)] sm:w-auto"
              >
                View challenge
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
