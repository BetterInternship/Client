"use client";

import { useEffect } from "react";
import type { MutableRefObject, RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

const findScrollContainer = (node: HTMLElement): HTMLElement => {
  let current = node.parentElement;

  while (current) {
    const styles = window.getComputedStyle(current);
    const overflowY = styles.overflowY;
    const overflow = styles.overflow;
    const isScrollableStyle =
      overflowY === "auto" ||
      overflowY === "scroll" ||
      overflow === "auto" ||
      overflow === "scroll";

    if (isScrollableStyle) {
      return current;
    }

    current = current.parentElement;
  }

  return (document.scrollingElement as HTMLElement) || document.documentElement;
};

type UseHeroSceneTimelineParams = {
  rootRef: RefObject<HTMLDivElement | null>;
  heroRef: RefObject<HTMLElement | null>;
  sectionRefs: MutableRefObject<Array<HTMLElement | null>>;
  sectionCount: number;
};

let isScrollTriggerRegistered = false;
let isScrollTriggerConfigured = false;

const ensureScrollTrigger = () => {
  if (!isScrollTriggerRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    isScrollTriggerRegistered = true;
  }

  if (!isScrollTriggerConfigured) {
    ScrollTrigger.config({
      ignoreMobileResize: true,
    });
    isScrollTriggerConfigured = true;
  }
};

export const useHeroSceneTimeline = ({
  rootRef,
  heroRef,
  sectionRefs,
  sectionCount,
}: UseHeroSceneTimelineParams) => {
  useEffect(() => {
    const root = rootRef.current;
    const hero = heroRef.current;
    const firstSection = sectionRefs.current[0];

    if (!root || !hero || !firstSection) {
      return;
    }

    const reducedMotionMedia = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (reducedMotionMedia.matches) {
      return;
    }

    ensureScrollTrigger();

    const scroller = findScrollContainer(root);
    const isViewportScroller =
      scroller === document.scrollingElement ||
      scroller === document.documentElement ||
      scroller === document.body;

    const heroPlane = hero.querySelector<HTMLElement>(
      "[data-story-hero-plane]",
    );
    const heroBackground = hero.querySelector<HTMLElement>(
      "[data-story-hero-bg]",
    );
    const heroContent = hero.querySelector<HTMLElement>("[data-panel-content]");
    const heroCue = hero.querySelector<HTMLElement>(
      "[data-story-hero-chevron]",
    );
    const firstContent = firstSection.querySelector<HTMLElement>(
      "[data-story-content]",
    );
    const firstTitle =
      firstSection.querySelector<HTMLElement>("[data-story-title]");
    const firstDescription = firstSection.querySelector<HTMLElement>(
      "[data-story-description]",
    );
    const firstMedia =
      firstSection.querySelector<HTMLElement>("[data-story-media]");
    const firstImage =
      firstSection.querySelector<HTMLElement>("[data-story-image]");

    const lenis = new Lenis(
      isViewportScroller
        ? {
            smoothWheel: true,
            syncTouch: false,
            lerp: 0.2,
          }
        : {
            wrapper: scroller,
            content: root,
            smoothWheel: true,
            syncTouch: false,
            lerp: 0.2,
            gestureOrientation: "vertical",
          },
    );

    const onLenisScroll = () => {
      ScrollTrigger.update();
    };

    lenis.on("scroll", onLenisScroll);

    const lenisTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(lenisTicker);

    const ctx = gsap.context(() => {
      if (heroPlane) gsap.set(heroPlane, { x: 0, autoAlpha: 1 });
      if (heroBackground) gsap.set(heroBackground, { autoAlpha: 1 });
      if (heroContent) {
        gsap.set(heroContent, {
          transformOrigin: "left bottom",
          scale: 1,
          y: 0,
        });
      }

      if (firstContent) gsap.set(firstContent, { autoAlpha: 0, y: 34 });
      if (firstTitle) gsap.set(firstTitle, { autoAlpha: 0, y: 30 });
      if (firstDescription) gsap.set(firstDescription, { autoAlpha: 0, y: 22 });
      if (firstMedia) gsap.set(firstMedia, { autoAlpha: 0, y: 20 });
      if (firstImage) gsap.set(firstImage, { autoAlpha: 0, scale: 1.04 });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "+=180%",
          scrub: 0.35,
          pin: true,
          pinType: isViewportScroller ? "fixed" : "transform",
          anticipatePin: 1,
          invalidateOnRefresh: true,
          ...(isViewportScroller ? {} : { scroller }),
        },
      });

      timeline.addLabel("planeOut", 0);
      timeline.addLabel("textShrink", 0.55);
      timeline.addLabel("textLift", 1.02);
      timeline.addLabel("heroExit", 1.43);
      timeline.addLabel("screen1Reveal", 1.54);

      if (heroPlane) {
        timeline.to(
          heroPlane,
          {
            x: () => window.innerWidth * 1.08,
            autoAlpha: 0.88,
            duration: 0.42,
          },
          "planeOut",
        );
      }

      if (heroCue) {
        timeline.to(
          heroCue,
          {
            autoAlpha: 0,
            duration: 0.25,
          },
          "planeOut+=0.18",
        );
      }

      if (heroContent) {
        timeline.to(
          heroContent,
          {
            scale: 0.89,
            y: -18,
            duration: 0.36,
          },
          "textShrink",
        );

        timeline.to(
          heroContent,
          {
            scale: 0.75,
            y: -92,
            autoAlpha: 0.2,
            duration: 0.44,
          },
          "textLift",
        );
      }

      if (heroBackground) {
        timeline.to(
          heroBackground,
          {
            autoAlpha: 0,
            duration: 0.32,
          },
          "heroExit",
        );
      }

      if (firstContent) {
        timeline.to(
          firstContent,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
          },
          "screen1Reveal",
        );
      }

      if (firstTitle) {
        timeline.to(
          firstTitle,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.38,
          },
          "screen1Reveal+=0.06",
        );
      }

      if (firstDescription) {
        timeline.to(
          firstDescription,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.34,
          },
          "screen1Reveal+=0.12",
        );
      }

      if (firstMedia) {
        timeline.to(
          firstMedia,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.34,
          },
          "screen1Reveal+=0.12",
        );
      }

      if (firstImage) {
        timeline.to(
          firstImage,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.4,
          },
          "screen1Reveal+=0.16",
        );
      }
    }, root);

    return () => {
      ctx.revert();
      gsap.ticker.remove(lenisTicker);
      lenis.off("scroll", onLenisScroll);
      lenis.destroy();
    };
  }, [heroRef, rootRef, sectionRefs, sectionCount]);
};
