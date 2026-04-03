"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CEOProfile } from "./types";

type OverviewPanelProps = {
  ceoProfile: CEOProfile;
  onGoToApply: () => void;
};

type SectionTitleProps = {
  title: string;
};

const WORK_STREAMS = [
  {
    title: "Build Real Features",
    description:
      "Create product features that are used by a real newsroom, not practice tasks.",
  },
  {
    title: "Improve Story Flow",
    description:
      "Help the team draft, review, and publish stories faster in English and Filipino.",
  },
  {
    title: "Make It Easy To Use",
    description:
      "Turn rough ideas into clear, simple tools that people can use right away.",
  },
];

const BENEFITS = [
  {
    title: "Do Work That Matters",
    description: "Your output reaches real readers, not just internal demos.",
  },
  {
    title: "Get Fast Feedback",
    description: "You get direct and quick feedback from the team and leaders.",
  },
  {
    title: "Strengthen Your Portfolio",
    description: "Leave with a strong real-world project you can proudly show.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Who can apply for this internship?",
    answer:
      "Any builder who can ship fast and learn quickly. We care more about output than pedigree.",
  },
  {
    question: "Do I need a resume to apply?",
    answer:
      "No resume needed. Your challenge output and execution quality matter most.",
  },
  {
    question: "What should I include in my submission link?",
    answer:
      "Send one clear link that shows your work end-to-end (docs, demo, code, or walkthrough).",
  },
  {
    question: "How quickly will I hear back?",
    answer:
      "We aim to review quickly and send an update within 24 hours for qualified submissions.",
  },
];

function SectionTitle({ title }: SectionTitleProps) {
  return (
    <div className="space-y-2">
      <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.25rem,2.4vw,1.8rem)] font-black tracking-[-0.01em] text-[#4d1b5a]">
        {title}
      </p>
      <div className="h-1.5 w-20 rounded-full bg-gradient-to-r from-[#72068c] via-[#8a2ea2] to-[#c084fc]" />
    </div>
  );
}

