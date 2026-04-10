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
};

const sections: ScrollStorySection[] = [
  {
    id: "runway",
    step: "01",
    variant: "feature",
    title: "Pick a challenge, Win an internship",
    description:
      "Resumes are a thing of the past. Cebu Pacific wants to see what you can actually do.",
    image: {
      src: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
      alt: "Placeholder photo of a passenger plane lifting above the clouds.",
      caption:
        "Placeholder aircraft photography. Swap for branded Cebu Pacific visuals later.",
    },
    quote: {
      text: "Fast-moving brands deserve landing pages that feel like departure, not documentation.",
      attribution: "Creative direction for the rebuild",
    },
    actions: sharedActions,
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
    variant: "statement",
    title: "You define your internship",
    description:
      "We don't want to limit what you can do. If you get in, we'll give you the freedom to make decisions and take initiative.",
    supporting: "We'll work together towards a common goal.",
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
    variant: "feature",
    title: "We give goals, not tasks",
    description:
      "A task list is the last thing we want to give you. As long as we establish common goals, we want you to grow and figure out the rest.",
    supporting: "Internships are learning experiences, not replays of school.",
    image: {
      src: "https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=1200&q=80",
      alt: "Placeholder photo of a plane interior and bright sky through cabin windows.",
      caption:
        "Temporary aircraft interior shot. Replace with culture or team photography when assets are ready.",
    },
    quote: {
      text: "The strongest internship pages don't just say the work matters. They stage the feeling that it does.",
      attribution: "Narrative direction for scene three",
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
    variant: "journey",
    title: "Pick your journey",
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
  hero,
  sections,
};
