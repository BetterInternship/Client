"use client";

import type { ScrollStoryHero } from "../model";

type HeroLandingViewProps = {
  hero: ScrollStoryHero;
};

export function HeroLandingView({ hero }: HeroLandingViewProps) {
  return (
    <section
      data-story-hero
      className="absolute inset-0 z-30 flex flex-col lg:grid lg:grid-cols-2 overflow-hidden"
    >
      {/* Top/Left half — white background with text */}
      <div className="relative flex flex-1 flex-col items-start justify-center bg-[#f5f7fa] px-8 py-12 lg:px-20 lg:py-0 overflow-hidden">
        {/* Subtle grid texture */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-50 z-0"
        />

        {/* White glowing orbs for dynamic ambiance */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <span className="absolute -left-20 -top-16 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-white to-white/20 opacity-80 blur-3xl sm:h-[700px] sm:w-[700px]" />
          <span className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-gradient-to-br from-white to-white/20 opacity-60 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-8">
          <h1
            data-story-hero-headline
            className="max-w-xl text-4xl font-bold uppercase tracking-tight text-gray-900 sm:text-5xl lg:text-6xl xl:text-7xl [font-family:var(--font-cebu-story-heading)]"
            style={{ lineHeight: 1.05 }}
          >
            {hero.headline}
          </h1>

          {hero.subline ? (
            <p className="max-w-md text-base tracking-wide text-gray-400 sm:text-lg [font-family:var(--font-cebu-story-mono)]">
              {hero.subline}
            </p>
          ) : null}
        </div>

        {/* Bouncing chevron — bottom of left half */}
        <div className="z-10 mt-8 translate-x-[-10px]">
          <svg
            data-story-hero-chevron
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
            className="animate-[hero-bounce_2s_ease-in-out_infinite] text-gray-400"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Bottom/Right half — Animated Parallax Sky */}
      <div 
        data-story-hero-bg 
        className="relative flex-1 lg:h-full bg-gradient-to-br from-[#77bbed] to-[#e0f6ff] overflow-hidden"
      >
        
      </div>

      <style jsx>{`
        @keyframes hero-bounce {
          0%,
          100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(10px);
            opacity: 0.4;
          }
        }
        @keyframes parallax-clouds {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes plane-bob {
          0%,
          100% {
            transform: translateY(10px) rotate(2deg);
          }
          50% {
            transform: translateY(-10px) rotate(-3deg);
          }
        }
      `}</style>
    </section>
  );
}
