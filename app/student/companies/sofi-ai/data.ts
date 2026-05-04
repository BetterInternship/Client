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

export type SofiAiProfile = {
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

export const sofiAiPrimaryListing: Job = {
  id: "pilot-sofi-ai-super-listing",
  title: "Frontend Product Engineering Intern",
  location: "Metro Manila / Hybrid",
  description:
    "Build product interfaces for a fast-growing applied AI startup, starting with a frontend for a TikTok hook-analysis backend.",
  employer: {
    name: "Sofi AI",
  },
  challenge: {
    title: "Open Challenge",
    description:
      "Build a polished interface for analyzing TikTok hooks, showing scores, retention risks, rewrite suggestions, and comparison states.",
  },
  internship_preferences: {
    job_setup_ids: [],
    job_commitment_ids: [],
  },
};

export const sofiAiMarketingListing: Job = {
  id: "pilot-sofi-ai-marketing-super-listing",
  title: "Marketing Intern",
  location: "Metro Manila / Hybrid",
  description:
    "Lead the marketing launch for GIA, SOFI AI's creator analytics product for TikTok creators in the Philippines.",
  employer: {
    name: "Sofi AI",
  },
  challenge: {
    title: "Marketing Proposal Challenge",
    description:
      "Create a marketing proposal and video pitch that shows how GIA can reach TikTok creators through clear strategy, content, and storytelling.",
  },
  internship_preferences: {
    job_setup_ids: [],
    job_commitment_ids: [],
  },
};

export const sofiAiNormalListing: Job = {
  id: "pilot-sofi-ai-normal-listing",
  title: "AI Product Operations Intern",
  location: "Metro Manila / Hybrid",
  description:
    "Support customer automation workflows, product testing, and internal systems for a fast-growing applied AI startup.",
  employer: {
    name: "Sofi AI",
  },
  internship_preferences: {
    job_setup_ids: [],
    job_commitment_ids: [],
  },
};

export const sofiAiProfile: SofiAiProfile = {
  slug: "sofi-ai",
  name: "Sofi AI",
  websiteUrl: "https://sofitech.ai/",
  location: "Metro Manila, Philippines",
  headline: "Build AI products businesses actually use.",
  subheadline:
    "Sofi AI is a fast-growing applied AI startup building tools that help businesses automate customer interactions, streamline operations, and scale with practical real-world AI.",
  rotatingPhrases: [
    "for customer conversations",
    "for business automation",
    "for real AI products",
  ],
  heroStats: [
    { label: "Platform reach", value: "Millions of users" },
    { label: "Business model", value: "Revenue-generating" },
    { label: "Startup programs", value: "Google + NVIDIA" },
  ],
  about: {
    eyebrow: "About Sofi AI",
    title: "Applied AI with real customers, real traction, and real pressure.",
    body: "Sofi AI, also known as Sofitech AI, builds AI assistants, customer support automation, and workflow tools that help businesses automate customer interactions and streamline operations. The company is already operating with millions of users across its platforms, consistent revenue generation, and recognition from global startup programs like Google for Startups and NVIDIA.",
  },
  internCulture: {
    eyebrow: "Founder-led Culture",
    title: "Move fast, build in public, and focus on execution.",
    body: "Sofi AI is led by Sophia Nicole Sy, a young Filipino founder known for building in public and actively sharing her journey in tech and startups. Her leadership gives the company a strong identity: transparent, hands-on, active in the Women in Tech and startup community, and focused on building things that actually work in the real world.",
  },
  testimonials: [
    {
      quote:
        "The team moves quickly and expects you to make the product clearer every week, not just complete tasks.",
      name: "Mika T.",
      role: "Former Product Intern",
    },
    {
      quote:
        "Working close to a founder taught me how much execution matters. Good ideas only count when users can actually use them.",
      name: "Andre L.",
      role: "Former Startup Intern",
    },
    {
      quote:
        "The feedback loop was direct, practical, and fast. I learned to design for business outcomes, not just screens.",
      name: "Patricia C.",
      role: "Former Product Design Intern",
    },
  ],
  jobDetails: [
    { label: "Work setup", value: "Hybrid collaboration" },
    { label: "Location", value: "Metro Manila" },
  ],
  roleOverview: [
    "This role is for builders who want to work inside a traction-driven AI startup, not a simulated school project.",
    "The challenge-first format helps Sofi AI evaluate product taste, interface judgment, and execution better than resume-only screening.",
    "Strong applicants show they can turn AI capabilities into clear, useful interfaces that real businesses and users can understand.",
  ],
  whySkipResume: [
    "A resume can say you know frontend development, but it does not show whether you can make AI usable for real customers.",
    "Sofi AI prioritizes demonstrated product thinking: clean flows, useful states, strong copy, and interfaces that make applied AI feel simple.",
  ],
  listings: {
    super: [sofiAiPrimaryListing, sofiAiMarketingListing],
    normal: [sofiAiNormalListing],
  },
};
