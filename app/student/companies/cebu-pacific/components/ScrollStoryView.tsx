"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { ScrollStoryModel } from "../model";
import { HeroLandingView } from "./HeroLandingView";
import { ScrollStorySectionView } from "./ScrollStorySectionView";
import { useHeroSceneTimeline } from "./useHeroSceneTimeline";
import skyBgImage from "@/public/student/images/sky-bg.png";

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
              section.id === "runway" && "min-h-[170svh]",
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
            src="/student/images/sky-bg.png"
            alt=""
            className="h-full w-full object-cover opacity-70"
            data-story-boot-sky-image
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,31,64,0.42)_0%,rgba(9,31,64,0.14)_100%)]" />

        <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
          <h2
            data-story-boot-title
            className="max-w-2xl text-[clamp(1.15rem,2.2vw,2rem)] leading-[1.1] tracking-[-0.01em] text-white [font-family:var(--font-cebu-story-display)]"
          >
            Ready for your dream internship?
          </h2>
          <span data-story-boot-text className="sr-only">
            Loading
          </span>
        </div>
      </div>
    </div>
  );
}
