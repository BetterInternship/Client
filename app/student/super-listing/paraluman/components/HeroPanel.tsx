"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import paralumanLogo from "../logo.png";
import { Button } from "@/components/ui/button";

type HeroPanelProps = {
  onHowToApply: () => void;
  showHowToApplyButton?: boolean;
};

export function HeroPanel({
  onHowToApply,
  showHowToApplyButton = true,
}: HeroPanelProps) {
  return (
    <section className="relative mx-auto flex max-w-5xl justify-center overflow-hidden pb-20 pt-12 sm:pb-28 sm:pt-16 lg:pb-32 lg:pt-20">
      <div className="relative mx-auto w-full max-w-4xl">
        <div className="flex flex-col items-center space-y-6 text-center sm:space-y-7">
          <Link
            href="https://www.paraluman.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto inline-flex w-fit transition-opacity duration-300 hover:opacity-85"
          >
            <Image
              src={paralumanLogo}
              alt="Paraluman"
              className="h-auto w-24 sm:w-32"
              priority
            />
          </Link>

          <h1 className="[font-family:var(--font-paraluman-heading)] max-w-2xl text-[clamp(3.2rem,9vw,7.5rem)] font-black uppercase leading-[0.75] tracking-[-0.025em] text-black">
            <span className="block text-[#72068c]">Shape</span>
            <span className="block">Filipino</span>
            <span className="block">Stories</span>
          </h1>

          <div className="mx-auto inline-flex w-fit rounded-[0.33em] border border-[#72068c]/25 bg-white/70 px-4 py-2 backdrop-blur-sm">
            <span className="[font-family:var(--font-paraluman-mono)] font-black uppercase text-[#72068c]">
              Looking for: Web Development Interns
            </span>
          </div>

          <p className="[font-family:var(--font-paraluman-mono)] max-w-xl text-base leading-7 text-black/70 sm:text-lg sm:leading-8">
            <span className="block font-bold text-[#72068c]">
              Build real tools for a real newsroom
            </span>
            <span className="mt-4 block">
              <span className="font-bold text-[#72068c]">Paraluman</span> is a
              youth-led Philippine news platform making every story accessible
              in both English and Filipino.
            </span>
            <span className="mt-4 block">
              Join our team to build and{" "}
              <span className="font-bold text-[#72068c]">
                improvehow articles are created, processed, and published
              </span>{" "}
              to reach thousands of readers.
            </span>
          </p>

          {showHowToApplyButton && (
            <div className="flex flex-col items-center gap-3 pt-3">
              <Button
                type="button"
                onClick={onHowToApply}
                className="inline-flex h-16 w-full items-center justify-center gap-3 rounded-lg border-2 border-[#72068c] bg-[#72068c] px-8 [font-family:var(--font-paraluman-heading)] text-lg font-black uppercase tracking-[0.09em] text-white transition-all duration-300 hover:bg-[#5a0570] hover:shadow-[0_24px_48px_-16px_rgba(114,6,140,0.6)] active:scale-95 sm:w-auto sm:px-12 sm:text-xl"
              >
                Apply now
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
                <div className="flex items-center gap-2">
                  <span className="text-[#72068c]">{"\u2022"}</span>
                  <span className="[font-family:var(--font-paraluman-mono)] text-sm font-semibold text-[#5d0476]">
                    No resume required
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#72068c]">{"\u2022"}</span>
                  <span className="[font-family:var(--font-paraluman-mono)] text-sm font-semibold text-[#5d0476]">
                    24h response
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
