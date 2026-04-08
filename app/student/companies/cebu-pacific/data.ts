import type { Job } from "@/lib/db/db.types";

export type CompanySection = {
  eyebrow: string;
  title: string;
  body: string;
};

export type CompanyTestimonial = {
  quote: string;
  name: string;
  role: string;
};

export type CompanyDetailItem = {
  label: string;
  value: string;
};

export type CebuPacificProfile = {
  slug: string;
  name: string;
  websiteUrl: string;
  location: string;
  headline: string;
  subheadline: string;
  rotatingPhrases: string[];
  heroStats: Array<{
    label: string;
    value: string;
  }>;
  about: CompanySection;
  internCulture: CompanySection;
  testimonials: CompanyTestimonial[];
  jobDetails: CompanyDetailItem[];
  roleOverview: string[];
  whySkipResume: string[];
  listings: {
    super: Job[];
    normal: Job[];
  };
};

export const cebuPacificPrimaryListing: Job = {
  id: "pilot-cebu-pacific-super-listing",
  title: "Product & Web Interns",
  location: "Pasay, Metro Manila / Hybrid",
  description:
    "Identify one meaningful pain point in Cebu Pacific's digital experience, redesign it, and ship a working prototype that shows product judgment, interface thinking, and execution quality.",
  employer: {
    name: "Cebu Pacific",
  },
  challenge: {
    title: "Open Challenge",
    description:
      "Pick a real user pain point in Cebu Pacific's digital experience and rebuild it to feel 10x better.",
  },
  internship_preferences: {
    job_setup_ids: [],
    job_commitment_ids: [],
  },
};

export const cebuPacificNormalListing: Job = {
  id: "pilot-cebu-pacific-normal-listing",
  title: "Operations Intern",
  location: "Pasay, Metro Manila / On-site",
  description:
    "Support day-to-day coordination work that keeps internship programs, documents, and internal workflows moving smoothly across teams.",
  employer: {
    name: "Cebu Pacific",
  },
  internship_preferences: {
    job_setup_ids: [],
    job_commitment_ids: [],
  },
};

export const cebuPacificProfile: CebuPacificProfile = {
  slug: "cebu-pacific",
  name: "Cebu Pacific",
  websiteUrl: "https://www.cebupacificair.com/",
  location: "Pasay, Metro Manila",
  headline: "Make flying better for everyJuan.",
  subheadline:
    "Cebu Pacific is looking for interns who can look closely at a real travel product, spot friction that matters, and turn that insight into something useful for passengers.",
  rotatingPhrases: ["for everyJuan", "for Filipino travelers", "for OFWs"],

  about: {
    eyebrow: "About Cebu Pacific",
    title: "Let's fly every Juan",
    body: "We are the leading airline in the Philippines, operating flights to over 60 domestic and international destinations across 14 countries. But even as a leading airline, we know we can still be better. That's where you come in.",
  },
  internCulture: {
    eyebrow: "Our Intern Culture",
    title: "Interns are expected to think, not only assist.",
    body: "The Cebu Pacific super-listing format is intentionally challenge-first. Instead of filtering people through a resume screen, the team wants to see how applicants define a problem, make decisions, and follow through. That sets the tone for the internship itself: more ownership, more feedback, and work shaped around what you can actually contribute.",
  },
  testimonials: [
    {
      quote:
        "The biggest shift was realizing that people cared less about titles and more about whether your thinking held up. If your idea made sense, you were trusted to push it forward.",
      name: "Nicole S.",
      role: "Former Product Intern",
    },
    {
      quote:
        "Feedback was quick and very specific. You always knew whether something improved the passenger experience or if it was only cosmetic.",
      name: "Marco L.",
      role: "Former Web Intern",
    },
    {
      quote:
        "Once you showed that you could execute, the work stopped feeling like internship work and started feeling like real product work.",
      name: "Danica R.",
      role: "Former UX Intern",
    },
  ],
  jobDetails: [
    { label: "Role", value: "Product & Web Interns" },
    { label: "Work setup", value: "Hybrid collaboration" },
    { label: "Location", value: "Pasay, Metro Manila" },
  ],
  roleOverview: [
    "This role is for students who can notice friction, explain why it matters, and turn that insight into something concrete.",
    "The challenge-first format gives Cebu Pacific a better read on how you think across product, web, and user experience than a traditional intern screening process.",
    "Strong applicants are not rewarded for perfect polish alone. They are rewarded for judgment, initiative, and the ability to ship work that improves a real passenger flow.",
  ],
  whySkipResume: [
    "For this internship, a resume says less than the quality of your thinking. Cebu Pacific would rather review a working solution to a real passenger problem than a polished summary of class projects.",
    "The no-resume format shifts the focus toward execution, product judgment, and follow-through. That is a better signal for the kind of work this team actually needs.",
  ],
  listings: {
    super: [cebuPacificPrimaryListing],
    normal: [cebuPacificNormalListing],
  },
};
