export type Job = {
  id: string;
  company: string;
  title: string;
  href: string;
  pay?: string;
  location?: string;
  workload?: string;
  badge?: string;
  tags: string[];
};

export const JOBS: Job[] = [
  {
    id: "manulife",
    company: "ManuLife",
    title: "Associate Full Stack Engineer",
    href: "/search/4952d62a-2d2c-456c-8fab-38e75ece9019",
    location: "Hybrid",
    workload: "Full-time",
    badge: "DLSU MOA",
    tags: ["DLSU MOA", "Full-time", "Hybrid"],
  },
  {
    id: "sunlife",
    company: "Sun Life Philippines",
    title: "Marketing Assistant",
    href: "/search/b14487ea-8444-49b1-adfa-25c0a361befa",
    pay: "₱10,000/month",
    location: "Hybrid (BGC)",
    workload: "Full-time",
    badge: "DLSU MOA",
    tags: ["DLSU MOA", "Full-time", "Hybrid (BGC)", "₱10,000/month"],
  },
  {
    id: "oracle",
    company: "Oracle",
    title: "Software Developer Intern",
    href: "/search/770562a8-3a38-4bcb-a72f-bf5ae703833c",
    pay: "₱14,000/month",
    location: "Onsite",
    workload: "Full-time",
    badge: "DLSU MOA",
    tags: ["DLSU MOA", "Full-time", "Onsite", "₱14,000/month"],
  },
  {
    id: "alaska",
    company: "Alaska Milk Corporation",
    title: "Internship — Marketing",
    href: "/search/770562a8-3a38-4bcb-a72f-bf5ae703833c",
    pay: "₱720/day",
    location: "Hybrid",
    workload: "Full-time",
    badge: "DLSU MOA",
    tags: ["DLSU MOA", "Full-time", "Hybrid", "₱720/day"],
  },
  {
    id: "jollibee",
    company: "Jollibee",
    title: "Marketing Internship",
    href: "/search/7828346a-b1c5-4f03-8e15-459d31fb4d9f",
    pay: "₱2,600/week",
    location: "Hybrid",
    workload: "Full-time",
    badge: "DLSU MOA",
    tags: ["DLSU MOA", "Full-time", "Hybrid", "₱2,600/week"],
  },
  {
    id: "aim",
    company: "Asian Institute of Management",
    title: "HR Intern",
    href: "/search/56ca46aa-0b6f-485b-ac0e-92fcac316d54",
    location: "Onsite (Makati)",
    workload: "Full-time",
    badge: "DLSU MOA",
    tags: ["DLSU MOA", "Full-time", "Onsite (Makati)"],
  },
  {
    id: "giftaway",
    company: "Giftaway",
    title: "Software Engineer Intern",
    href: "/search/1223f377-22cc-43e8-b132-a635d879a374",
    pay: "₱400/day",
    location: "Hybrid",
    workload: "Full-time",
    badge: "DLSU MOA",
    tags: ["DLSU MOA", "Full-time", "Hybrid", "₱400/day"],
  },
  {
    id: "megaworld",
    company: "Megaworld",
    title: "Sales Interns",
    href: "/search/c18ace50-030e-42e5-902f-e351e214b61b",
    pay: "₱100/day",
    location: "Onsite",
    workload: "Full-time",
    badge: "DLSU MOA",
    tags: ["DLSU MOA", "Full-time", "Onsite", "₱100/day"],
  },
];