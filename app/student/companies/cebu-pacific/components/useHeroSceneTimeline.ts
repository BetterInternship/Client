"use client";

import { useEffect } from "react";
import type { MutableRefObject, RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type { ScrollStoryBootConfig, ScrollStorySection } from "../model";

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

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const waitForImage = (image: HTMLImageElement | null): Promise<void> => {
  if (!image) return Promise.resolve();
  if (image.complete && image.naturalWidth > 0) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const done = () => {
      image.removeEventListener("load", done);
      image.removeEventListener("error", done);
      resolve();
    };

    image.addEventListener("load", done, { once: true });
    image.addEventListener("error", done, { once: true });
  });
};

const waitForFonts = async (): Promise<void> => {
  if (!("fonts" in document)) return;

  try {
    await document.fonts.ready;
  } catch {
    // Ignore font loading errors, fallback to max wait gate.
  }
};

type StorySceneRefs = {
  root: HTMLElement;
  content: HTMLElement | null;
  title: HTMLElement | null;
  description: HTMLElement | null;
  supporting: HTMLElement | null;
  quote: HTMLElement | null;
  media: HTMLElement | null;
  image: HTMLElement | null;
  actions: HTMLElement[];
};

type UseHeroSceneTimelineParams = {
  rootRef: RefObject<HTMLDivElement | null>;
  heroRef: RefObject<HTMLElement | null>;
  chapterTrackRef: RefObject<HTMLElement | null>;
  bootOverlayRef: RefObject<HTMLDivElement | null>;
  sectionRefs: MutableRefObject<Array<HTMLElement | null>>;
  sections: ScrollStorySection[];
  sectionCount: number;
  boot?: ScrollStoryBootConfig;
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

const getSceneRefs = (root: HTMLElement): StorySceneRefs => ({
  root,
  content: root.querySelector<HTMLElement>("[data-story-content]"),
  title: root.querySelector<HTMLElement>("[data-story-title]"),
  description: root.querySelector<HTMLElement>("[data-story-description]"),
  supporting: root.querySelector<HTMLElement>("[data-story-supporting]"),
  quote: root.querySelector<HTMLElement>("[data-story-quote]"),
  media: root.querySelector<HTMLElement>("[data-story-media]"),
  image: root.querySelector<HTMLElement>("[data-story-image]"),
  actions: Array.from(
    root.querySelectorAll<HTMLElement>("[data-story-action]"),
  ),
});

type RevealSectionOptions = {
  animateRootOpacity?: boolean;
};

export const useHeroSceneTimeline = ({
  rootRef,
  heroRef,
  chapterTrackRef,
  bootOverlayRef,
  sectionRefs,
  sections,
  sectionCount,
  boot,
}: UseHeroSceneTimelineParams) => {
  useEffect(() => {
    const root = rootRef.current;
    const hero = heroRef.current;
    const chapterTrack = chapterTrackRef.current;
    const bootOverlay = bootOverlayRef.current;
    const sectionNodes = sectionRefs.current
      .slice(0, sectionCount)
      .filter((node): node is HTMLElement => Boolean(node));

    if (!root || !hero || !chapterTrack || sectionNodes.length === 0) {
      return;
    }

    const heroPlane = hero.querySelector<HTMLElement>(
      "[data-story-hero-plane]",
    );
    const heroBackground = hero.querySelector<HTMLElement>(
      "[data-story-hero-bg]",
    );
    const heroBackgroundImage = hero.querySelector<HTMLImageElement>(
      "[data-story-hero-bg-image]",
    );
    const heroPlaneImage = hero.querySelector<HTMLImageElement>(
      "[data-story-hero-plane-image]",
    );
    const heroContent = hero.querySelector<HTMLElement>("[data-panel-content]");
    const heroCue = hero.querySelector<HTMLElement>(
      "[data-story-hero-chevron]",
    );
    const bootSkyImage = bootOverlay?.querySelector<HTMLImageElement>(
      "[data-story-boot-sky-image]",
    );
    const bootTitle = bootOverlay?.querySelector<HTMLElement>(
      "[data-story-boot-title]",
    );
    const bootText = bootOverlay?.querySelector<HTMLElement>(
      "[data-story-boot-text]",
    );
    const scenes = sectionNodes.map((node) => getSceneRefs(node));

    const reducedMotionMedia = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const compactMotionMedia = window.matchMedia("(max-width: 767px)");

    if (reducedMotionMedia.matches) {
      if (bootOverlay) {
        gsap.set(bootOverlay, {
          autoAlpha: 0,
          display: "none",
          pointerEvents: "none",
        });
      }

      if (heroPlane) gsap.set(heroPlane, { clearProps: "transform,opacity" });
      if (heroBackground) gsap.set(heroBackground, { autoAlpha: 1 });
      if (heroContent) gsap.set(heroContent, { autoAlpha: 1, y: 0, scale: 1 });
      if (heroCue) gsap.set(heroCue, { autoAlpha: 1 });

      chapterTrack.style.height = "auto";
      chapterTrack.style.overflow = "visible";

      sectionNodes.forEach((sectionNode) => {
        sectionNode.style.position = "relative";
        sectionNode.style.inset = "auto";
        sectionNode.style.height = "auto";
        sectionNode.style.minHeight = "100svh";
        sectionNode.style.pointerEvents = "auto";
        gsap.set(sectionNode, { autoAlpha: 1, clearProps: "transform" });
      });

      return;
    }

    ensureScrollTrigger();

    const scroller = findScrollContainer(root);
    const isStackedFlow = chapterTrack.dataset.storyFlow === "stacked";
    const isViewportScroller =
      scroller === document.scrollingElement ||
      scroller === document.documentElement ||
      scroller === document.body;

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
    lenis.stop();

    const lenisTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(lenisTicker);

    const isCompactMotion = compactMotionMedia.matches;
    const introFromX = boot?.planeEnterFrom?.x ?? "-120vw";
    const introFromY = boot?.planeEnterFrom?.y ?? "0vh";
    const introFromScale = boot?.planeEnterFrom?.scale ?? 0.94;
    const introEnterDuration = boot?.planeEnterDuration ?? 1.15;
    const introSettleDuration = boot?.planeSettleDuration ?? 0.28;
    const overlayFadeDuration = boot?.overlayFadeDuration ?? 0.45;
    const minHoldMs = boot?.minHoldMs ?? 900;
    const maxWaitMs = boot?.maxWaitMs ?? 3000;

    let isCancelled = false;
    let introTimeline: gsap.core.Timeline | null = null;
    let heroPlaneIdleTween: gsap.core.Tween | null = null;
    let hasKilledIdleTween = false;

    const revealSection = (
      timeline: gsap.core.Timeline,
      scene: StorySceneRefs,
      sectionConfig: ScrollStorySection,
      position: number,
      options?: RevealSectionOptions,
    ) => {
      const isRunwaySection = sectionConfig.id === "runway";
      const animateRootOpacity = options?.animateRootOpacity ?? true;
      const enterConfig = sectionConfig.chapterEnter;
      const panelYPercent =
        enterConfig?.panelYPercent ?? (isCompactMotion ? 7 : 12);
      const contentY = enterConfig?.contentY ?? (isCompactMotion ? 16 : 26);
      const titleY = enterConfig?.titleY ?? (isCompactMotion ? 18 : 34);
      const descriptionY =
        enterConfig?.descriptionY ?? (isCompactMotion ? 14 : 24);
      const supportingY =
        enterConfig?.supportingY ?? (isCompactMotion ? 12 : 22);
      const quoteY = enterConfig?.quoteY ?? (isCompactMotion ? 10 : 16);
      const mediaY = enterConfig?.mediaY ?? (isCompactMotion ? 12 : 20);
      const imageScaleFrom =
        enterConfig?.imageScaleFrom ?? (isCompactMotion ? 1.03 : 1.07);
      const duration = enterConfig?.duration ?? (isCompactMotion ? 0.72 : 0.9);
      const contentDelay = isRunwaySection ? 0.08 : 0.14;
      const titleDelay = isRunwaySection ? 0.1 : 0.18;
      const descriptionDelay = isRunwaySection ? 0.14 : 0.24;
      const supportingDelay = isRunwaySection ? 0.2 : 0.3;
      const quoteDelay = isRunwaySection ? 0.24 : 0.36;
      const mediaDelay = isRunwaySection ? 0.16 : 0.22;
      const imageDelay = isRunwaySection ? 0.16 : 0.24;
      const actionsDelay = isRunwaySection ? 0.24 : 0.38;
      const panelScaleFrom = isRunwaySection ? 1 : 0.992;

      if (isRunwaySection) {
        timeline.set(
          scene.root,
          { pointerEvents: "auto", zIndex: 30 },
          position,
        );

        if (scene.content) {
          timeline.fromTo(
            scene.content,
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
            position + 0.04,
          );
        }

        if (scene.title) {
          timeline.fromTo(
            scene.title,
            { autoAlpha: 0, y: 20 },
            { autoAlpha: 1, y: 0, duration: 0.62, ease: "power3.out" },
            position + 0.1,
          );
        }

        return;
      }

      timeline.set(scene.root, { pointerEvents: "auto", zIndex: 30 }, position);
      if (animateRootOpacity) {
        timeline.fromTo(
          scene.root,
          { autoAlpha: 0, yPercent: panelYPercent, scale: panelScaleFrom },
          {
            autoAlpha: 1,
            yPercent: 0,
            scale: 1,
            duration,
            ease: "power3.out",
          },
          position,
        );
      } else {
        timeline.fromTo(
          scene.root,
          { yPercent: panelYPercent, scale: panelScaleFrom },
          {
            autoAlpha: 1,
            yPercent: 0,
            scale: 1,
            duration,
            ease: "power3.out",
          },
          position,
        );
      }

      if (scene.content) {
        timeline.fromTo(
          scene.content,
          { autoAlpha: 0, y: contentY },
          { autoAlpha: 1, y: 0, duration: 0.64, ease: "power2.out" },
          position + contentDelay,
        );
      }

      if (scene.title) {
        timeline.fromTo(
          scene.title,
          { autoAlpha: 0, y: titleY },
          { autoAlpha: 1, y: 0, duration: 0.68, ease: "power3.out" },
          position + titleDelay,
        );
      }

      if (scene.description && !isRunwaySection) {
        timeline.fromTo(
          scene.description,
          { autoAlpha: 0, y: descriptionY },
          { autoAlpha: 1, y: 0, duration: 0.54, ease: "power2.out" },
          position + descriptionDelay,
        );
      }

      if (scene.supporting) {
        timeline.fromTo(
          scene.supporting,
          { autoAlpha: 0, y: supportingY },
          { autoAlpha: 1, y: 0, duration: 0.54, ease: "power2.out" },
          position + supportingDelay,
        );
      }

      if (scene.quote) {
        timeline.fromTo(
          scene.quote,
          { autoAlpha: 0, y: quoteY },
          { autoAlpha: 1, y: 0, duration: 0.48, ease: "power2.out" },
          position + quoteDelay,
        );
      }

      if (scene.media) {
        timeline.fromTo(
          scene.media,
          { autoAlpha: 0, y: mediaY },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" },
          position + mediaDelay,
        );
      }

      if (scene.image) {
        timeline.fromTo(
          scene.image,
          { autoAlpha: 0, scale: imageScaleFrom },
          { autoAlpha: 1, scale: 1, duration: 0.68, ease: "power2.out" },
          position + imageDelay,
        );
      }

      if (scene.actions.length > 0) {
        timeline.fromTo(
          scene.actions,
          { autoAlpha: 0, y: 14 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.08,
            ease: "power2.out",
          },
          position + actionsDelay,
        );
      }
    };

    const hideSection = (
      timeline: gsap.core.Timeline,
      scene: StorySceneRefs,
      sectionConfig: ScrollStorySection,
      position: number,
    ) => {
      const exitConfig = sectionConfig.chapterExit;
      const panelYPercent =
        exitConfig?.panelYPercent ?? (isCompactMotion ? -1 : -2);
      const contentY = exitConfig?.contentY ?? (isCompactMotion ? -6 : -10);
      const titleY = exitConfig?.titleY ?? (isCompactMotion ? -14 : -24);
      const descriptionY =
        exitConfig?.descriptionY ?? (isCompactMotion ? -8 : -12);
      const supportingY =
        exitConfig?.supportingY ?? (isCompactMotion ? -7 : -10);
      const quoteY = exitConfig?.quoteY ?? (isCompactMotion ? -6 : -8);
      const mediaY = exitConfig?.mediaY ?? (isCompactMotion ? -9 : -14);
      const scaleTo = exitConfig?.scaleTo ?? (isCompactMotion ? 0.995 : 0.99);
      const opacityTo = exitConfig?.opacityTo ?? 0;
      const duration = exitConfig?.duration ?? (isCompactMotion ? 0.2 : 0.24);

      timeline.set(scene.root, { pointerEvents: "none" }, position);
      timeline.to(
        scene.root,
        {
          autoAlpha: opacityTo,
          yPercent: panelYPercent,
          scale: scaleTo,
          duration,
          ease: "power2.inOut",
        },
        position,
      );

      if (scene.title) {
        timeline.to(
          scene.title,
          { autoAlpha: 0, y: titleY, duration: 0.42, ease: "power2.inOut" },
          position + 0.04,
        );
      }

      if (scene.content) {
        timeline.to(
          scene.content,
          { autoAlpha: 0, y: contentY, duration: 0.42, ease: "power2.inOut" },
          position + 0.06,
        );
      }

      if (scene.description) {
        timeline.to(
          scene.description,
          {
            autoAlpha: 0,
            y: descriptionY,
            duration: 0.28,
            ease: "power2.inOut",
          },
          position + 0.04,
        );
      }

      if (scene.supporting) {
        timeline.to(
          scene.supporting,
          {
            autoAlpha: 0,
            y: supportingY,
            duration: 0.26,
            ease: "power2.inOut",
          },
          position + 0.05,
        );
      }

      if (scene.quote) {
        timeline.to(
          scene.quote,
          { autoAlpha: 0, y: quoteY, duration: 0.24, ease: "power2.inOut" },
          position + 0.05,
        );
      }

      if (scene.media) {
        timeline.to(
          scene.media,
          { autoAlpha: 0, y: mediaY, duration: 0.24, ease: "power2.inOut" },
          position + 0.03,
        );
      }

      if (scene.actions.length > 0) {
        timeline.to(
          scene.actions,
          {
            autoAlpha: 0,
            y: -8,
            duration: 0.22,
            stagger: 0.02,
            ease: "power2.inOut",
          },
          position + 0.03,
        );
      }
    };

    const ctx = gsap.context(() => {
      if (bootOverlay) {
        gsap.set(bootOverlay, {
          autoAlpha: 1,
          display: "block",
          pointerEvents: "auto",
        });
      }

      if (heroBackground) gsap.set(heroBackground, { autoAlpha: 1 });
      if (heroPlane) {
        gsap.set(heroPlane, {
          x: introFromX,
          y: introFromY,
          scale: introFromScale,
          autoAlpha: 0,
          transformOrigin: "50% 50%",
        });
      }

      if (heroContent) {
        gsap.set(heroContent, {
          transformOrigin: "left bottom",
          scale: 1,
          y: 18,
          autoAlpha: 0,
        });
      }
      if (heroCue) gsap.set(heroCue, { autoAlpha: 0 });

      scenes.forEach((scene, index) => {
        const sectionConfig = sections[index];
        const isRunwaySection = sectionConfig?.id === "runway";
        const isNetworkSection = sectionConfig?.id === "network";
        const isImmediateSection =
          sectionConfig?.id === "culture" || sectionConfig?.id === "final-call";
        const runwayWhiteWash = scene.root.querySelector<HTMLElement>(
          "[data-runway-white-wash]",
        );
        const runwayGrid =
          scene.root.querySelector<HTMLElement>("[data-runway-grid]");

        if (isStackedFlow) {
          gsap.set(scene.root, {
            autoAlpha: 1,
            yPercent: 0,
            scale: 1,
            pointerEvents: "auto",
            zIndex: "auto",
          });
        } else {
          gsap.set(scene.root, {
            autoAlpha: 0,
            yPercent: 0,
            scale: 1,
            pointerEvents: index === 0 ? "auto" : "none",
            zIndex: sectionCount - index,
          });
        }

        if (scene.content) {
          gsap.set(scene.content, {
            autoAlpha: isRunwaySection ? 0 : 1,
            y: isRunwaySection ? 24 : 0,
          });
        }
        if (scene.title) {
          gsap.set(scene.title, {
            autoAlpha: isRunwaySection ? 0 : 1,
            y: isRunwaySection ? 30 : 0,
            scale: 1,
          });
        }
        if (scene.description)
          gsap.set(scene.description, {
            autoAlpha: isImmediateSection ? 1 : 0,
            y: isImmediateSection ? 0 : 22,
          });
        if (scene.supporting)
          gsap.set(scene.supporting, {
            autoAlpha: isImmediateSection ? 1 : 0,
            y: isImmediateSection ? 0 : 18,
          });
        if (scene.quote)
          gsap.set(scene.quote, {
            autoAlpha: isImmediateSection ? 1 : 0,
            y: isImmediateSection ? 0 : 14,
          });
        if (scene.media) {
          gsap.set(scene.media, {
            autoAlpha: isRunwaySection ? 0 : 1,
            y: isRunwaySection ? 20 : 0,
          });
        }
        if (scene.image) {
          gsap.set(scene.image, {
            autoAlpha: isImmediateSection ? 1 : 0,
            scale: isImmediateSection ? 1 : 1.06,
          });
        }
        if (scene.actions.length > 0) {
          gsap.set(scene.actions, {
            autoAlpha: isImmediateSection ? 1 : 0,
            y: isImmediateSection ? 0 : 12,
          });
        }
        if (isNetworkSection && scene.title) {
          const networkWords = Array.from(
            scene.title.querySelectorAll<HTMLElement>("[data-network-word]"),
          );
          const networkYou =
            scene.title.querySelector<HTMLElement>("[data-network-you]");
          const networkYourInternship = scene.title.querySelector<HTMLElement>(
            "[data-network-your-internship]",
          );
          const networkDefineUnderline = scene.title.querySelector<SVGPathElement>(
            "[data-network-define-underline] path",
          );

          if (networkWords.length > 0) gsap.set(networkWords, { autoAlpha: 1, y: 0 });
          if (networkYou)
            gsap.set(networkYou, {
              backgroundImage:
                "linear-gradient(0deg, #fde047 0%, #fde047 100%)",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0% 100%",
              backgroundSize: "0% 100%",
              color: "#0f172a",
              boxShadow: "none",
            });
          if (networkYourInternship)
            gsap.set(networkYourInternship, {
              backgroundImage:
                "linear-gradient(0deg, #fde047 0%, #fde047 100%)",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0% 100%",
              backgroundSize: "0% 100%",
              color: "#0f172a",
              boxShadow: "none",
            });
          if (networkDefineUnderline) {
            const pathLength = networkDefineUnderline.getTotalLength();
            gsap.set(networkDefineUnderline, {
              strokeDasharray: pathLength,
              strokeDashoffset: pathLength,
            });
          }
        }
        if (isNetworkSection && scene.media) {
          const networkPhotos = Array.from(
            scene.media.querySelectorAll<HTMLElement>("[data-story-photo]"),
          );
          if (networkPhotos.length > 0) {
            gsap.set(networkPhotos, { autoAlpha: 0, y: 52, scale: 1.02 });
          }
        }
        if (sectionConfig?.id === "culture" && scene.title) {
          const cultureLineTwo = scene.title.querySelector<HTMLElement>(
            "[data-culture-line-two]",
          );
          const cultureGoals = scene.title.querySelector<HTMLElement>(
            "[data-culture-goals]",
          );
          const cultureTasksStrike = scene.title.querySelector<SVGPathElement>(
            "[data-culture-tasks-strike] path",
          );
          if (cultureLineTwo) {
            gsap.set(cultureLineTwo, { autoAlpha: 1, y: 0 });
          }
          if (cultureGoals) {
            gsap.set(cultureGoals, {
              backgroundSize: "100% 100%",
            });
          }
          if (cultureTasksStrike) {
            const strikeLength = cultureTasksStrike.getTotalLength();
            gsap.set(cultureTasksStrike, {
              strokeDasharray: strikeLength,
              strokeDashoffset: 0,
            });
          }
        }
        if (isNetworkSection) {
          const networkManifesto = scene.root.querySelector<HTMLElement>(
            "[data-network-manifesto]",
          );
          const networkManifestoHighlight = scene.root.querySelector<HTMLElement>(
            "[data-network-manifesto-highlight]",
          );
          if (networkManifesto) gsap.set(networkManifesto, { autoAlpha: 1, y: 0 });
          if (networkManifestoHighlight) {
            gsap.set(networkManifestoHighlight, {
              backgroundImage:
                "linear-gradient(0deg, #fde047 0%, #fde047 100%)",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0% 100%",
              backgroundSize: "0% 100%",
              color: "#0f172a",
              boxShadow: "none",
            });
          }
        }
        if (runwayWhiteWash) gsap.set(runwayWhiteWash, { autoAlpha: 0 });
        if (runwayGrid) gsap.set(runwayGrid, { autoAlpha: 0 });
      });

      introTimeline = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out" },
        onComplete: () => {
          if (heroPlane) {
            heroPlaneIdleTween = gsap.to(heroPlane, {
              y: -8,
              duration: 3.2,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            });
          }
          if (bootOverlay) {
            gsap.set(bootOverlay, {
              autoAlpha: 0,
              display: "none",
              pointerEvents: "none",
            });
          }
          lenis.start();
          ScrollTrigger.refresh();
        },
      });

      introTimeline.addLabel("bootExit", 0);

      if (bootTitle) {
        introTimeline.to(
          bootTitle,
          {
            autoAlpha: 0,
            duration: 0.26,
            ease: "power2.inOut",
          },
          "bootExit",
        );
      }

      if (bootText) {
        introTimeline.to(
          bootText,
          {
            autoAlpha: 0,
            duration: 0.24,
            ease: "power2.inOut",
          },
          "bootExit",
        );
      }

      if (bootOverlay) {
        introTimeline.to(
          bootOverlay,
          {
            autoAlpha: 0,
            duration: overlayFadeDuration,
            ease: "power2.inOut",
          },
          "bootExit",
        );
      }

      if (heroPlane) {
        introTimeline.to(
          heroPlane,
          {
            x: 0,
            y: 0,
            scale: 1,
            autoAlpha: 1,
            duration: introEnterDuration,
            ease: "power3.out",
          },
          "bootExit+=0.52",
        );

        introTimeline.to(
          heroPlane,
          {
            scale: 1.02,
            duration: introSettleDuration,
            ease: "power2.out",
          },
          ">",
        );

        introTimeline.to(
          heroPlane,
          {
            scale: 1,
            duration: 0.2,
            ease: "power1.inOut",
          },
          "<",
        );
      }

      if (heroContent) {
        introTimeline.to(
          heroContent,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.58,
          },
          "bootExit+=1.46",
        );
      }

      if (heroCue) {
        introTimeline.to(
          heroCue,
          {
            autoAlpha: 1,
            duration: 0.35,
          },
          "bootExit+=1.54",
        );
      }

      const heroTimeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.35,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (!hasKilledIdleTween && self.progress > 0.01) {
              heroPlaneIdleTween?.kill();
              hasKilledIdleTween = true;
            }
          },
          ...(isViewportScroller ? {} : { scroller }),
        },
      });

      heroTimeline.addLabel("textShift", 0.42);
      heroTimeline.addLabel("textLift", 0.82);
      heroTimeline.addLabel("heroExit", 1.35);

      if (heroCue) {
        heroTimeline.to(
          heroCue,
          {
            autoAlpha: 0,
            duration: 0.22,
          },
          "textShift",
        );
      }

      if (heroContent) {
        heroTimeline.to(
          heroContent,
          {
            y: -38,
            autoAlpha: 0.9,
            duration: 0.34,
            ease: "power2.out",
          },
          "textShift",
        );

        heroTimeline.to(
          heroContent,
          {
            y: -172,
            autoAlpha: 0,
            duration: 0.76,
            ease: "power3.inOut",
          },
          "textLift",
        );
      }

      if (heroBackground) {
        heroTimeline.to(
          heroBackground,
          {
            autoAlpha: 0.02,
            duration: 0.34,
          },
          "heroExit",
        );
      }

      if (isStackedFlow) {
        scenes.forEach((scene, index) => {
          const sectionConfig = sections[index];
          const isRunwaySection = sectionConfig.id === "runway";
          const isNetworkSection = sectionConfig.id === "network";
          const isImmediateSection =
            sectionConfig.id === "culture" || sectionConfig.id === "final-call";

          if (isNetworkSection) {
            const previousScene = scenes[index - 1];
            const runwayWhiteWash = previousScene?.root.querySelector<HTMLElement>(
              "[data-runway-white-wash]",
            );
            const runwayGrid =
              previousScene?.root.querySelector<HTMLElement>("[data-runway-grid]");
            const networkWords = scene.title
              ? Array.from(
                  scene.title.querySelectorAll<HTMLElement>("[data-network-word]"),
                )
              : [];
            const networkYou = scene.title?.querySelector<HTMLElement>(
              "[data-network-you]",
            );
            const networkYourInternship = scene.title?.querySelector<HTMLElement>(
              "[data-network-your-internship]",
            );
            const networkDefineUnderline = scene.title?.querySelector<SVGPathElement>(
              "[data-network-define-underline] path",
            );
            const networkPhotos = scene.media
              ? Array.from(
                  scene.media.querySelectorAll<HTMLElement>("[data-story-photo]"),
                )
              : [];
            const networkManifesto = scene.root.querySelector<HTMLElement>(
              "[data-network-manifesto]",
            );
            const networkManifestoHighlight = scene.root.querySelector<HTMLElement>(
              "[data-network-manifesto-highlight]",
            );
            const lockRunwayFinalState = () => {
              if (runwayWhiteWash) gsap.set(runwayWhiteWash, { autoAlpha: 1 });
              if (runwayGrid) gsap.set(runwayGrid, { autoAlpha: 0.42 });
            };

            if (runwayWhiteWash || runwayGrid) {
              ScrollTrigger.create({
                trigger: scene.root,
                start: "top bottom",
                end: "top top",
                onEnter: lockRunwayFinalState,
                onEnterBack: lockRunwayFinalState,
                onUpdate: lockRunwayFinalState,
                ...(isViewportScroller ? {} : { scroller }),
              });
            }

            gsap.set(scene.root, {
              autoAlpha: 1,
              yPercent: 0,
              scale: 1,
              pointerEvents: "auto",
            });

            if (networkWords.length > 0) {
              const headlineProgressTimeline = gsap.timeline({
                scrollTrigger: {
                  trigger: scene.root,
                  start: "top 84%",
                  end: "top 30%",
                  scrub: 0.35,
                  invalidateOnRefresh: true,
                  ...(isViewportScroller ? {} : { scroller }),
                },
              });

              if (networkYou) {
                headlineProgressTimeline.to(
                  networkYou,
                  {
                    backgroundSize: "100% 100%",
                    color: "#163c69",
                    boxShadow: "0 10px 18px -14px rgba(253,224,71,0.85)",
                    duration: 0.28,
                    ease: "power2.out",
                  },
                  0.04,
                );
              }

              if (networkDefineUnderline) {
                headlineProgressTimeline.to(
                  networkDefineUnderline,
                  {
                    strokeDashoffset: 0,
                    duration: 0.24,
                    ease: "power2.out",
                  },
                  0.4,
                );
              }

              if (networkYourInternship) {
                headlineProgressTimeline.to(
                  networkYourInternship,
                  {
                    backgroundSize: "100% 100%",
                    color: "#163c69",
                    boxShadow: "0 10px 18px -14px rgba(253,224,71,0.85)",
                    duration: 0.28,
                    ease: "power2.out",
                  },
                  0.7,
                );
              }
            }

            networkPhotos.forEach((photo, photoIndex) => {
              gsap.fromTo(
                photo,
                { autoAlpha: 0, y: 52, scale: 1.02 },
                {
                  autoAlpha: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.68,
                  ease: "power3.out",
                  scrollTrigger: {
                    trigger: photo,
                    start: "top 86%",
                    toggleActions: "play none none reverse",
                    invalidateOnRefresh: true,
                    ...(isViewportScroller ? {} : { scroller }),
                  },
                  delay: photoIndex * 0.04,
                },
              );
            });

            if (networkManifesto && networkManifestoHighlight) {
              ScrollTrigger.create({
                trigger: networkManifesto,
                start: "top 82%",
                onEnter: () => {
                  gsap.to(networkManifestoHighlight, {
                    backgroundSize: "100% 100%",
                    color: "#163c69",
                    boxShadow: "0 10px 18px -14px rgba(253,224,71,0.85)",
                    duration: 0.3,
                    ease: "power2.out",
                  });
                },
                onLeaveBack: () => {
                  gsap.to(networkManifestoHighlight, {
                    backgroundSize: "0% 100%",
                    color: "#0f172a",
                    boxShadow: "none",
                    duration: 0.18,
                    ease: "power2.out",
                  });
                },
                invalidateOnRefresh: true,
                ...(isViewportScroller ? {} : { scroller }),
              });
            }

            return;
          }

          if (isImmediateSection) {
            gsap.set(scene.root, {
              autoAlpha: 1,
              yPercent: 0,
              scale: 1,
              pointerEvents: "auto",
            });
            return;
          }

          const triggerStart = index === 0 ? "top bottom" : "top 82%";
          const sectionEnterEnd = index === 0 ? "top 24%" : "top 45%";

          const sectionEnterTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: scene.root,
              start: triggerStart,
              end: sectionEnterEnd,
              scrub: 0.36,
              invalidateOnRefresh: true,
              ...(isViewportScroller ? {} : { scroller }),
            },
          });

          revealSection(sectionEnterTimeline, scene, sectionConfig, 0, {
            animateRootOpacity: false,
          });

          if (isRunwaySection) {
            const runwayWhiteWash = scene.root.querySelector<HTMLElement>(
              "[data-runway-white-wash]",
            );
            const runwayGrid =
              scene.root.querySelector<HTMLElement>("[data-runway-grid]");
            const setRunwayInitialState = () => {
              if (runwayWhiteWash) gsap.set(runwayWhiteWash, { autoAlpha: 0 });
              if (runwayGrid) gsap.set(runwayGrid, { autoAlpha: 0 });
            };
            const setRunwayFinalState = () => {
              if (runwayWhiteWash) gsap.set(runwayWhiteWash, { autoAlpha: 1 });
              if (runwayGrid) gsap.set(runwayGrid, { autoAlpha: 0.42 });
            };

            const runwayPhaseTwo = gsap.timeline({
              scrollTrigger: {
                trigger: scene.root,
                start: "top top",
                end: "+=26%",
                scrub: 0.28,
                pin: true,
                pinType: isViewportScroller ? "fixed" : "transform",
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onLeave: setRunwayFinalState,
                onLeaveBack: setRunwayInitialState,
                onUpdate: (self) => {
                  if (self.progress >= 0.98) {
                    setRunwayFinalState();
                  } else if (self.progress <= 0.015) {
                    setRunwayInitialState();
                  }
                },
                ...(isViewportScroller ? {} : { scroller }),
              },
            });

            if (scene.description) {
              runwayPhaseTwo.fromTo(
                scene.description,
                { autoAlpha: 0, y: 28 },
                { autoAlpha: 1, y: 0, duration: 0.24, ease: "power3.out" },
                0.06,
              );
            }

            if (scene.title) {
              runwayPhaseTwo.to(
                scene.title,
                {
                  color: "#0f172a",
                  textShadow: "none",
                  duration: 0.48,
                  ease: "power2.inOut",
                },
                0.18,
              );
            }

            if (runwayWhiteWash) {
              runwayPhaseTwo.to(
                runwayWhiteWash,
                {
                  autoAlpha: 1,
                  duration: 0.56,
                  ease: "power2.inOut",
                },
                0.1,
              );
            }

            if (runwayGrid) {
              runwayPhaseTwo.to(
                runwayGrid,
                {
                  autoAlpha: 0.42,
                  duration: 0.42,
                  ease: "power2.inOut",
                },
                0.18,
              );
            }
          }

        });
      } else {
        const chapterSceneSpan = isCompactMotion ? 1.06 : 1.24;
        const chapterTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: chapterTrack,
            start: "top top",
            end: () =>
              `+=${window.innerHeight * Math.max(scenes.length, 1) * (isCompactMotion ? 1 : 1.08)}`,
            scrub: 0.42,
            pin: true,
            pinType: isViewportScroller ? "fixed" : "transform",
            anticipatePin: 1,
            invalidateOnRefresh: true,
            ...(isViewportScroller ? {} : { scroller }),
          },
        });

        revealSection(chapterTimeline, scenes[0], sections[0], 0);

        for (let index = 1; index < scenes.length; index += 1) {
          const currentPosition = chapterSceneSpan * index;
          hideSection(
            chapterTimeline,
            scenes[index - 1],
            sections[index - 1],
            currentPosition,
          );
          revealSection(
            chapterTimeline,
            scenes[index],
            sections[index],
            currentPosition + 0.04,
          );
        }
      }
    }, root);

    const runIntro = async () => {
      await Promise.all([
        Promise.race([
          Promise.all([
            waitForImage(heroBackgroundImage),
            waitForImage(heroPlaneImage),
            waitForImage(bootSkyImage),
            waitForFonts(),
          ]),
          wait(maxWaitMs),
        ]),
        wait(minHoldMs),
      ]);

      if (isCancelled) return;
      introTimeline?.play(0);
    };

    void runIntro();

    return () => {
      isCancelled = true;
      introTimeline?.kill();
      heroPlaneIdleTween?.kill();
      ctx.revert();
      gsap.ticker.remove(lenisTicker);
      lenis.off("scroll", onLenisScroll);
      lenis.destroy();
    };
  }, [
    boot,
    bootOverlayRef,
    chapterTrackRef,
    heroRef,
    rootRef,
    sectionCount,
    sectionRefs,
    sections,
  ]);
};
