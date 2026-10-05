import type { JobCategory } from "@/lib/db/db.types";

export type HomepageField = { label: string; href: string };

const fields = [
  { label: "Data & Analytics", match: /data|analytics/i, query: "data" },
  { label: "Software", match: /software/i, query: "software" },
  { label: "IT", match: /^(it|information technology)$/i, query: "IT" },
  {
    label: "Accounting & Finance",
    match: /accounting|finance/i,
    query: "finance",
  },
  {
    label: "Operations & Human Resources",
    match: /operations|human resources|^hr$/i,
    query: "human resources",
  },
  { label: "Marketing", match: /marketing/i, query: "marketing" },
  {
    label: "Creative & Multimedia",
    match: /creative|multimedia|design/i,
    query: "design",
  },
  { label: "Legal", match: /legal|law/i, query: "legal" },
  {
    label: "Engineering & Architecture",
    match: /^(engineering|architecture)|engineering & architecture/i,
    query: "engineering",
  },
];

export function searchHref(params: Record<string, string>): string {
  return `/search?${new URLSearchParams(params).toString()}`;
}

/** Resolve the homepage's nine fields against the existing category tree. */
export function getHomepageFields(categories: JobCategory[]): HomepageField[] {
  return fields.map(({ label, match, query }) => {
    const ids = new Set(
      categories
        .filter((category) => match.test(category.name))
        .map((category) => category.id),
    );
    // Include descendants, including the software specializations that the
    // marketplace groups under Software Engineering.
    let previousSize = -1;
    while (previousSize !== ids.size) {
      previousSize = ids.size;
      for (const category of categories) {
        if (category.parent_id && ids.has(category.parent_id))
          ids.add(category.id);
      }
    }
    return {
      label,
      href: searchHref(ids.size ? { position: [...ids].join(",") } : { query }),
    };
  });
}

export const quickFilters = [
  { label: "Remote", href: searchHref({ mode: "2" }) },
  { label: "Hybrid", href: searchHref({ mode: "1" }) },
  { label: "On-site", href: searchHref({ mode: "0" }) },
  { label: "Paid", href: searchHref({ allowance: "0" }) },
  { label: "Part-time", href: searchHref({ workload: "1" }) },
  { label: "Full-time", href: searchHref({ workload: "2" }) },
];

export function getPopularSearches(options: HomepageField[]): HomepageField[] {
  const field = (index: number) => options[index].href;
  return [
    { label: "Software internships", href: field(1) },
    { label: "Marketing internships", href: field(5) },
    { label: "IT internships", href: field(2) },
    { label: "Finance internships", href: field(3) },
    { label: "Engineering internships", href: field(8) },
    { label: "Remote internships", href: quickFilters[0].href },
    { label: "Internships in Makati", href: searchHref({ query: "Makati" }) },
    { label: "Internships in Manila", href: searchHref({ query: "Manila" }) },
    { label: "Part-time internships", href: quickFilters[4].href },
    { label: "Paid internships", href: quickFilters[3].href },
  ];
}

export const homepageFaqs = [
  {
    question: "Is BetterInternship free for students?",
    answer:
      "Yes. Students can browse internships, create a profile, and apply to opportunities on BetterInternship for free.",
  },
  {
    question: "How do I apply for an internship?",
    answer:
      "Log in with Google, complete your student profile, and upload your resume. Open an internship listing and select Apply. Some opportunities may also ask you to complete a short challenge.",
  },
  {
    question: "What does MOA-ready mean?",
    answer:
      "An MOA is a Memorandum of Agreement between a company and your university. A listing marked as having an MOA has an agreement on record for your university. Always confirm your program’s requirements and the agreement’s validity with your internship coordinator.",
  },
  {
    question: "Can I apply to multiple internships?",
    answer:
      "Yes. You can apply to multiple opportunities that fit your interests and availability, and track your applications in your account.",
  },
  {
    question: "How do I know if an internship is legitimate?",
    answer:
      "Public listings come from verified employer accounts. Still review the company, responsibilities, and terms carefully. Never pay an application fee or share sensitive financial information, and contact us if a listing seems suspicious.",
  },
];
