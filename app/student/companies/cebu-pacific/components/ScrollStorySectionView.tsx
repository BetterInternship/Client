"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ScrollStorySection } from "../model";

type ScrollStorySectionViewProps = {
  section: ScrollStorySection;
  isActive: boolean;
  stacked?: boolean;
  transparentBackground?: boolean;
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
  transparentBackground = false,
}: ScrollStorySectionViewProps) {
  const paletteStyle: SectionPaletteVars = {
    "--section-sky": section.palette.sky,
    "--section-glow": section.palette.glow,
    "--section-accent": section.palette.accent,
    "--section-border": section.palette.border,
  };

  const hasJourney = Boolean(section.journey);
  const variant =
    section.variant ??
    (hasJourney ? "journey" : section.image ? "feature" : "statement");
  const isFeature = variant === "feature";
  const isStatement = variant === "statement";
  const isJourney = variant === "journey";

  return (
    <section
      style={paletteStyle}
      className={cn(
        "overflow-hidden",
        stacked ? "relative min-h-[100svh]" : "absolute inset-0",
        isActive ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      {!transparentBackground ? (
        <div data-story-background className="absolute inset-0">
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,#f8fafb_0%,#eef2f7_52%,#e8ecf2_100%)]"
          />

          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:68px_68px] opacity-35"
          />

          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(0,0,0,0.12),transparent)]"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(0,0,0,0.12),transparent)]"
          />
        </div>
      ) : (
        <div data-story-background className="absolute inset-0">
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(145deg,var(--section-glow),transparent_45%,rgba(255,255,255,0.05)_100%)]"
          />
        </div>
      )}

      <div
        data-story-overlay
        className="pointer-events-none absolute inset-0 z-50 bg-[#0a0a0a]"
        style={{ opacity: 0 }}
      />

      <div className="relative flex h-full items-center">
        <div
          className={cn(
            "mx-auto grid w-full px-6 pb-14 pt-28 sm:px-10 lg:px-14",
            isFeature
              ? "max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(26rem,0.82fr)]"
              : isJourney
                ? "max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(24rem,0.88fr)]"
                : "max-w-5xl grid-cols-1 justify-items-start text-left",
            stacked ? "min-h-[100svh] py-24" : "h-full",
          )}
        >
          <div
            data-story-content
            className={cn(
              "relative z-10 flex flex-col justify-center gap-8",
              isStatement && "items-start text-left",
            )}
          >
            <div className={cn("space-y-6", isStatement && "max-w-4xl")}>
              {!hasJourney && (
                <div
                  className={cn(
                    "flex items-center gap-4",
                    isStatement && "justify-start",
                  )}
                >
                  <span className="inline-block h-px w-10 bg-[var(--section-sky)] opacity-60" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--section-sky)]/80 [font-family:var(--font-cebu-story-mono)]">
                    {section.step}
                  </span>
                </div>
              )}

              <h1
                data-story-title
                className={cn(
                  "max-w-4xl font-semibold leading-[0.92] tracking-[-0.02em] text-gray-950 [font-family:var(--font-cebu-story-heading)]",
                  isStatement
                    ? "text-[clamp(2.9rem,7vw,6.4rem)]"
                    : "text-[clamp(2.5rem,5.4vw,5.6rem)]",
                )}
              >
                {section.title}
              </h1>

              {section.description && (
                <p
                  data-story-description
                  className={cn(
                    "max-w-2xl text-[1.02rem] leading-8 text-gray-600 sm:text-[1.08rem]",
                    isStatement &&
                      "max-w-3xl text-[1.08rem] leading-8 sm:text-[1.18rem]",
                  )}
                >
                  {section.description}
                </p>
              )}

              {section.supporting && (
                <p
                  data-story-supporting
                  className={cn(
                    "max-w-2xl text-sm leading-7 text-gray-400 sm:text-base",
                    isStatement &&
                      "max-w-3xl text-[0.98rem] leading-8 text-gray-500",
                  )}
                >
                  {section.supporting}
                </p>
              )}
            </div>

            {hasJourney && section.journey ? (
              <div
                data-story-point
                className="border border-gray-200/80 bg-white/70 p-7 shadow-[0_24px_64px_-42px_rgba(15,23,42,0.35)] backdrop-blur-sm"
              >
                <div className="flex flex-col gap-2">
                  {section.journey.roles.map((role) => (
                    <Link
                      key={role.label}
                      href={role.href}
                      className="group flex w-full items-center justify-between border border-gray-200/90 bg-white/75 px-5 py-4 text-left transition-colors duration-200 hover:border-[var(--section-sky)] hover:bg-white"
                    >
                      <span className="text-sm font-semibold tracking-[0.02em] text-gray-700 [font-family:var(--font-cebu-story-body)]">
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
                className="flex max-w-2xl gap-4 border border-gray-200/80 bg-white/55 px-6 py-5 backdrop-blur-sm"
              >
                <div className="w-px shrink-0 bg-[var(--section-sky)]" />
                <div>
                  <p className="text-base leading-7 text-gray-700 sm:text-lg">
                    &ldquo;{section.quote.text}&rdquo;
                  </p>
                  <footer className="mt-3 text-[10px] uppercase tracking-[0.26em] text-gray-400 [font-family:var(--font-cebu-story-mono)]">
                    {section.quote.attribution}
                  </footer>
                </div>
              </blockquote>
            ) : null}

            {/* Actions */}
            <div
              className={cn(
                "mt-2 flex flex-wrap gap-3",
                isStatement && "justify-start",
              )}
            >
              {section.actions.map((action) => (
                <Link
                  key={`${section.id}-${action.label}`}
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                  data-story-action
                  className={cn(
                    "inline-flex items-center justify-center px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] transition-all duration-200 hover:-translate-y-px",
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

          {section.image && isFeature ? (
            <div
              data-story-media
              className="relative flex items-center justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-[34rem]">
                <div className="absolute -inset-6 bg-[radial-gradient(circle_at_40%_40%,var(--section-glow),transparent_70%)]" />
                <div className="relative overflow-hidden border border-white/50 bg-white/45 shadow-[0_36px_80px_-48px_rgba(15,23,42,0.5)] backdrop-blur-sm">
                  <div className="relative overflow-hidden bg-gray-100">
                    <img
                      data-story-image
                      src={section.image.src}
                      alt={section.image.alt}
                      className="h-[27rem] w-full object-cover sm:h-[32rem] lg:h-[40rem]"
                    />

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/82 to-transparent px-5 pb-5 pt-16">
                      <p className="text-[10px] leading-6 uppercase tracking-[0.22em] text-gray-400 [font-family:var(--font-cebu-story-mono)]">
                        {section.image.caption}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
