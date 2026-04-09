"use client";

import type { ScrollStoryHero } from "../model";

type HeroLandingViewProps = {
  hero: ScrollStoryHero;
};

export function HeroLandingView({ hero }: HeroLandingViewProps) {
  return (
    <section
      data-story-hero
      className="absolute inset-0 z-30 grid grid-cols-2 overflow-hidden"
    >
      {/* Left half — white background with text */}
      <div className="relative flex flex-col items-start justify-center bg-[#f5f7fa] px-12 lg:px-20">
        {/* Subtle grid texture */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-50"
        />

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

      {/* Right half — image edge-to-edge */}
      <div data-story-hero-bg className="relative">
        <img
          data-story-hero-image
          src={hero.backgroundImage}
          alt=""
          className="h-full w-full object-cover"
        />
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
      `}</style>
    </section>
  );
}
