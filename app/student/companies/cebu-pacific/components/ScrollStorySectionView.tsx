"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ScrollStorySection } from "../model";

type ScrollStorySectionViewProps = {
  section: ScrollStorySection;
  isActive: boolean;
  stacked?: boolean;
};

type SectionPaletteVars = CSSProperties & {
  "--section-sky": string;
  "--section-glow": string;
  "--section-accent": string;
  "--section-border": string;
};

export function ScrollStorySectionView({
  section,
  isActive,
  stacked = false,
}: ScrollStorySectionViewProps) {
  const paletteStyle: SectionPaletteVars = {
    "--section-sky": section.palette.sky,
    "--section-glow": section.palette.glow,
    "--section-accent": section.palette.accent,
    "--section-border": section.palette.border,
  };

  const hasJourney = Boolean(section.journey);

  return (
    <section
      style={paletteStyle}
      className={cn(
        "overflow-hidden",
        stacked ? "relative min-h-screen" : "absolute inset-0",
        isActive ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      {/* Light background */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,#f8fafb_0%,#eef2f7_50%,#e8ecf2_100%)]"
      />

      {/* Subtle grid overlay */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-60"
      />

      {/* Accent line — hard geometric element */}
      <div
        aria-hidden
        className="absolute left-0 top-0 h-full w-[2px] bg-[var(--section-sky)] opacity-30"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 h-[1px] w-full bg-gray-300 opacity-50"
      />

      {/* Dark exit overlay — GSAP wipes this up to block content on exit */}
      <div
        data-story-overlay
        className="pointer-events-none absolute inset-0 z-50 bg-[#0a0a0a]"
        style={{ opacity: 0 }}
      />

      <div className="relative flex h-full items-center">
        <div
          className={cn(
            "mx-auto grid w-full max-w-7xl gap-10 px-5 pb-12 pt-28 sm:px-8 lg:px-12",
            hasJourney
              ? "lg:grid-cols-[1.1fr_0.9fr]"
              : "lg:grid-cols-[1.02fr_0.98fr]",
            stacked ? "min-h-screen py-24" : "h-full",
          )}
        >
          <div
            data-story-content
            className="relative z-10 flex flex-col justify-center gap-6"
          >
            <div className="space-y-5">
              {/* Step indicator */}
              <div className="flex items-center gap-3">
                <span className="inline-block h-[2px] w-8 bg-[var(--section-sky)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--section-sky)] [font-family:var(--font-cebu-story-mono)]">
                  {section.step}
                </span>
              </div>

              <h1
                data-story-title
                className="max-w-3xl text-3xl font-semibold uppercase leading-[0.92] tracking-tight text-gray-900 sm:text-4xl lg:text-6xl [font-family:var(--font-cebu-story-heading)]"
              >
                {section.title}
              </h1>

              <p
                data-story-description
                className="max-w-2xl text-base leading-7 text-gray-600 sm:text-lg"
              >
                {section.description}
              </p>

              <p
                data-story-supporting
                className="max-w-2xl text-sm leading-7 text-gray-400 sm:text-base"
              >
                {section.supporting}
              </p>
            </div>

            {/* Journey card */}
            {hasJourney && section.journey ? (
              <div
                data-story-point
                className="border border-gray-200 bg-white/80 p-6"
              >
                <div className="flex flex-col gap-2">
                  {section.journey.roles.map((role) => (
                    <Link
                      key={role.label}
                      href={role.href}
                      className="group flex w-full items-center justify-between border border-gray-200 bg-gray-50/50 px-5 py-4 text-left transition-colors duration-200 hover:border-[var(--section-sky)] hover:bg-white"
                    >
                      <span className="text-sm font-semibold tracking-wide text-gray-700 [font-family:var(--font-cebu-story-body)]">
                        {role.label}
                      </span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        className="text-gray-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[var(--section-sky)]"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Quote */}
            {section.quote ? (
              <blockquote
                data-story-quote
                className="flex max-w-2xl gap-4 border border-gray-200 bg-white/60 px-6 py-5"
              >
                <div className="w-[3px] shrink-0 bg-[var(--section-sky)]" />
                <div>
                  <p className="text-base leading-7 text-gray-700 sm:text-lg">
                    &ldquo;{section.quote.text}&rdquo;
                  </p>
                  <footer className="mt-3 text-[10px] uppercase tracking-[0.3em] text-gray-400 [font-family:var(--font-cebu-story-mono)]">
                    {section.quote.attribution}
                  </footer>
                </div>
              </blockquote>
            ) : null}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {section.actions.map((action) => (
                <Link
                  key={`${section.id}-${action.label}`}
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                  data-story-action
                  className={cn(
                    "inline-flex items-center justify-center px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-200 hover:-translate-y-px",
                    action.tone === "secondary"
                      ? "border border-gray-300 bg-transparent text-gray-600 hover:border-gray-400 hover:text-gray-900"
                      : "bg-[var(--section-sky)] text-white hover:brightness-110",
                  )}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {!!section.image && (
            <div
              data-story-media
              className="relative flex items-center justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-xl">
                <div className="relative overflow-hidden border border-gray-200 bg-white/50">
                  <div className="relative overflow-hidden bg-gray-100">
                    <img
                      data-story-image
                      src={section.image.src}
                      alt={section.image.alt}
                      className="h-[28rem] w-full object-cover sm:h-[34rem] lg:h-[44rem]"
                    />

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/80 to-transparent px-5 pb-5 pt-16">
                      <p className="text-xs leading-6 text-gray-400 [font-family:var(--font-cebu-story-mono)]">
                        {section.image.caption}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Label badge */}
                <div className="absolute -bottom-3 left-3 border border-gray-200 bg-white/95 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.3em] text-gray-400 [font-family:var(--font-cebu-story-mono)]">
                  Placeholder image
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
