import type gsap from "gsap";

export type ScrollStoryAction = {
  label: string;
  href: string;
  external?: boolean;
  tone?: "primary" | "secondary";
};

export type ScrollStoryHero = {
  backgroundImage: string;
  headline: string;
  subline?: string;
};

export type ScrollStoryBootConfig = {
  minHoldMs?: number;
  maxWaitMs?: number;
  planeEnterFrom?: {
    x?: string;
    y?: string;
    scale?: number;
  };
  planeEnterDuration?: number;
  planeSettleDuration?: number;
  overlayFadeDuration?: number;
};

export type ScrollStoryChapterEnterConfig = {
  panelYPercent?: number;
  contentY?: number;
  titleY?: number;
  descriptionY?: number;
  supportingY?: number;
  quoteY?: number;
  mediaY?: number;
  imageScaleFrom?: number;
  duration?: number;
};

export type ScrollStoryChapterExitConfig = {
  panelYPercent?: number;
  contentY?: number;
  titleY?: number;
  descriptionY?: number;
  supportingY?: number;
  quoteY?: number;
  mediaY?: number;
  scaleTo?: number;
  opacityTo?: number;
  duration?: number;
};

export type ScrollStoryTypographyScale = {
  titleClamp?: string;
  descriptionClamp?: string;
  supportingClamp?: string;
};

export type ScrollStoryJourneyRole = {
  label: string;
  href: string;
};

export type ScrollStorySection = {
  id: string;
  step: string;
  backgroundMode?: "panel" | "sky";
  variant?: "feature" | "statement" | "journey";
  chapterEnter?: ScrollStoryChapterEnterConfig;
  chapterExit?: ScrollStoryChapterExitConfig;
  typographyScale?: ScrollStoryTypographyScale;
  transition?: {
    enter?: {
      contentY?: number;
      titleY?: number;
      descriptionY?: number;
      supportingY?: number;
      quoteY?: number;
      mediaY?: number;
      imageScaleFrom?: number;
    };
    exit?: {
      panelYPercent?: number;
      contentY?: number;
    };
    delays?: {
      background?: number;
      content?: number;
      title?: number;
      description?: number;
      supporting?: number;
      quote?: number;
      media?: number;
      image?: number;
      actions?: number;
    };
    durations?: {
      panel?: number;
      content?: number;
      title?: number;
      description?: number;
      supporting?: number;
      quote?: number;
      media?: number;
      image?: number;
      actions?: number;
    };
  };
  title: string;
  description?: string;
  supporting?: string;
  image?: {
    src: string;
    alt: string;
    caption: string;
  };
  journey?: {
    roles: ScrollStoryJourneyRole[];
  };
  quote?: {
    text: string;
    attribution: string;
  };
  actions: ScrollStoryAction[];
  palette: {
    sky: string;
    glow: string;
    accent: string;
    border: string;
  };
};

export type ScrollStorySectionRefs = {
  root: HTMLElement;
  background: HTMLElement | null;
  overlay: HTMLElement | null;
  content: HTMLElement | null;
  title: HTMLElement | null;
  description: HTMLElement | null;
  supporting: HTMLElement | null;
  media: HTMLElement | null;
  image: HTMLImageElement | null;
  quote: HTMLElement | null;
  actions: HTMLElement[];
};

export type ScrollStoryStepContext = {
  current: ScrollStorySectionRefs;
  previous?: ScrollStorySectionRefs;
  index: number;
  total: number;
};

export type ScrollStoryStep = {
  id: string;
  label: string;
  sectionId: string;
  build: (
    timeline: gsap.core.Timeline,
    context: ScrollStoryStepContext,
  ) => void;
};

export type ScrollStoryModel = {
  brand: {
    eyebrow: string;
    name: string;
    strapline: string;
    primaryAction: ScrollStoryAction;
    secondaryAction: ScrollStoryAction;
  };
  boot?: ScrollStoryBootConfig;
  hero?: ScrollStoryHero;
  sections: ScrollStorySection[];
  steps?: ScrollStoryStep[];
};

export type ScrollStoryTransitionConfig = {
  id: string;
  label: string;
  sectionId: string;
  contentOffsetY: number;
  mediaOffsetXPercent: number;
  mediaScaleFrom: number;
  statOffsetY: number;
  pointOffsetY: number;
  previousExitYPercent: number;
  previousRotate: number;
  previousMediaXPercent: number;
};

/**
 * Helper to compute a position offset string relative to a base position.
 */
const at = (position: string | number, offset: number): string | number => {
  if (typeof position === "number") return position + offset;
  return `${position}+=${offset}`;
};

