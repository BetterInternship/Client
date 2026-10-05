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
    question: "How do I check whether a company has an MOA with my university?",
    answer:
      "On your university’s Top page, use ‘Show companies with MOA’ to see opportunities from companies with an MOA on record for your university. Confirm the agreement’s validity and your program’s requirements with your internship coordinator.",
  },
  {
    question: "What happens after I apply?",
    answer:
      "Your application and selected resume are submitted to the employer for review. If they want to move forward, they may contact you with next steps. Each employer manages its own hiring process, so response times vary.",
  },
  {
    question: "Can I track my applications on BetterInternship?",
    answer:
      "Yes. Log in and open My Applications to see the internships you’ve applied to and their recorded application statuses.",
  },
];
