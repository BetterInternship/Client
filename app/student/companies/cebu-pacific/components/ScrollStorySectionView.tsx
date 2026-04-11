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
  const isMidScreen = isRunway || isCulture;

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
        stacked
          ? cn(
              "relative min-h-[100svh]",
              isRunway && "min-h-[120svh]",
              isNetwork && "min-h-[320svh]",
            )
          : "absolute inset-0 h-full",
        isActive ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      {isRunway ? (
        <div data-story-background className="absolute inset-0">
          <div
            data-runway-white-wash
            aria-hidden
            className="absolute inset-0 bg-[#eef2f7] opacity-0"
          />
          <div
            data-runway-grid
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(17,24,39,0.085)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,24,39,0.075)_1px,transparent_1px)] bg-[size:74px_74px] opacity-0"
          />
        </div>
      ) : isNetwork ? (
        <div data-story-background className="absolute inset-0">
          <div aria-hidden className="absolute inset-0 bg-[#eef2f7]" />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(17,24,39,0.085)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,24,39,0.075)_1px,transparent_1px)] bg-[size:74px_74px] opacity-[0.42]"
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
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(17,24,39,0.085)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,24,39,0.075)_1px,transparent_1px)] bg-[size:74px_74px] opacity-[0.42]"
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
          {isRunway ? (
            <div
              data-story-content
              className="sticky mx-auto h-[92svh] max-w-7xl order "
            >
              <h1
                data-story-title
                className="absolute max-w-[16ch] whitespace-pre-line text-left text-[length:var(--section-title-size)] leading-[1.04] tracking-[-0.02em] text-white [font-family:var(--font-cebu-story-body)] top-[5svh] "
              >
                {section.title}
              </h1>

              {section.description ? (
                <p
                  data-story-description
                  className="absolute bottom-[11svh] right-0 max-w-[16ch] whitespace-pre-line text-right text-[length:var(--section-title-size)] leading-[1.04] tracking-[-0.02em] text-slate-900 opacity-0 [font-family:var(--font-cebu-story-body)] sm:bottom-[11svh] lg:bottom-[18svh] "
                >
                  {section.description}
                </p>
              ) : null}
            </div>
          ) : isNetwork ? (
            <div
              data-story-content
              className="relative mx-auto min-h-[320svh] w-full max-w-[110rem] px-6 pb-24 pt-[12svh] sm:px-10 lg:px-16"
            >
              <div
                data-network-glow
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_var(--network-glow-x,50%)_var(--network-glow-y,30%),rgba(148,190,228,0.26)_0%,rgba(148,190,228,0.14)_20%,rgba(148,190,228,0)_56%)]"
              />

              <div
                className="sticky top-0 z-20 flex h-[100svh] items-start justify-center pt-[12svh] sm:pt-[11svh]"
              >
                <h1
                  data-story-title
                  className="max-w-none whitespace-nowrap px-4 text-center text-[clamp(1.55rem,5vw,5.6rem)] leading-[1.04] tracking-[-0.02em] text-slate-900 [font-family:var(--font-cebu-story-body)]"
                >
                  <span data-network-word data-network-word-emphasis>
                    YOU
                  </span>{" "}
                  <span data-network-word data-network-word-emphasis>
                    DEFINE
                  </span>{" "}
                  <span data-network-word data-network-word-emphasis>
                    YOUR
                  </span>{" "}
                  <span data-network-word>internship</span>
                </h1>
              </div>

              <div data-story-media className="relative z-10 min-h-[264svh]">
                <figure
                  data-story-photo
                  className="absolute left-[4%] top-[36svh] w-[74%] overflow-hidden shadow-[0_40px_86px_-52px_rgba(15,23,42,0.46)] lg:w-[61%]"
                >
                  <img
                    src="https://cabincrew24.com/wp-content/uploads/2024/01/Cathay-Pacific-Cabin-Crew-members-in-front-of-hg-1024x796.jpeg"
                    alt="Cabin crew members posing in front of aircraft."
                    className="h-full w-full object-cover"
                  />
                </figure>

                <figure
                  data-story-photo
                  className="absolute right-[4%] top-[126svh] w-[70%] overflow-hidden shadow-[0_40px_86px_-52px_rgba(15,23,42,0.45)] lg:w-[58%]"
                >
                  <img
                    src="https://cabincrew24.com/wp-content/uploads/2024/01/Cebu-Pacific-Cabin-Crew-doing-announcements.jpeg"
                    alt="Cebu Pacific cabin crew making announcements."
                    className="h-full w-full object-cover"
                  />
                </figure>

                <figure
                  data-story-photo
                  className="absolute left-[12%] top-[214svh] w-[72%] overflow-hidden shadow-[0_40px_86px_-52px_rgba(15,23,42,0.46)] lg:w-[63%]"
                >
                  <img
                    src="https://www.jgsummit.com.ph/images/2022/11/24/57e5d8a5bdd950444f0c89bfe580b5582e95a5dd.jpg"
                    alt="Cebu Pacific flight team portrait."
                    className="h-full w-full object-cover"
                  />
                </figure>
              </div>
            </div>
          ) : isMidScreen ? (
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
                  className="max-w-[13ch] whitespace-pre-line uppercase text-[length:var(--section-title-size)] leading-[0.9] tracking-[-0.02em] text-slate-950 [font-family:var(--font-cebu-story-body)]"
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
                      rel={action.external ? "noopener noreferrer" : undefined}
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
                  className="max-w-[13ch] whitespace-pre-line uppercase leading-[0.9] tracking-[-0.02em] text-white [font-family:var(--font-cebu-story-body)] text-[length:var(--section-title-size)]"
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