const revealSection = (
  timeline: gsap.core.Timeline,
  section: ScrollStorySectionRefs,
  config: ScrollStoryTransitionConfig,
  position: string | number,
) => {
  // Make section visible and reset overlay
  timeline.set(section.root, { zIndex: 20, autoAlpha: 1 }, position);
  if (section.overlay) {
    timeline.set(section.overlay, { autoAlpha: 0 }, position);
  }

  // 1. Physical slide-up to reveal the entire section coming from the bottom
  timeline.fromTo(
    section.root,
    { yPercent: 100 },
    {
      yPercent: 0,
      duration: 1.0,
      ease: "power3.inOut",
    },
    position,
  );

  // 2. Title fades in with a slight move up from below
  if (section.title) {
    timeline.fromTo(
      section.title,
      { y: 36, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.75,
        ease: "power3.out",
      },
      at(position, 0.4),
    );
  }

  // 3. Media flies in from way outside the screen (right)
  // Starts late enough so the wipe doesn't obscure the fast part of the ease
  if (section.media) {
    timeline.fromTo(
      section.media,
      {
        xPercent: config.mediaOffsetXPercent * 4, // Extremely far away since it's no longer horizontally clipped!
        autoAlpha: 0,
      },
      {
        xPercent: 0,
        autoAlpha: 1,
        duration: 1.1,
        ease: "power3.out",
      },
      at(position, 0.5),
    );
  }

  // 4. Image zoom-settle
  if (section.image) {
    timeline.fromTo(
      section.image,
      { scale: config.mediaScaleFrom * 1.1, autoAlpha: 0 },
      {
        scale: 1,
        autoAlpha: 1,
        duration: 1.15,
        ease: "power2.out",
      },
      at(position, 0.55),
    );
  }

  // 5. Description - simple fade in, sliding slightly up
  if (section.description) {
    timeline.fromTo(
      section.description,
      { y: 24, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: "power3.out",
      },
      at(position, 0.65),
    );
  }

  // 6. Supporting text
  if (section.supporting) {
    timeline.fromTo(
      section.supporting,
      { y: 20, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.65,
        ease: "power3.out",
      },
      at(position, 0.75),
    );
  }

  // 7. Quote
  if (section.quote) {
    timeline.fromTo(
      section.quote,
      { autoAlpha: 0, y: 16 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      },
      at(position, 1.1),
    );
  }

  // 8. Actions fade and slide in
  if (section.actions.length > 0) {
    timeline.fromTo(
      section.actions,
      { x: -24, autoAlpha: 0 },
      {
        x: 0,
        autoAlpha: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
      },
      at(position, 1.25),
    );
  }
};

const hideSection = (
  timeline: gsap.core.Timeline,
  section: ScrollStorySectionRefs,
  config: ScrollStoryTransitionConfig,
  position: string,
) => {
  // WIPE EFFECT ENHANCER: Globally darkens the previous section while the new one wipes up over it
  if (section.overlay) {
    timeline.fromTo(
      section.overlay,
      {
        autoAlpha: 0,
      },
      {
        autoAlpha: 0.85,
        duration: 0.95, // matched roughly to wipe
        ease: "expo.in", // Delays the fade heavily until the wipe is almost complete, so it doesn't darken the screen too early
      },
      position,
    );
  }

  // Text contents exit a bit more subtly now that the overlay comes up over them
  if (section.title) {
    timeline.to(
      section.title,
      {
        y: config.previousExitYPercent * 0.5,
        autoAlpha: 0,
        duration: 0.5,
        ease: "power3.inOut",
      },
      `${position}+=0.1`,
    );
  }

  if (section.description) {
    timeline.to(
      section.description,
      { y: -10, autoAlpha: 0, duration: 0.45, ease: "power3.inOut" },
      `${position}+=0.15`,
    );
  }

  if (section.supporting) {
    timeline.to(
      section.supporting,
      { y: -10, autoAlpha: 0, duration: 0.45, ease: "power3.inOut" },
      `${position}+=0.18`,
    );
  }

  if (section.quote) {
    timeline.to(
      section.quote,
      { autoAlpha: 0, duration: 0.4, ease: "power2.inOut" },
      `${position}+=0.1`,
    );
  }

  if (section.actions.length > 0) {
    timeline.to(
      section.actions,
      {
        x: -16,
        autoAlpha: 0,
        duration: 0.4,
        stagger: 0.02,
        ease: "power3.inOut",
      },
      `${position}+=0.1`,
    );
  }

  if (section.media) {
    timeline.to(
      section.media,
      {
        xPercent: 15,
        autoAlpha: 0,
        duration: 0.65,
        ease: "power3.inOut",
      },
      `${position}+=0.05`,
    );
  }

  timeline.to(
    section.root,
    {
      autoAlpha: 0,
      duration: 0.3,
      ease: "power2.in",
    },
    `${position}+=0.85`,
  );
};

export const createScrollStoryTransitionStep = (
  config: ScrollStoryTransitionConfig,
): ScrollStoryStep => ({
  id: config.id,
  label: config.label,
  sectionId: config.sectionId,
  build: (timeline, context) => {
    if (!context.previous) return;

    const position: string | number = context.index === 0 ? 0 : ">";
    const sceneLabel = `scene-${context.index}`;

    timeline.addLabel(sceneLabel, position);
    hideSection(timeline, context.previous, config, sceneLabel);
    revealSection(timeline, context.current, config, `${sceneLabel}+=0.02`);
  },
});
