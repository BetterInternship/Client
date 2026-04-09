"use client";

import { useEffect, useState } from "react";
import type { ScrollStoryHero } from "../model";
import { HeroCloudField } from "./HeroCloudField";

type HeroLandingViewProps = {
  hero: ScrollStoryHero;
};

const HERO_PHRASES = [
  "build for everyJuan?",
  "start something real?",
  "work on real journeys?",
  "begin somewhere big?",
  "take off early?",
];

export function HeroLandingView({ hero }: HeroLandingViewProps) {
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
    <section data-story-hero className="absolute inset-0 z-30 overflow-hidden">
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

        <div className="relative flex max-w-3xl flex-col gap-6">
          <h1
            data-story-hero-headline
            className="text-4xl font-semibold tracking-[-0.01em] text-[#163c69] sm:text-5xl lg:text-6xl xl:text-7xl [font-family:var(--font-cebu-hero-title)]"
            style={{ lineHeight: 1.05 }}
          >
            <span className="block whitespace-nowrap text-[clamp(2rem,6vw,4.8rem)] text-white">
              Have you ever wanted to
            </span>
            <span className="mt-2 block min-h-[1.2em] whitespace-nowrap ttext-[clamp(2rem,6vw,4.8rem)]">
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
            <p className="max-w-lg text-sm tracking-[0.14em] text-[#163c69]/72 sm:text-base [font-family:var(--font-cebu-story-mono)]">
              {hero.subline}
            </p>
          ) : null}

          <div className="translate-x-[-8px]">
            <svg
              data-story-hero-chevron
              width="72"
              height="72"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
              strokeLinejoin="miter"
              className="animate-[hero-nudge_3.4s_ease-in-out_infinite] text-[#163c69]/65"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes hero-nudge {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.62;
          }
          50% {
            transform: translateY(5px);
            opacity: 0.36;
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
