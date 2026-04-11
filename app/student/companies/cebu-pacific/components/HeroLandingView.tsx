"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { ScrollStoryHero } from "../model";
import { HeroCloudField } from "./HeroCloudField";

type HeroLandingViewProps = {
  hero: ScrollStoryHero;
  showBackground?: boolean;
  className?: string;
};

const HERO_PHRASES = [
  "build for everyJuan?",
  "start something real?",
  "work on real journeys?",
  "begin somewhere big?",
  "take off early?",
];

export function HeroLandingView({
  hero: _hero,
  showBackground = true,
  className,
}: HeroLandingViewProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = HERO_PHRASES[phraseIndex];

    const delay = (() => {
      if (!isDeleting && typedText === currentPhrase) return 1800;
      if (isDeleting && typedText.length === 0) return 380;
      return isDeleting ? 26 : 46;
    })();

    const timer = window.setTimeout(() => {
      if (!isDeleting) {
        if (typedText.length < currentPhrase.length) {
          setTypedText(currentPhrase.slice(0, typedText.length + 1));
          return;
        }

        setIsDeleting(true);
        return;
      }

      if (typedText.length > 0) {
        setTypedText(currentPhrase.slice(0, typedText.length - 1));
        return;
      }

      setIsDeleting(false);
      setPhraseIndex((current) => (current + 1) % HERO_PHRASES.length);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [phraseIndex, typedText, isDeleting]);

  return (
    <section
      data-story-hero
      className={cn("absolute inset-0 z-30 overflow-hidden", className)}
    >
      {showBackground ? (
        <div
          data-story-hero-bg
          className="absolute inset-0 overflow-hidden bg-[#6bb6e8]"
        >
          <HeroCloudField className="absolute inset-0" />
        </div>
      ) : (
        <div data-story-hero-bg className="absolute inset-0 overflow-hidden">
          <HeroCloudField
            className="absolute inset-0"
            showSky={false}
            showAtmosphere={false}
            showBottomGlow={false}
          />
        </div>
      )}

      <div className="absolute inset-0 z-10 flex items-end justify-start px-6 pb-10 sm:px-10 sm:pb-12 lg:px-16 lg:pb-16">
        <div
          data-panel-content
          className="relative flex max-w-4xl flex-col gap-6 pb-16 sm:pb-20 lg:pb-24"
        >
          <h1
            data-story-title
            className="[--hero-title-size:clamp(2.2rem,7.3vw,6.7rem)] text-4xl tracking-[-0.01em] text-[#163c69] sm:text-5xl lg:text-6xl xl:text-7xl"
            style={{ lineHeight: 1 }}
          >
            <span
              data-story-hero-line-1
              className="block whitespace-nowrap text-[length:var(--hero-title-size)] tracking-[-0.02em] text-white [font-family:var(--font-cebu-story-body)]"
            >
              Have you ever wanted to
            </span>
            <span
              data-story-hero-line-2
              className="mt-3 block min-h-[1.2em] text-[length:var(--hero-title-size)] [font-family:var(--font-cebu-story-body)]"
            >
              <span className="inline-block whitespace-nowrap bg-[#f8d64e] px-3 pb-1 text-[#163c69] shadow-[0_14px_28px_-18px_rgba(248,214,78,0.9)] box-decoration-clone [font-family:var(--font-cebu-story-body)] font-semibold tracking-[-0.012em]">
                {typedText || "\u00A0"}
                <span
                  aria-hidden="true"
                  className="ml-1 inline-block h-[0.92em] w-[3px] translate-y-[0.08em] rounded-full bg-[#163c69]/70"
                  style={{
                    animation: "cebuCaretBlink 1.05s steps(1, end) infinite",
                  }}
                />
              </span>
            </span>
          </h1>
        </div>

        <div className="absolute inset-x-0 bottom-10 flex justify-center sm:bottom-12 lg:bottom-12">
          <div className="inline-flex items-center gap-3 [font-family:var(--font-cebu-story-body)] text-[10px] font-medium uppercase tracking-[0.2em] text-white/75">
            <span
              data-story-hero-chevron
              className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/35 bg-white/50"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="square"
                strokeLinejoin="miter"
                className="animate-[hero-arrow-nudge_2.6s_ease-in-out_infinite] text-[#163c69]/75"
              >
                <polyline points="7 10 12 15 17 10" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes hero-arrow-nudge {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          50% {
            transform: translateY(2px);
            opacity: 0.38;
          }
        }

        @keyframes hero-ring-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes cebuCaretBlink {
          0% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
