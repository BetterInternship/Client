"use client";

import {
  startTransition,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import type { ScrollStoryModel, ScrollStorySectionRefs } from "../model";
import { ScrollStorySectionView } from "./ScrollStorySectionView";
import { HeroLandingView } from "./HeroLandingView";

gsap.registerPlugin(ScrollTrigger);

type ScrollStoryViewProps = {
  model: ScrollStoryModel;
  className?: string;
};

const SCROLL_VH_PER_TRANSITION = 95;
const HERO_SCROLL_VH = 100;

const resolveSectionRefs = (root: HTMLElement): ScrollStorySectionRefs => ({
  root,
  overlay: root.querySelector<HTMLElement>("[data-story-overlay]"),
  content: root.querySelector<HTMLElement>("[data-story-content]"),
  title: root.querySelector<HTMLElement>("[data-story-title]"),
  description: root.querySelector<HTMLElement>("[data-story-description]"),
  supporting: root.querySelector<HTMLElement>("[data-story-supporting]"),
  media: root.querySelector<HTMLElement>("[data-story-media]"),
  image: root.querySelector<HTMLImageElement>("[data-story-image]"),
  stats: Array.from(root.querySelectorAll<HTMLElement>("[data-story-stat]")),
  points: Array.from(root.querySelectorAll<HTMLElement>("[data-story-point]")),
  quote: root.querySelector<HTMLElement>("[data-story-quote]"),
  actions: Array.from(
    root.querySelectorAll<HTMLElement>("[data-story-action]"),
  ),
});

export function ScrollStoryView({ model, className }: ScrollStoryViewProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const activeIndexRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const hasHero = Boolean(model.hero);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setReducedMotion(mediaQuery.matches);
    };

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const root = rootRef.current;

    if (!viewport || !root || reducedMotion) {
      return;
    }

    const sectionElements = sectionRefs.current
      .slice(0, model.sections.length)
      .filter((section): section is HTMLElement => Boolean(section));

    if (sectionElements.length === 0) {
      return;
    }

    const context = gsap.context(() => {
      const sections = sectionElements.map(resolveSectionRefs);
      const firstSection = sections[0];

      // ─── Hero exit animation ───
      if (hasHero) {
        const heroEl = root.querySelector<HTMLElement>("[data-story-hero]");
        const heroBg = root.querySelector<HTMLElement>("[data-story-hero-bg]");
        const heroHeadline = root.querySelector<HTMLElement>(
          "[data-story-hero-headline]",
        );
        const heroChevron = root.querySelector<HTMLElement>(
          "[data-story-hero-chevron]",
        );

        if (heroEl) {
          const heroTimeline = gsap.timeline({
            scrollTrigger: {
              scroller: viewport,
              trigger: root,
              start: "top top",
              end: `${HERO_SCROLL_VH}vh top`,
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          });

          heroTimeline.to(
            heroEl,
            {
              yPercent: -100,
              duration: 1,
              ease: "power2.inOut",
            },
            0,
          );

          if (heroBg) {
            heroTimeline.to(
              heroBg,
              {
                autoAlpha: 0,
                duration: 0.8,
                ease: "power2.in",
              },
              0.1,
            );
          }

          if (heroHeadline) {
            heroTimeline.to(
              heroHeadline,
              {
                y: -60,
                autoAlpha: 0,
                duration: 0.6,
                ease: "power3.in",
              },
              0,
            );
          }

          if (heroChevron) {
            heroTimeline.to(
              heroChevron,
              {
                autoAlpha: 0,
                duration: 0.3,
                ease: "power2.in",
              },
              0,
            );
          }
        }
      }

      // ─── Section setup ───
      sectionElements.forEach((sectionElement, index) => {
        const section = sections[index];
        const isFirst = index === 0;

        gsap.set(sectionElement, {
          autoAlpha: isFirst ? 1 : 0,
          zIndex: isFirst ? 10 : 1,
        });

        if (section.overlay) {
          gsap.set(section.overlay, { autoAlpha: 0, yPercent: 100 });
        }

        // Title
        if (section.title) {
          gsap.set(section.title, {
            y: isFirst ? 0 : 36,
            autoAlpha: isFirst ? 0 : 0,
          });
        }

        // Description & supporting
        if (section.description) {
          gsap.set(section.description, {
            y: isFirst ? 0 : 24,
            autoAlpha: isFirst ? 1 : 0,
          });
        }
        if (section.supporting) {
          gsap.set(section.supporting, {
            y: isFirst ? 0 : 20,
            autoAlpha: isFirst ? 1 : 0,
          });
        }

        // Stats
        gsap.set(section.stats, {
          y: isFirst ? 0 : 30,
          autoAlpha: isFirst ? 0 : 0,
        });

        // Points
        gsap.set(section.points, {
          y: isFirst ? 0 : 30,
          autoAlpha: isFirst ? 0 : 0,
        });

        // Quote
        if (section.quote) {
          gsap.set(section.quote, {
            autoAlpha: 0,
            y: 16,
          });
        }

        // Actions
        gsap.set(section.actions, {
          x: isFirst ? 0 : -24,
          autoAlpha: isFirst ? 0 : 0,
        });

        // Media — hidden way off to the right
        if (section.media) {
          gsap.set(section.media, {
            xPercent: 110,
            autoAlpha: isFirst ? 0 : 0,
          });
        }

        if (section.image) {
          gsap.set(section.image, {
            scale: isFirst ? 1.15 : 1.1,
            autoAlpha: 0,
          });
        }
      });

      // ─── First section intro — sequential element-by-element ───
      if (firstSection) {
        const intro = gsap.timeline({
          defaults: { ease: "power3.out" },
        });

        // 1. Title slides up from below — first thing visible
        if (firstSection.title) {
          intro.fromTo(
            firstSection.title,
            { y: 36, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.9 },
            0,
          );
        }

        // 2. Media flies in from way outside screen
        if (firstSection.media) {
          intro.fromTo(
            firstSection.media,
            { xPercent: 110, autoAlpha: 0 },
            {
              xPercent: 0,
              autoAlpha: 1,
              duration: 1.1,
            },
            0.2,
          );
        }

        // 3. Image zoom-settle
        if (firstSection.image) {
          intro.fromTo(
            firstSection.image,
            { scale: 1.25, autoAlpha: 0 },
            {
              scale: 1,
              autoAlpha: 1,
              duration: 1.2,
              ease: "power2.out",
            },
            0.25,
          );
        }

        // 4. Description fade up
        if (firstSection.description) {
          intro.fromTo(
            firstSection.description,
            { y: 24, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.9,
              ease: "power3.out",
            },
            0.6,
          );
        }

        // 5. Supporting fade up
        if (firstSection.supporting) {
          intro.fromTo(
            firstSection.supporting,
            { y: 20, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.9,
              ease: "power3.out",
            },
            0.75,
          );
        }

        // 6. Stats stagger
        if (firstSection.stats.length > 0) {
          intro.fromTo(
            firstSection.stats,
            { y: 30, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.6,
              stagger: 0.12,
            },
            0.9,
          );
        }

        // 7. Points stagger in
        if (firstSection.points.length > 0) {
          intro.fromTo(
            firstSection.points,
            { y: 30, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.65,
              stagger: 0.13,
            },
            1.05,
          );
        }

        // 8. Quote fades in
        if (firstSection.quote) {
          intro.fromTo(
            firstSection.quote,
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            1.2,
          );
        }

        // 9. Actions slide in from left
        if (firstSection.actions.length > 0) {
          intro.fromTo(
            firstSection.actions,
            { x: -24, autoAlpha: 0 },
            {
              x: 0,
              autoAlpha: 1,
              duration: 0.5,
              stagger: 0.1,
            },
            1.3,
          );
        }
      }

      // ─── Scroll-driven section transitions ───
      const scrollStart = hasHero ? `${HERO_SCROLL_VH}vh top` : "top top";

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
        scrollTrigger: {
          scroller: viewport,
          trigger: root,
          start: scrollStart,
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const nextIndex =
              model.sections.length > 1
                ? Math.round(self.progress * (model.sections.length - 1))
                : 0;

            if (nextIndex === activeIndexRef.current) {
              return;
            }

            activeIndexRef.current = nextIndex;
            startTransition(() => {
              setActiveIndex(nextIndex);
            });
          },
        },
      });

      model.steps.forEach((step, index) => {
        const sectionIndex = model.sections.findIndex(
          (section) => section.id === step.sectionId,
        );

        if (sectionIndex < 1) {
          return;
        }

        step.build(timeline, {
          current: sections[sectionIndex],
          previous: sections[sectionIndex - 1],
          index,
          total: model.steps.length,
        });
      });
    }, viewport);

    return () => {
      context.revert();
    };
  }, [model, reducedMotion, hasHero]);

  const heroVh = hasHero ? HERO_SCROLL_VH : 0;
  const rootHeightVh =
    100 +
    heroVh +
    Math.max(model.sections.length - 1, 0) * SCROLL_VH_PER_TRANSITION;

  return (
    <div className={cn("relative h-full min-h-0 overflow-hidden", className)}>
      <div
        ref={viewportRef}
        data-cebu-scroll-story-scroller="true"
        className="h-full overflow-x-hidden overflow-y-auto"
      >
        <main
          ref={rootRef}
          className="relative bg-[#f5f7fa] text-gray-900"
          style={reducedMotion ? undefined : { height: `${rootHeightVh}vh` }}
        >
          <div
            className={cn(
              reducedMotion
                ? "relative"
                : "sticky top-0 h-screen overflow-hidden",
            )}
          >
            <div className="relative h-full">
              {/* Hero Landing */}
              {model.hero && !reducedMotion ? (
                <HeroLandingView hero={model.hero} />
              ) : null}

              {reducedMotion ? (
                <div className="relative space-y-0">
                  {model.sections.map((section, index) => (
                    <div
                      key={section.id}
                      ref={(node) => {
                        sectionRefs.current[index] = node;
                      }}
                    >
                      <ScrollStorySectionView
                        section={section}
                        isActive={true}
                        stacked={true}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="absolute inset-0">
                  {model.sections.map((section, index) => (
                    <div
                      key={section.id}
                      ref={(node) => {
                        sectionRefs.current[index] = node;
                      }}
                      className={cn(
                        "absolute inset-0",
                        index === activeIndex
                          ? "pointer-events-auto"
                          : "pointer-events-none",
                      )}
                    >
                      <ScrollStorySectionView
                        section={section}
                        isActive={index === activeIndex}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <style jsx global>{`
        [data-cebu-scroll-story-scroller="true"] {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        [data-cebu-scroll-story-scroller="true"]::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
