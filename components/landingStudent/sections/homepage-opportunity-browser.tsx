"use client";

import { useId, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import motionStyles from "@/components/features/student/top/top-motion.module.css";
import { HomepageCategoryChips } from "./homepage-category-chips";
import { homepageHeroCategories, type HomepageField } from "../homepage-data";
import { JobCard } from "@/components/ui/temp/job-card";
import { LinkButton } from "@/components/ui/temp/button";

const dummyTitles: Record<string, string[]> = {
  All: [
    "Software Engineering Intern",
    "Digital Marketing Intern",
    "IT Support Intern",
    "Graphic Design Intern",
    "Finance Intern",
    "Data Analyst Intern",
  ],
  Software: [
    "Software Engineering Intern",
    "Frontend Development Intern",
    "Backend Development Intern",
    "QA Testing Intern",
    "Mobile Development Intern",
    "Data Engineering Intern",
  ],
  Marketing: [
    "Marketing Intern",
    "Social Media Intern",
    "Content Marketing Intern",
    "Brand Strategy Intern",
    "Digital Marketing Intern",
    "Marketing Analytics Intern",
  ],
  IT: [
    "IT Support Intern",
    "Systems Administration Intern",
    "Network Support Intern",
    "IT Operations Intern",
    "Technical Support Intern",
    "Cybersecurity Intern",
  ],
  "Creative & Multimedia": [
    "Graphic Design Intern",
    "Multimedia Intern",
    "UI/UX Design Intern",
    "Creative Content Intern",
    "Motion Design Intern",
    "Copywriting Intern",
  ],
  "Data & Analytics": [
    "Data Analyst Intern",
    "Business Intelligence Intern",
    "Data Science Intern",
    "Research Analytics Intern",
    "Reporting Intern",
    "Product Analytics Intern",
  ],
  "Accounting & Finance": [
    "Finance Intern",
    "Accounting Intern",
    "Financial Planning Intern",
    "Audit Intern",
    "Treasury Intern",
    "Tax Intern",
  ],
  "Operations & Human Resources": [
    "Human Resources Intern",
    "People Operations Intern",
    "Talent Acquisition Intern",
    "Operations Intern",
    "Recruitment Intern",
    "HR Operations Intern",
  ],
  Legal: [
    "Legal Intern",
    "Compliance Intern",
    "Legal Research Intern",
    "Corporate Legal Intern",
    "Policy Intern",
    "Contracts Intern",
  ],
  "Engineering & Architecture": [
    "Engineering Intern",
    "Architecture Intern",
    "Civil Engineering Intern",
    "Design Engineering Intern",
    "Project Engineering Intern",
    "Environmental Engineering Intern",
  ],
};

const dummyDetails = [
  {
    category: "Software",
    field: "Software",
    location: "Makati City",
    mode: "Hybrid",
  },
  {
    category: "Marketing",
    field: "Marketing",
    location: "Taguig City",
    mode: "On-site",
  },
  { category: "IT", field: "IT", location: "Quezon City", mode: "Hybrid" },
  {
    category: "Creative",
    field: "Creative & Multimedia",
    location: "Metro Manila",
    mode: "Remote",
  },
  {
    category: "Finance",
    field: "Accounting & Finance",
    location: "Pasig City",
    mode: "On-site",
  },
  {
    category: "Data",
    field: "Data & Analytics",
    location: "Makati City",
    mode: "Hybrid",
  },
];

export function HomepageOpportunityBrowser({
  fields,
}: {
  fields: HomepageField[];
}) {
  const [selected, setSelected] = useState<HomepageField | null>(null);
  const reduceMotion = useReducedMotion();
  const regionId = useId();
  const label = selected
    ? (homepageHeroCategories.find(
        (category) => category.field === selected.label,
      )?.label ?? selected.label)
    : "All";
  const viewMoreHref = selected?.href ?? "/search";
  const titles = dummyTitles[selected?.label ?? "All"] ?? dummyTitles.All;

  const gridVariants: Variants = {
    hidden: { opacity: reduceMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: reduceMotion ? 0 : 0.045 },
    },
    exit: {
      opacity: reduceMotion ? 1 : 0,
      transition: { duration: reduceMotion ? 0 : 0.14 },
    },
  };
  const cardVariants: Variants = {
    hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.28,
        ease: [0.23, 1, 0.32, 1],
      },
    },
  };

  return (
    <div className="w-full" data-category={label}>
      <div className="w-full">
        <HomepageCategoryChips
          fields={fields}
          selectedCategory={selected?.label ?? null}
          onSelectCategory={setSelected}
          controls={regionId}
        />
      </div>
      <section
        className="mt-18 w-full text-left max-md:mt-7"
        id={regionId}
        aria-label={selected ? `${label} internships` : "Latest internships"}
      >
        <p
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Showing {label === "All" ? "all" : label} internships.
        </p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected?.label ?? "all"}
            className="grid auto-rows-[minmax(13rem,1fr)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 max-md:auto-rows-[minmax(10.5rem,1fr)] max-md:gap-3 sm:max-md:grid-cols-1"
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {titles.map((title, index) => (
              <motion.div
                key={title}
                className={`${motionStyles.action} h-full ${index > 2 ? "max-md:hidden" : ""}`}
                variants={cardVariants}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              >
                <JobCard
                  job={{
                    title,
                    companyName: "Example company",
                    location: dummyDetails[index].location,
                    workMode: dummyDetails[index].mode,
                    category: selected ? label : dummyDetails[index].category,
                    compensation: "Paid",
                    postedLabel: "Posted recently",
                    href:
                      selected?.href ??
                      fields.find(
                        (field) => field.label === dummyDetails[index].field,
                      )?.href ??
                      "/search",
                  }}
                  data-demo="true"
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        <LinkButton
          href={viewMoreHref}
          variant="chip"
          size="chip"
          className="mx-auto mt-5 flex w-fit gap-2 text-landing-blue"
          aria-label={
            selected
              ? `View more ${label} internships`
              : "View more internships"
          }
        >
          View more internships
          <ArrowRight
            className="transition-transform duration-[160ms] ease-landing-out motion-safe:pointer-fine:group-hover:translate-x-0.5 motion-reduce:transition-none"
            size={18}
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </LinkButton>
      </section>
    </div>
  );
}
