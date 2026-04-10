import {
  type ScrollStoryAction,
  type ScrollStoryHero,
  type ScrollStoryModel,
  type ScrollStorySection,
} from "./model";

const sharedActions: ScrollStoryAction[] = [
  {
    label: "Visit Cebu Pacific",
    href: "https://www.cebupacificair.com/",
    external: true,
    tone: "secondary",
  },
];

const hero: ScrollStoryHero = {
  backgroundImage:
    "https://www.jgsummit.com.ph/images/2024/02/01/27a2535d4a430089d6b5cde4cf3d8e580cae419d.jpg",
  headline: "Have you ever wanted to ________?",
  subline: "Challenge-first internship experience",
};

const sections: ScrollStorySection[] = [
  {
    id: "runway",
    step: "01",
    backgroundMode: "sky",
    variant: "statement",
    title: "Resumes are a thing of the past.",
    description: "Cebu Pacific wants to see what you can actually do.",
    chapterEnter: {
      panelYPercent: 0,
      titleY: 14,
      descriptionY: 26,
      contentY: 8,
      duration: 0.92,
    },
    chapterExit: {
      panelYPercent: -3,
      scaleTo: 1,
      opacityTo: 0,
      duration: 0.4,
    },
    typographyScale: {
      titleClamp: "clamp(2rem,4.5vw,4.5rem)",
      descriptionClamp: "clamp(1.2rem,2.1vw,2.4rem)",
    },
    actions: [],
    palette: {
      sky: "#1a8fd8",
      glow: "rgba(26, 143, 216, 0.08)",
      accent: "#1a8fd8",
      border: "rgba(0, 0, 0, 0.08)",
    },
  },
  {
    id: "network",
    step: "02",
    backgroundMode: "panel",
    variant: "statement",
    title: "You define\nyour internship.",
    description:
      "We don't want to limit what you can do. If you get in, we'll give you the freedom to make decisions and take initiative.",
    supporting: "We'll work together toward one goal.",
    quote: {
      text: "Ownership starts early here. Interns are trusted to shape real decisions.",
      attribution: "Former Product Intern",
    },
    chapterEnter: {
      panelYPercent: 10,
      titleY: 34,
      duration: 0.88,
    },
    chapterExit: {
      panelYPercent: -9,
      scaleTo: 0.972,
      opacityTo: 0,
      duration: 0.64,
    },
    typographyScale: {
      titleClamp: "clamp(3.6rem,8.4vw,8.6rem)",
      descriptionClamp: "clamp(1.08rem,1.26vw,1.28rem)",
      supportingClamp: "clamp(0.98rem,1.12vw,1.1rem)",
    },
    actions: sharedActions,
    palette: {
      sky: "#0e7adf",
      glow: "rgba(14, 122, 223, 0.08)",
      accent: "#0e7adf",
      border: "rgba(0, 0, 0, 0.08)",
    },
  },
  {
    id: "culture",
    step: "03",
    backgroundMode: "panel",
    variant: "statement",
    title: "We give goals,\nnot tasks.",
    description:
      "A task list is the last thing we want to give you. As long as we establish common goals, we want you to grow and figure out the rest.",
    supporting: "Internships are learning experiences, not replays of school.",
    chapterEnter: {
      panelYPercent: 12,
      titleY: 34,
      mediaY: 16,
      imageScaleFrom: 1.07,
      duration: 0.9,
    },
    chapterExit: {
      panelYPercent: -8,
      scaleTo: 0.97,
      opacityTo: 0,
      duration: 0.64,
    },
    typographyScale: {
      titleClamp: "clamp(3rem,6.4vw,6.2rem)",
      descriptionClamp: "clamp(1rem,1.05vw,1.12rem)",
    },
    quote: {
      text: "Strong interns are not assigned tiny tasks - they are trusted with outcomes.",
      attribution: "Team mentorship principle",
    },
    actions: sharedActions,
    palette: {
      sky: "#1b5b9d",
      glow: "rgba(27, 91, 157, 0.08)",
      accent: "#1b5b9d",
      border: "rgba(0, 0, 0, 0.08)",
    },
  },
  {
    id: "final-call",
    step: "04",
    backgroundMode: "sky",
    variant: "journey",
    title: "Pick\nyour journey.",
    chapterEnter: {
      panelYPercent: 9,
      titleY: 30,
      duration: 0.84,
    },
    typographyScale: {
      titleClamp: "clamp(3.4rem,8.2vw,8rem)",
    },
    journey: {
      roles: [
        {
          label: "Flight Operations Intern",
          href: "#",
        },
        {
          label: "Digital Product Design Intern",
          href: "#",
        },
        {
          label: "Data Analytics Intern",
          href: "#",
        },
      ],
    },
    actions: sharedActions,
    palette: {
      sky: "#16467e",
      glow: "rgba(22, 70, 126, 0.08)",
      accent: "#16467e",
      border: "rgba(0, 0, 0, 0.08)",
    },
  },
];

export const cebuPacificStoryModel: ScrollStoryModel = {
  brand: {
    eyebrow: "BetterInternship x Cebu Pacific",
    name: "Cebu Pacific",
    strapline:
      "A cinematic airline company page that pins the viewport and turns scroll into a flight path.",
    primaryAction: sharedActions[0],
    secondaryAction: sharedActions[0],
  },
  boot: {
    minHoldMs: 1500,
    maxWaitMs: 3000,
    planeEnterFrom: {
      x: "-120vw",
      y: "0vh",
      scale: 0.94,
    },
    planeEnterDuration: 1.15,
    planeSettleDuration: 0.28,
    overlayFadeDuration: 0.45,
  },
  hero,
  sections,
};
