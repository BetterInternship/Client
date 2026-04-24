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

export type PccProfile = {
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

export const pccPrimaryListing: Job = {
  id: "pilot-pcc-super-listing",
  title: "Software Development Intern",
  location: "Makati, Metro Manila / Hybrid",
  description:
    "Identify one bottleneck Filipino MSMEs face in permits, compliance, or market access, and propose a practical digital workflow that chambers can pilot.",
  employer: {
    name: "Philippine Chamber of Commerce",
  },
  challenge: {
    title: "Open Challenge",
    description:
      "Choose one real business-friction problem and design a clearer, faster chamber-supported solution.",
  },
  internship_preferences: {
    job_setup_ids: [],
    job_commitment_ids: [],
  },
};

export const pccNormalListing: Job = {
  id: "pilot-pcc-normal-listing",
  title: "Programs and Partnerships Intern",
  location: "Makati, Metro Manila / On-site",
  description:
    "Support events, member operations, and partner coordination that strengthen services for startups and established Philippine businesses.",
  employer: {
    name: "Philippine Chamber of Commerce",
  },
  internship_preferences: {
    job_setup_ids: [],
    job_commitment_ids: [],
  },
};

export const pccProfile: PccProfile = {
  slug: "pcc",
  name: "Philippine Chamber of Commerce",
  websiteUrl: "https://www.philippinechamber.com/",
  location: "Makati, Metro Manila",
  headline: "Build systems that help Philippine businesses grow.",
  subheadline:
    "Philippine Chamber of Commerce is looking for interns who can turn policy and operations problems into practical, measurable improvements for members.",
  rotatingPhrases: [
    "for local businesses",
    "for MSMEs nationwide",
    "for exporters and founders",
  ],
  heroStats: [
    { label: "Member companies", value: "1,000+" },
    { label: "Policy dialogs yearly", value: "100+" },
    { label: "National focus", value: "Luzon, Visayas, Mindanao" },
  ],
  about: {
    eyebrow: "About Philippine Chamber of Commerce",
    title: "Bridge business realities with practical action.",
    body: "The chamber supports enterprises across industries by connecting private sector priorities with programs, partnerships, and public-sector dialogue. Internship work is not clerical by default. It is meant to improve how support is delivered to real businesses.",
  },
  internCulture: {
    eyebrow: "Intern Culture",
    title: "Interns are expected to propose and execute.",
    body: "This challenge-first format focuses on how you reason through messy constraints. You are encouraged to define a clear problem, make tradeoffs, and deliver a practical solution that stakeholders can actually use.",
  },
  testimonials: [
    {
      quote:
        "The chamber environment trained me to make recommendations executives could act on immediately, not just academic ideas.",
      name: "Alyssa M.",
      role: "Former Programs Intern",
    },
    {
      quote:
        "I learned how to convert broad policy discussions into specific workflows that saved teams time.",
      name: "Kevin R.",
      role: "Former Innovation Intern",
    },
    {
      quote:
        "Feedback was direct and useful. If a proposal was unclear, you fixed it fast and shipped the next draft.",
      name: "Trina D.",
      role: "Former Partnerships Intern",
    },
  ],
  jobDetails: [
    { label: "Work setup", value: "Hybrid collaboration" },
    { label: "Location", value: "Makati, Metro Manila" },
  ],
  roleOverview: [
    "This role is for students who can spot friction in business-facing processes and turn it into practical improvements.",
    "The challenge-first format helps the chamber evaluate judgment, structure, and follow-through better than resume-only screening.",
    "Strong applicants are rewarded for clarity, execution, and stakeholder empathy.",
  ],
  whySkipResume: [
    "A resume can summarize your background, but it does not show how you solve real business constraints. The chamber prioritizes demonstrated thinking and output.",
    "The no-resume format surfaces applicants who can move from ambiguity to concrete recommendations quickly.",
  ],
  listings: {
    super: [pccPrimaryListing],
    normal: [pccNormalListing],
  },
};
