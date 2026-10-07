"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { topCategoryArtworkBySlug } from "@/components/features/student/top/top-category-artwork";
import motionStyles from "@/components/features/student/top/top-motion.module.css";
import {
  homepageFieldArtworkSlugs,
  homepageHeroCategories,
  type HomepageField,
} from "./homepage-data";
import styles from "./homepage-category-chips.module.css";

function CategoryChip({
  field,
  displayLabel,
  selected,
  onSelect,
  controls,
}: {
  field: HomepageField;
  displayLabel: string;
  selected: boolean;
  onSelect: (field: HomepageField) => void;
  controls: string;
}) {
  const artwork =
    topCategoryArtworkBySlug[homepageFieldArtworkSlugs[field.label]];
  return (
    <li>
      <button
        type="button"
        className={`${styles.chip} ${motionStyles.action}`}
        aria-label={field.label}
        title={field.label}
        aria-pressed={selected}
        aria-controls={controls}
        onClick={() => onSelect(field)}
      >
        {artwork && (
          <Image
            src={artwork.primary}
            width={64}
            height={64}
            sizes="(max-width: 767px) 28px, 36px"
            className={styles.icon}
            alt=""
          />
        )}
        <span>{displayLabel}</span>
      </button>
    </li>
  );
}

export function HomepageCategoryChips({
  fields,
  selectedCategory,
  onSelectCategory,
  controls,
}: {
  fields: HomepageField[];
  selectedCategory: string | null;
  onSelectCategory: (field: HomepageField) => void;
  controls: string;
}) {
  const chips = homepageHeroCategories.flatMap((category) => {
    const field = fields.find((field) => field.label === category.field);
    return field ? [{ field, label: category.label }] : [];
  });

  const renderChip = ({ field, label }: (typeof chips)[number]) => (
    <CategoryChip
      key={field.label}
      field={field}
      displayLabel={label}
      selected={selectedCategory === field.label}
      onSelect={onSelectCategory}
      controls={controls}
    />
  );

  return (
    <nav
      className={styles.categories}
      aria-label="Explore internship categories"
    >
      <ul className={styles.chips}>{chips.slice(0, 5).map(renderChip)}</ul>
      <ul className={styles.chips}>
        {chips.slice(5).map(renderChip)}
        <li className={styles.allItem}>
          <Link
            href="/search"
            className={`${styles.chip} ${styles.primary} ${motionStyles.action}`}
            aria-label="Browse all internships"
          >
            <span>All</span>
            <ArrowRight
              size={18}
              strokeWidth={1.75}
              className={motionStyles.arrow}
              aria-hidden="true"
            />
          </Link>
        </li>
      </ul>
    </nav>
  );
}
