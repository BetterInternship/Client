"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    <section className="relative mx-auto flex min-h-[68vh] max-w-5xl items-center justify-center overflow-hidden  sm:min-h-[72vh] lg:min-h-[78vh] ">
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

          <h1 className="[font-family:var(--font-paraluman-heading)] mx-auto w-full max-w-[min(86vw,800px)] leading-[0.92] text-[#2574BB]">
            <span className="block text-[clamp(1.65rem,5.5vw,6rem)] leading-[0.96] tracking-[-0.03em] font-light">
              <span className="inline-block bg-[#f3d98a] px-1.5 text-[#2574BB] [box-decoration-break:clone] font-black">
                <span className="block">Build the Future</span>
                <span className="block">of Air Travel</span>
              </span>
              <span className="block">
                For <span className="italic  font-black">Every Juan</span>
              </span>
            </span>
          </h1>

          <div className="mx-auto inline-flex w-fit rounded-[0.33em] border border-[#2574BB]/35 bg-white/75 px-4 py-2 backdrop-blur-sm">
            <span className="[font-family:var(--font-paraluman-mono)] font-black uppercase text-[#2574BB] text-lg tracking-[0.09em] sm:text-xl  ">
              Looking for: Product, Design, and Web Interns
            </span>
          </div>

          <div className="mx-auto w-full max-w-3xl [font-family:var(--font-paraluman-mono)] text-base leading-relaxed text-[#1f3a55] sm:text-lg">
            <p>Millions of Filipinos fly every year.</p>
            <p>And yet, the experience still isn&apos;t perfect.</p>
            <p>Someone has to fix that.</p>
            <p className="text-[#2574BB] font-black">
              We&apos;re looking for an intern who&apos;s ready to step up and
              do it.
            </p>
          </div>

          {showHowToApplyButton && (
            <div className="flex flex-col items-center gap-3 pt-3">
              <Button
                type="button"
                onClick={onHowToApply}
                className="inline-flex h-16 w-full items-center justify-center gap-3 rounded-[0.33em] border-2 border-[#2574BB] bg-[#2574BB] px-8 [font-family:var(--font-paraluman-heading)] text-lg font-black uppercase tracking-[0.09em] text-white transition-all duration-300 hover:bg-[#1c5a92] hover:shadow-[0_24px_48px_-16px_rgba(37,116,187,0.62)] active:scale-95 sm:w-auto sm:px-12 sm:text-xl"
              >
                Start Challenge
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8 [font-family:var(--font-paraluman-mono)] text-sm font-semibold text-[#6f5200]/70">
                No resume required, 24h response
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
