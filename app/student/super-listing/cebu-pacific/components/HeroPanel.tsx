"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import cebuPacificLogo from "../logo.png";

type HeroPanelProps = {
  onHowToApply: () => void;
  showHowToApplyButton?: boolean;
};

export function HeroPanel({
  onHowToApply,
  showHowToApplyButton = true,
}: HeroPanelProps) {
  return (
    <section className="relative mx-auto flex min-h-[68vh] max-w-5xl items-center justify-center overflow-hidden sm:min-h-[72vh] lg:min-h-[78vh]">
      <div className="relative mx-auto w-full max-w-5xl">
        <div className="flex flex-col items-center space-y-8 text-center sm:space-y-9">
          <Link
            href="https://www.cebupacificair.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto inline-flex w-fit transition-opacity duration-300 hover:opacity-85"
          >
            <Image
              src={cebuPacificLogo}
              alt="Cebu Pacific"
              className="h-auto w-32 sm:w-40"
              priority
            />
          </Link>

          <div className="mx-auto w-full max-w-[min(92vw,940px)] space-y-4">
            <p className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.24em] text-[#1f3a55]/75 sm:text-sm">
              Cebu Pacific Internship Challenge
            </p>
            <h1 className="[font-family:var(--font-paraluman-heading)] text-[clamp(2.1rem,7vw,5.3rem)] font-black leading-[0.9] tracking-[-0.03em] text-[#2574BB]">
              Looking for
            </h1>
            <p className="[font-family:var(--font-paraluman-heading)]">
              <span className="inline rounded-[0.24em] bg-[#f3d98a] px-3 py-1 text-[clamp(1.25rem,3.2vw,2.55rem)] font-black leading-[1.05] tracking-[-0.02em] text-[#1f68a9] shadow-[0_16px_34px_-20px_rgba(243,217,138,0.8)] box-decoration-clone">
                Product, Design, and Web Interns
              </span>
            </p>
          </div>

          <div className="mx-auto w-full max-w-3xl space-y-2.5 [font-family:var(--font-paraluman-mono)] text-base leading-relaxed text-[#1f3a55] sm:text-lg">
            <p className="text-[#184977]">
              Millions of travelers depend on Cebu Pacific every year.
            </p>
            <p>
              Your work can make every trip smoother, from booking to boarding.
            </p>
            <p className="text-lg font-black leading-snug text-[#2574BB] sm:text-2xl">
              Build the future of air travel for every Juan.
            </p>
          </div>

          {showHowToApplyButton && (
            <div className="flex flex-col items-center gap-3 pt-4">
              <Button
                type="button"
                onClick={onHowToApply}
                className="inline-flex h-16 w-full items-center justify-center gap-3 rounded-[0.33em] border-2 border-[#2574BB] bg-[#2574BB] px-8 [font-family:var(--font-paraluman-heading)] text-lg font-black uppercase tracking-[0.09em] text-white transition-all duration-300 hover:bg-[#1c5a92] hover:shadow-[0_24px_48px_-16px_rgba(37,116,187,0.62)] active:scale-95 sm:w-auto sm:px-12 sm:text-xl"
              >
                Read Overview First
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8 [font-family:var(--font-paraluman-mono)] text-sm font-semibold text-[#6f5200]/70">
                No resume required, 24h response
              </div>
              <button
                type="button"
                onClick={onHowToApply}
                className="mt-1 inline-flex items-center gap-2 [font-family:var(--font-paraluman-mono)] text-sm font-bold uppercase tracking-[0.1em] text-[#2574BB] transition-opacity hover:opacity-80"
              >
                <ArrowDown className="h-4 w-4 animate-bounce" />
                Scroll to read overview
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
