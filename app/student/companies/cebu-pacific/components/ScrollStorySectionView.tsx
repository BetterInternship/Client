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
  const isFinalCall = section.id === "final-call";
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
              isNetwork && "min-h-[120svh]",
            )
          : "absolute inset-0 h-full",
        stacked
          ? "pointer-events-auto"
          : isActive
            ? "pointer-events-auto"
            : "pointer-events-none",
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
        <div data-story-background className="absolute inset-0">
          <div aria-hidden className="absolute inset-0 bg-[#eef2f7]" />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(17,24,39,0.085)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,24,39,0.075)_1px,transparent_1px)] bg-[size:74px_74px] opacity-[0.42]"
          />
        </div>
      ) : (
        <div data-story-background className="absolute inset-0">
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
            stacked
              ? isCulture
                ? "h-[100svh] py-0 pb-0"
                : isFinalCall
                  ? "h-[100svh] py-0 pb-0"
                  : "min-h-[100svh] py-24"
              : "h-full",
          )}
        >
          {isRunway ? (
            <div
              data-story-content
              className="sticky mx-auto h-[92svh] max-w-7xl order "
            >
              <h1
                data-story-title
                className="absolute max-w-[16ch] whitespace-pre-line text-left text-[length:var(--section-title-size)] leading-[1.04] tracking-[-0.02em] text-white [font-family:var(--font-cebu-story-body)] top-[5svh] left-[5svw]"
              >
                {section.title}
              </h1>

              {section.description ? (
                <p
                  data-story-description
                  className="absolute bottom-[11svh] right-[5svw] max-w-[16ch] whitespace-pre-line text-right text-[length:var(--section-title-size)] leading-[1.04] tracking-[-0.02em] text-slate-900 opacity-0 [font-family:var(--font-cebu-story-body)] sm:bottom-[11svh] lg:bottom-[18svh] "
                >
                  {section.description}
                </p>
              ) : null}
            </div>
          ) : isNetwork ? (
            <div
              data-story-content
              className="relative mx-auto min-h-[120svh] w-full max-w-[110rem] px-6 pb-24 pt-[12svh] sm:px-10 lg:px-16"
            >
              <div className="relative z-20 flex w-full items-start justify-start">
                <h1
                  data-story-title
                  className="max-w-none whitespace-nowrap text-left text-[clamp(1.55rem,5vw,5.6rem)] text-slate-900 [font-family:var(--font-cebu-story-body)]"
                >
                  <span
                    data-network-word
                    data-network-you
                    className="inline-block whitespace-nowrap bg-transparent px-3 pb-1 font-semibold tracking-[-0.012em] text-slate-900 shadow-none"
                  >
                    You
                  </span>{" "}
                  <span
                    data-network-word
                    data-network-define
                    className="relative"
                  >
                    define
                    <svg
                      data-network-define-underline
                      aria-hidden
                      viewBox="0 0 120 14"
                      className="absolute -bottom-[0.06em] left-0 h-[0.23em] w-full"
                      fill="none"
                    >
                      <path
                        d="M3 8 C24 3, 47 12, 69 8 C87 5, 104 10, 117 7"
                        stroke="#1d7fe6"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>{" "}
                  <span
                    data-network-word
                    data-network-your-internship
                    className="inline-block whitespace-nowrap bg-transparent px-3 pb-1 font-semibold tracking-[-0.012em] text-slate-900 shadow-none"
                  >
                    your internship
                  </span>
                </h1>
              </div>

              <div data-story-media className="relative z-10 min-h-[206svh]">
                <figure
                  data-story-photo
                  className="absolute left-[0%] top-[10svh] w-[80%] overflow-hidden shadow-[0_40px_86px_-52px_rgba(15,23,42,0.46)] lg:w-[80%]"
                >
                  <img
                    src="https://cabincrew24.com/wp-content/uploads/2024/01/Cathay-Pacific-Cabin-Crew-members-in-front-of-hg-1024x796.jpeg"
                    alt="Cabin crew members posing in front of aircraft."
                    className="h-full w-full object-cover"
                  />
                </figure>

                <figure
                  data-story-photo
                  className="absolute right-[0%] top-[86svh] w-[76%] overflow-hidden shadow-[0_40px_86px_-52px_rgba(15,23,42,0.45)] lg:w-[80%]"
                >
                  <img
                    src="https://cabincrew24.com/wp-content/uploads/2024/01/Cebu-Pacific-Cabin-Crew-doing-announcements.jpeg"
                    alt="Cebu Pacific cabin crew making announcements."
                    className="h-full w-full object-cover"
                  />
                </figure>

                <figure
                  data-story-photo
                  className="absolute left-[10%] top-[156svh] w-[74%] overflow-hidden shadow-[0_40px_86px_-52px_rgba(15,23,42,0.46)] lg:w-[76%]"
                >
                  <img
                    src="https://www.jgsummit.com.ph/images/2022/11/24/57e5d8a5bdd950444f0c89bfe580b5582e95a5dd.jpg"
                    alt="Cebu Pacific flight team portrait."
                    className="h-full w-full object-cover"
                  />
                </figure>
              </div>

              <div className="relative z-20 mt-10 flex w-full justify-end">
                <p
                  data-network-manifesto
                  className="w-[min(96vw,62rem)] max-w-none text-right text-[clamp(1.55rem,5vw,5.6rem)] leading-[1.04] tracking-[-0.02em] text-slate-900 [font-family:var(--font-cebu-story-body)]"
                >
                  <span
                    data-network-manifesto-highlight
                    className="inline-block whitespace-nowrap bg-transparent px-3 pb-1 font-semibold tracking-[-0.012em] text-slate-900 shadow-none"
                  >
                    We&apos;ll give you the freedom
                  </span>{" "}
                  to make decisions and take initiative.
                </p>
              </div>
            </div>
          ) : isCulture ? (
            <div
              data-story-content
              className="mx-auto flex h-[100svh] w-full max-w-none items-center justify-center"
            >
              <h1
                data-story-title
                className="text-center text-[clamp(2.4rem,7.2vw,7rem)] leading-[0.9] tracking-[-0.03em] text-slate-950 [font-family:var(--font-cebu-story-body)]"
              >
                <span className="block whitespace-nowrap">
                  We don&apos;t give{" "}
                  <span
                    data-culture-tasks
                    className="relative inline-block overflow-visible px-[0.08em] text-slate-950"
                  >
                    TASKS
                    <svg
                      data-culture-tasks-strike
                      aria-hidden
                      viewBox="0 0 120 14"
                      className="absolute left-0 top-1/2 h-[0.34em] w-full -translate-y-1/2"
                      fill="none"
                    >
                      <path
                        d="M2 8 C20 1, 43 14, 66 8 C86 3, 104 13, 118 7"
                        stroke="#dc2626"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </span>
                <span
                  data-culture-line-two
                  className="block whitespace-nowrap opacity-0"
                >
                  We give{" "}
                  <span
                    data-culture-goals
                    className="inline-block bg-[linear-gradient(0deg,#fde047_0%,#fde047_100%)] bg-[length:0%_100%] bg-no-repeat px-[0.08em] text-[#163c69]"
                  >
                    GOALS
                  </span>
                  .
                </span>
              </h1>
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
          ) : isFinalCall ? (
            <div
              data-story-content
              className="mx-auto flex h-[100svh] w-full max-w-[1280px] flex-col justify-between px-4 pb-6 pt-6 text-slate-100 box-border sm:px-8 lg:px-10 lg:pt-8"
            >
              <div className="px-1 pb-6 pt-8 sm:pt-10 lg:pt-12">
                <h1
                  data-story-title
                  className="max-w-[24ch] whitespace-nowrap text-[clamp(2.15rem,7.8vw,5.9rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-slate-200 [font-family:var(--font-cebu-story-body)]"
                >
                  <span className="inline-block whitespace-nowrap">
                    Define{" "}
                    <span data-final-your className="relative inline-block">
                      your
                      <svg
                        data-final-your-underline
                        aria-hidden
                        viewBox="0 0 120 14"
                        className="absolute -bottom-[0.12em] left-0 h-[0.23em] w-full"
                        fill="none"
                      >
                        <path
                          d="M3 8 C24 3, 47 12, 69 8 C87 5, 104 10, 117 7"
                          stroke="#fde047"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>{" "}
                    journey
                  </span>
                  <span className="block text-[clamp(2.15rem,7.8vw,4rem)] mt-4">
                    with{" "}
                    <span className="whitespace-nowrap">Cebu Pacific.</span>
                  </span>
                </h1>
              </div>

              {hasJourney && section.journey ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-end px-1">
                    <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/72 [font-family:var(--font-cebu-story-body)]">
                      Scroll to explore
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="m13 6 6 6-6 6" />
                      </svg>
                    </span>
                  </div>
                  <div
                    data-story-point
                    className="overflow-x-hidden overflow-y-visible pb-2"
                  >
                    <div
                      data-journey-rail-track
                      className="flex min-w-max gap-4 pl-6 pr-10"
                    >
                      {section.journey.roles.map((role) => (
                        <Link
                          key={role.label}
                          href={role.href}
                          className="group block w-[min(78vw,430px)] shrink-0"
                        >
                          <div className="flex min-h-[320px] flex-col justify-between border border-white/18 bg-white/42 p-6 backdrop-blur-[12px] transition-colors duration-300 hover:border-white/60 hover:bg-white group-hover:border-white/60 group-hover:bg-white">
                            <h3 className="whitespace-pre-line text-[clamp(1.6rem,3.4vw,2.6rem)] font-semibold leading-[0.92] tracking-[-0.02em] text-white transition-colors duration-300 hover:text-[#16467e] group-hover:text-[#16467e] [font-family:var(--font-cebu-story-body)]">
                              {role.label}
                            </h3>
                            <p className="text-[11px] uppercase tracking-[0.14em] text-white/80 transition-colors duration-300 hover:text-[#16467e]/80 group-hover:text-[#16467e]/80 [font-family:var(--font-cebu-story-body)]">
                              View details
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
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
