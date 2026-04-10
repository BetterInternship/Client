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
  hero,
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
          <div className="absolute inset-0">
            <img
              src={hero.backgroundImage}
              alt=""
              className="h-full w-full object-cover opacity-[0.2] mix-blend-soft-light"
            />
          </div>

          <HeroCloudField className="absolute inset-0" />

          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),transparent_45%),linear-gradient(180deg,rgba(6,26,56,0.34),rgba(255,255,255,0.03))]"
          />
        </div>
      ) : null}

      <div className="absolute inset-0 z-10 flex items-end justify-start px-6 pb-10 sm:px-10 sm:pb-12 lg:px-16 lg:pb-16">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-7 bg-black/16"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-black/16"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[56vh] bg-gradient-to-t from-white/72 via-white/28 to-transparent"
          aria-hidden
        />

        <div
          data-panel-content
          className="relative flex max-w-3xl flex-col gap-6"
        >
          <h1
            data-story-title
            className="text-4xl font-semibold tracking-[-0.01em] text-[#163c69] sm:text-5xl lg:text-6xl xl:text-7xl [font-family:var(--font-cebu-hero-title)]"
            style={{ lineHeight: 1.05 }}
          >
            <span
              data-story-hero-line-1
              className="block whitespace-nowrap text-[clamp(2rem,6vw,4.8rem)] text-white"
            >
              Have you ever wanted to
            </span>
            <span
              data-story-hero-line-2
              className="mt-2 block min-h-[1.2em] whitespace-nowrap text-[clamp(2rem,6vw,4.8rem)]"
            >
              <span className="inline-block whitespace-nowrap bg-[#f8d64e] px-3 text-[#163c69] shadow-[0_14px_28px_-18px_rgba(248,214,78,0.9)] box-decoration-clone">
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

          {hero.subline ? (
            <p
              data-story-description
              className="max-w-lg text-sm tracking-[0.14em] text-[#163c69]/72 sm:text-base [font-family:var(--font-cebu-story-mono)]"
            >
              {hero.subline}
            </p>
          ) : null}

          <div className="translate-x-[-1px]">
            <div className="inline-flex items-center gap-3 [font-family:var(--font-cebu-story-mono)] text-[10px] font-medium uppercase tracking-[0.26em] text-white/75">
              <span
                data-story-hero-chevron
                className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/35 bg-white/10"
              >
                {/* <span className="pointer-events-none absolute inset-[2px] rounded-full border border-transparent border-r-white/55 border-t-white/55 animate-[hero-ring-spin_5.8s_linear_infinite]" /> */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  className="animate-[hero-arrow-nudge_2.6s_ease-in-out_infinite] text-white/75"
                >
                  <polyline points="7 10 12 15 17 10" />
                </svg>
              </span>
            </div>
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
