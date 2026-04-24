"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ScrollStoryModel } from "../model";
import { HeroLandingView } from "./HeroLandingView";
import { ScrollStorySectionView } from "./ScrollStorySectionView";
import { useHeroSceneTimeline } from "./useHeroSceneTimeline";
import skyBgImage from "@/public/student/images/sky-bg.png";
import cebuPacificLogo from "../../../super-listing/cebu-pacific/logo.png";

type ScrollStoryViewProps = {
  model: ScrollStoryModel;
  className?: string;
};

export function ScrollStoryView({ model, className }: ScrollStoryViewProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const chapterTrackRef = useRef<HTMLElement | null>(null);
  const bootOverlayRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);

  useHeroSceneTimeline({
    rootRef,
    heroRef,
    chapterTrackRef,
    bootOverlayRef,
    sectionRefs,
    sections: model.sections,
    sectionCount: model.sections.length,
    boot: model.boot,
  });

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative min-h-[100svh] overscroll-y-none border-0 outline-none bg-[#f5f7fa]",
        className,
      )}
    >
      <div className="pointer-events-none fixed -inset-x-2 -inset-y-2 z-[1] overflow-hidden">
        <img
          src={skyBgImage.src}
          alt=""
          className="h-full w-full object-cover object-bottom"
        />
      </div>

      <header className="fixed inset-x-0 top-0 z-[110] border-b border-[#2574BB]/10 bg-white/95 px-4 py-3 shadow-[0_16px_40px_-34px_rgba(19,70,111,0.35)] backdrop-blur-md sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="transition-opacity duration-200 hover:opacity-70"
            >
              <Image
                src="/BetterInternshipLogo.png"
                alt="BetterInternship"
                width={40}
                height={40}
                className="h-10 w-10 sm:h-12 sm:w-12"
              />
            </Link>

            <span className="text-xs font-semibold uppercase text-black/45">
              x
            </span>

            <Link
              href="https://www.cebupacificair.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-1 py-0.5 transition-opacity duration-200 hover:opacity-75"
            >
              <Image
                src={cebuPacificLogo}
                alt="Cebu Pacific"
                className="h-7 w-auto sm:h-8"
                priority
              />
            </Link>
          </div>
        </div>
      </header>

      {model.hero ? (
        <section ref={heroRef} className="relative z-20 h-[100svh]">
          <HeroLandingView hero={model.hero} showBackground={false} />
        </section>
      ) : null}

      <section
        ref={chapterTrackRef}
        data-story-flow="stacked"
        className="relative z-20 -mt-[58svh] border-0 outline-none pt-[58svh]"
      >
        {model.sections.map((section, index) => (
          <section
            key={section.id}
            className={cn(
              "relative min-h-[100svh]",
              section.id === "runway" && "min-h-[120svh]",
              section.id === "network" && "min-h-[120svh]",
            )}
            ref={(node) => {
              sectionRefs.current[index] = node;
            }}
          >
            <ScrollStorySectionView
              section={section}
              isActive={index === 0}
              stacked
              transparentBackground={section.backgroundMode === "sky"}
            />
          </section>
        ))}
      </section>

      <div
        ref={bootOverlayRef}
        data-story-boot-overlay
        className="fixed inset-0 z-[90] overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#6bb6e8]" />
        <div className="absolute inset-0">
          <img
            src={skyBgImage.src}
            alt=""
            className="h-full w-full object-cover opacity-70"
            data-story-boot-sky-image
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,31,64,0.42)_0%,rgba(9,31,64,0.14)_100%)]" />

        <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
          <div className="w-full max-w-2xl space-y-5">
            <h2
              data-story-boot-title
              className="text-[clamp(1.15rem,2.2vw,2rem)] leading-[1.1] tracking-[-0.01em] text-white [font-family:var(--font-cebu-story-body)]"
            >
              Ready for your dream internship?
            </h2>
            <div
              aria-hidden
              className="mx-auto h-1.5 w-full max-w-[28rem] overflow-hidden rounded-full bg-white/30"
            >
              <div
                data-story-boot-progress-bar
                className="h-full w-0 bg-white"
              />
            </div>

            <span data-story-boot-text className="sr-only">
              Loading
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