export function OverviewPanel({
  ceoProfile,
  onGoToApply: onGoToHowToApply,
}: OverviewPanelProps) {
  return (
    <div className="space-y-16 pt-4 sm:pt-8">
      <section className="space-y-6">
        <SectionTitle
          title="              You will build real tools used by a real newsroom team
"
        />
        <div className="rounded-[0.33em]">
          <div className="relative">
            <div className="grid gap-4 md:grid-cols-3">
              {WORK_STREAMS.map((item) => (
                <article
                  key={item.title}
                  className="relative isolate overflow-hidden rounded-[0.33em] border border-[rgba(114,6,140,0.58)] bg-gradient-to-br from-[#72068c] via-[#5a0570] to-[#4a0460] p-5 shadow-[0_18px_34px_-22px_rgba(114,6,140,0.92)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,transparent_38%,rgba(255,255,255,0.06)_72%,transparent_100%)]" />
                  <div className="relative z-10 flex items-center gap-3">
                    <h3 className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase tracking-[0.01em] text-white">
                      {item.title}
                    </h3>
                  </div>
                  <p className="relative z-10 mt-3 [font-family:var(--font-paraluman-mono)] text-sm leading-6 text-white">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle
          title="            Real experience, fast feedback, and proof of impact.
"
        />
        <div className="rounded-[0.33em] ">
          <div className="mt-4 overflow-hidden rounded-[0.33em] border border-[rgba(114,6,140,0.18)] bg-[#fbf8fd] shadow-[0_16px_32px_-22px_rgba(114,6,140,0.8)]">
            <ul className="divide-y divide-[rgba(114,6,140,0.14)]">
              {BENEFITS.map((item, index) => (
                <li
                  key={item.title}
                  className="flex items-start gap-4 px-4 py-4 sm:px-5 sm:py-5 "
                >
                  <span className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[rgba(114,6,140,0.25)] bg-white [font-family:var(--font-paraluman-mono)] text-[11px] font-bold text-[#72068c]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="[font-family:var(--font-paraluman-heading)] text-base font-black uppercase tracking-[0.01em] text-[#5a0570] sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 [font-family:var(--font-paraluman-mono)] text-sm leading-6 text-black/75">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <SectionTitle title="Work with" />
        <div className="rounded-[0.33em] ">
          <div className="flex flex-col items-start gap-6 text-left sm:flex-row sm:items-end">
            <div className="relative h-52 w-52 flex-shrink-0 overflow-hidden rounded-[0.33em] border-2 border-[rgba(114,6,140,0.3)] shadow-xl sm:h-64 sm:w-64">
              <Image
                src={ceoProfile.imageSrc}
                alt={ceoProfile.name}
                fill
                className="object-cover"
              />
            </div>

            <div className=" align-bottom">
              <Link
                href={ceoProfile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 [font-family:var(--font-paraluman-heading)] text-2xl font-black uppercase tracking-tight sm:text-3xl"
              >
                <span className="bg-gradient-to-r from-[#72068c] to-[#5a0570] bg-clip-text text-transparent transition-colors">
                  {ceoProfile.name}
                </span>
                <ArrowUpRight className="h-5 w-5 text-[#72068c] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-black/65 sm:text-lg [font-family:var(--font-paraluman-mono)]">
                {ceoProfile.role}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle title="About Paraluman" />
        <div className="relative overflow-hidden rounded-[0.33em] border border-[rgba(114,6,140,0.26)] bg-gradient-to-br from-[#690580] via-[#5a0570] to-[#430556] p-6 text-white shadow-[0_24px_56px_-30px_rgba(114,6,140,0.9)] sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.2)_0%,transparent_32%,rgba(255,255,255,0.1)_58%,transparent_100%)]" />
          <div className="relative z-10 space-y-3">
            <p className="[font-family:var(--font-paraluman-heading)] text-[clamp(1.4rem,3.2vw,2rem)] font-black uppercase tracking-[-0.02em] text-white">
              Building Accessible Filipino Journalism
            </p>
            <p className="mt-4 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-white sm:text-base">
              Paraluman is a youth-led Philippine news platform focused on
              making journalism more accessible in both English and Filipino. We
              build practical systems that help stories move from draft to
              publication without losing clarity, speed, or integrity.
            </p>
            <Button
              asChild
              className="mt-1 inline-flex h-11 items-center gap-2 rounded-[0.33em] border border-white/55 bg-white/12 px-4 [font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.1em] text-white shadow-[0_12px_26px_-18px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-[#72068c]"
            >
              <Link
                href="https://www.paraluman.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit paraluman.com
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <SectionTitle title="FAQs" />
        <div className="rounded-[0.33em] border-2 border-[rgba(114,6,140,0.2)] bg-white px-6 py-3 shadow-[0_16px_38px_-28px_rgba(114,6,140,0.65)]">
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`faq-${index}`}
                className="border-[rgba(114,6,140,0.14)]"
              >
                <AccordionTrigger className="[font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.06em] text-[#72068c] hover:no-underline sm:text-base">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="[font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/70">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[0.33em] border-2 border-[rgba(114,6,140,0.45)] bg-gradient-to-br from-[#72068c] via-[#5a0570] to-[#4a0460] p-6 text-white shadow-[0_24px_55px_-30px_rgba(114,6,140,0.88)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,transparent_38%,rgba(255,255,255,0.06)_72%,transparent_100%)]" />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="">
            <p className="[font-family:var(--font-paraluman-heading)] text-2xl text-white uppercase tracking-[-0.02em] sm:text-3xl">
              Up for the challenge?
            </p>
            <p className="[font-family:var(--font-paraluman-mono)] text-[10px] leading-tight text-white/75 sm:text-[11px]">
              No resume needed. Response in 24 hours
            </p>
          </div>
          <div className="w-full sm:w-auto sm:text-right">
            <Button
              type="button"
              onClick={onGoToHowToApply}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-white bg-white/95 px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-[#72068c] transition-all duration-200 hover:bg-white hover:shadow-lg sm:w-auto"
            >
              Start challenge
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
