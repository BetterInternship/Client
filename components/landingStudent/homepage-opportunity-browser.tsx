"use client";

import { useId, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import motionStyles from "@/components/features/student/top/top-motion.module.css";
import { HomepageCategoryChips } from "./homepage-category-chips";
import { homepageHeroCategories, type HomepageField } from "./homepage-data";
import styles from "./homepage-opportunity-browser.module.css";

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
    <div className={styles.browser} data-category={label}>
      <div className="home-category-picker">
        <HomepageCategoryChips
          fields={fields}
          selectedCategory={selected?.label ?? null}
          onSelectCategory={setSelected}
          controls={regionId}
        />
      </div>
      <section
        className={styles.opportunities}
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
            className={styles.grid}
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {titles.map((title, index) => (
              <motion.article
                key={title}
                className={`${styles.listing} ${motionStyles.action}`}
                variants={cardVariants}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                aria-label={`${title} at Example company`}
                data-demo="true"
              >
                <h3 className={styles.listingTitle}>{title}</h3>
                <p className={styles.companyName}>Example company</p>
                <div className={styles.facts}>
                  <span>
                    <MapPin size={15} strokeWidth={1.75} aria-hidden="true" />
                    {dummyDetails[index].location}
                  </span>
                </div>
                <div className={styles.tags}>
                  <span>{dummyDetails[index].mode}</span>
                  <span>{selected ? label : dummyDetails[index].category}</span>
                  <span>Paid</span>
                </div>
                <div className={styles.listingFooter}>
                  <span>Posted recently</span>
                  <Link
                    href={
                      selected?.href ??
                      fields.find(
                        (field) => field.label === dummyDetails[index].field,
                      )?.href ??
                      "/search"
                    }
                    className={styles.viewLink}
                    aria-label={`View ${title}`}
                  >
                    View
                    <ArrowRight
                      className={motionStyles.arrow}
                      size={14}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>
        <Link
          href={viewMoreHref}
          className={`${styles.viewMoreButton} ${motionStyles.action}`}
          aria-label={
            selected
              ? `View more ${label} internships`
              : "View more internships"
          }
        >
          View more internships
          <ArrowRight
            className={motionStyles.arrow}
            size={18}
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </Link>
      </section>
    </div>
  );
}
