"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { ScrollStoryModel } from "../model";
import { HeroLandingView } from "./HeroLandingView";
import { ScrollStorySectionView } from "./ScrollStorySectionView";
import { useHeroSceneTimeline } from "./useHeroSceneTimeline";

type ScrollStoryViewProps = {
  model: ScrollStoryModel;
  className?: string;
};

export function ScrollStoryView({ model, className }: ScrollStoryViewProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);

  useHeroSceneTimeline({
    rootRef,
    heroRef,
    sectionRefs,
    sectionCount: model.sections.length,
  });

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative min-h-[100svh] overscroll-y-none bg-[#f5f7fa]",
        className,
      )}
    >
      {model.hero ? (
        <section ref={heroRef} className="relative h-[100svh]">
          <HeroLandingView hero={model.hero} />
        </section>
      ) : null}

      <div className="relative">
        {model.sections.map((section, index) => (
          <section
            key={section.id}
            ref={(node) => {
              sectionRefs.current[index] = node;
            }}
          >
            <ScrollStorySectionView
              section={section}
              isActive={true}
              stacked={true}
              transparentBackground={false}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
