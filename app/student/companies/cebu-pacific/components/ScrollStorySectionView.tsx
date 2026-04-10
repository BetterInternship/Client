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
  "--section-title-size": string;
  "--section-description-size": string;
  "--section-supporting-size": string;
};

export function ScrollStorySectionView({
  section,
  isActive,
  stacked = false,
  transparentBackground = false,
}: ScrollStorySectionViewProps) {
  const hasJourney = Boolean(section.journey);
  const isRunway = section.id === "runway";
  const isNetwork = section.id === "network";
  const isCulture = section.id === "culture";
  const isMidScreen = isRunway || isNetwork || isCulture;

  const titleFallback = isMidScreen
    ? "clamp(3.1rem,7.4vw,7.8rem)"
    : "clamp(3rem,6.6vw,6.4rem)";
  const descriptionFallback = isMidScreen
    ? "clamp(1.02rem,1.14vw,1.18rem)"
    : "clamp(1rem,1.05vw,1.14rem)";
  const supportingFallback = isMidScreen
    ? "clamp(0.96rem,1.04vw,1.08rem)"
    : "clamp(0.92rem,1vw,1.02rem)";

  const paletteStyle: SectionPaletteVars = {
    "--section-sky": section.palette.sky,
    "--section-glow": section.palette.glow,
    "--section-accent": section.palette.accent,
    "--section-border": section.palette.border,
    "--section-title-size":
      section.typographyScale?.titleClamp ?? titleFallback,
    "--section-description-size":
      section.typographyScale?.descriptionClamp ?? descriptionFallback,
    "--section-supporting-size":
      section.typographyScale?.supportingClamp ?? supportingFallback,
  };

  return (
    <section
      style={paletteStyle}
      className={cn(
        "overflow-hidden border-0 outline-none",
        stacked ? "relative min-h-[100svh]" : "absolute inset-0 h-full",
        isActive ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      {isRunway ? (
        <div data-story-background className="absolute -inset-y-px -inset-x-2">
          <div
            data-runway-white-wash
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,#f8fafb_0%,#eff3f8_58%,#e8edf3_100%)] opacity-0"
          />
          <div
            data-runway-grid
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(17,24,39,0.085)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,24,39,0.075)_1px,transparent_1px)] bg-[size:74px_74px] opacity-0"
          />
        </div>
      ) : !transparentBackground ? (
        <div data-story-background className="absolute -inset-y-px -inset-x-2">
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,#f8fafb_0%,#eef2f7_56%,#e7ebf1_100%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(17,24,39,0.085)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,24,39,0.075)_1px,transparent_1px)] bg-[size:74px_74px] opacity-45"
          />
        </div>
      ) : (
        <div data-story-background className="absolute -inset-y-px -inset-x-2">
          <img
            src="/student/images/sky-bg.png"
            alt=""
            className="h-full w-full object-cover opacity-[0.82]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,31,64,0.38)_0%,rgba(9,31,64,0.14)_100%)]"
          />
        </div>
      )}

      <div className="relative flex h-full items-center">
        <div
          className={cn(
            "mx-auto w-full px-6 pb-14",
            stacked ? "min-h-[100svh] py-24" : "h-full",
          )}
        >
          {isMidScreen ? (
            isRunway ? (
              <div
                data-story-content
                className="sticky top-0 mx-auto h-[92svh] max-w-7xl order"
              >
                <h1
                  data-story-title
                  className="absolute  max-w-[16ch] whitespace-pre-line text-left text-[length:var(--section-title-size)] leading-[1.04] tracking-[-0.02em] text-white [font-family:var(--font-cebu-story-display)] "
                >
                  {section.title}
                </h1>

                {section.description ? (
                  <p
                    data-story-description
                    className="absolute bottom-[11svh] right-6 max-w-[16ch] whitespace-pre-line text-right text-[length:var(--section-title-size)] leading-[1.04] tracking-[-0.02em] text-slate-900 opacity-0 [font-family:var(--font-cebu-story-display)] sm:bottom-[11svh] sm:right-10 lg:bottom-[10svh] lg:right-14"
                  >
                    {section.description}
                  </p>
                ) : null}
              </div>
            ) : (
              <div
                data-story-content
                className={cn(
                  "mx-auto grid h-full max-w-6xl gap-6 border border-slate-200/90 bg-white/88 p-8 shadow-[0_32px_70px_-50px_rgba(15,23,42,0.45)] backdrop-blur-[1px] sm:p-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,0.84fr)] lg:p-14",
                  "content-center",
                )}
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="inline-block h-px w-12 bg-[var(--section-sky)] opacity-65" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--section-sky)]/80 [font-family:var(--font-cebu-story-body)]">
                      {section.step}
                    </span>
                  </div>

                  <h1
                    data-story-title
                    className="max-w-[13ch] whitespace-pre-line uppercase text-[length:var(--section-title-size)] leading-[0.9] tracking-[-0.02em] text-slate-950 [font-family:var(--font-cebu-story-display)]"
                  >
                    {section.title}
                  </h1>
                </div>

                <div className="space-y-6 lg:self-end">
                  {section.description ? (
                    <p
                      data-story-description
                      className="whitespace-pre-line text-[length:var(--section-description-size)] leading-[1.85] text-slate-700"
                    >
                      {section.description}
                    </p>
                  ) : null}

                  {section.supporting ? (
                    <p
                      data-story-supporting
                      className="whitespace-pre-line text-[length:var(--section-supporting-size)] leading-8 text-slate-500"
                    >
                      {section.supporting}
                    </p>
                  ) : null}

                  {section.quote ? (
                    <blockquote
                      data-story-quote
                      className="border-l-2 border-[var(--section-sky)]/65 bg-slate-50/90 px-5 py-4"
                    >
                      <p className="text-base leading-7 text-slate-700 sm:text-lg">
                        &ldquo;{section.quote.text}&rdquo;
                      </p>
                      <footer className="mt-3 text-[10px] uppercase tracking-[0.16em] text-slate-500 [font-family:var(--font-cebu-story-body)]">
                        {section.quote.attribution}
                      </footer>
                    </blockquote>
                  ) : null}

                  <div className="mt-1 flex flex-wrap gap-3">
                    {section.actions.map((action) => (
                      <Link
                        key={`${section.id}-${action.label}`}
                        href={action.href}
                        target={action.external ? "_blank" : undefined}
                        rel={
                          action.external ? "noopener noreferrer" : undefined
                        }
                        data-story-action
                        className={cn(
                          "inline-flex items-center justify-center px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-200 hover:-translate-y-px",
                          action.tone === "secondary"
                            ? "border border-slate-300 bg-transparent text-slate-600 hover:border-slate-400 hover:text-slate-900"
                            : "bg-[var(--section-sky)] text-white hover:brightness-110",
                        )}
                      >
                        {action.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )
          ) : (
            <div
              data-story-content
              className="mx-auto grid h-full max-w-6xl content-center gap-10 border border-white/35 bg-white/14 p-8 shadow-[0_32px_80px_-60px_rgba(3,10,26,0.6)] backdrop-blur-md sm:p-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(24rem,0.88fr)] lg:p-14"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="inline-block h-px w-10 bg-white/60" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/80 [font-family:var(--font-cebu-story-body)]">
                    {section.step}
                  </span>
                </div>

                <h1
                  data-story-title
                  className="max-w-[13ch] whitespace-pre-line uppercase leading-[0.9] tracking-[-0.02em] text-white [font-family:var(--font-cebu-story-display)] text-[length:var(--section-title-size)]"
                >
                  {section.title}
                </h1>

                {section.description ? (
                  <p
                    data-story-description
                    className="max-w-2xl whitespace-pre-line text-[length:var(--section-description-size)] leading-[1.8] text-white/86"
                  >
                    {section.description}
                  </p>
                ) : null}
              </div>

              {hasJourney && section.journey ? (
                <div
                  data-story-point
                  className="border border-white/35 bg-white/82 p-7 shadow-[0_24px_64px_-42px_rgba(15,23,42,0.35)]"
                >
                  <div className="flex flex-col gap-2">
                    {section.journey.roles.map((role) => (
                      <Link
                        key={role.label}
                        href={role.href}
                        className="group flex w-full items-center justify-between border border-slate-200 bg-white px-5 py-4 text-left transition-colors duration-200 hover:border-[var(--section-sky)]"
                      >
                        <span className="text-sm font-semibold tracking-[0.02em] text-slate-700 [font-family:var(--font-cebu-story-body)]">
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
                          className="text-slate-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[var(--section-sky)]"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-1 flex flex-wrap gap-3">
                {section.actions.map((action) => (
                  <Link
                    key={`${section.id}-${action.label}`}
                    href={action.href}
                    target={action.external ? "_blank" : undefined}
                    rel={action.external ? "noopener noreferrer" : undefined}
                    data-story-action
                    className={cn(
                      "inline-flex items-center justify-center px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-200 hover:-translate-y-px",
                      action.tone === "secondary"
                        ? "border border-white/65 bg-transparent text-white hover:border-white"
                        : "bg-white text-[#16467e] hover:bg-white/90",
                    )}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
