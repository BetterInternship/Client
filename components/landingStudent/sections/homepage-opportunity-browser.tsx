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
import type { HomepageListings } from "../homepage-listings.server";
import { JobCard } from "@/components/ui/temp/job-card";
import { LinkButton } from "@/components/ui/temp/button";
import { Card } from "@/components/ui/temp/card";

export function HomepageOpportunityBrowser({
  fields,
  listings,
}: {
  fields: HomepageField[];
  listings: HomepageListings;
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
  const jobs = listings[selected?.label ?? "All"];

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
        aria-label={selected ? `${label} internships` : "Featured internships"}
      >
        <p
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {jobs?.length
            ? `Showing ${label === "All" ? "featured" : label} internships.`
            : `No ${label === "All" ? "featured" : label} internships available right now.`}
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
            {jobs?.length ? (
              jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  className={`${motionStyles.action} h-full ${index > 2 ? "max-md:hidden" : ""}`}
                  variants={cardVariants}
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                >
                  <JobCard job={job} data-job-id={job.id} />
                </motion.div>
              ))
            ) : (
              <Card className="col-span-full flex min-h-42 items-center justify-center p-5 text-center text-sm leading-[1.5] text-landing-muted">
                <p className="m-0">
                  There are no featured internships in this category right now.
                  Browse more opportunities below.
                </p>
              </Card>
            )}
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
