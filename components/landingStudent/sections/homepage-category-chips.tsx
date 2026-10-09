"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { topCategoryArtworkBySlug } from "@/components/features/student/top/top-category-artwork";
import {
  homepageFieldArtworkSlugs,
  homepageHeroCategories,
  type HomepageField,
} from "../homepage-data";
import { LinkButton } from "@/components/ui/temp/button";
import { FilterChip } from "@/components/ui/temp/filter-chip";

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
      <FilterChip
        type="button"
        aria-label={field.label}
        title={field.label}
        selected={selected}
        aria-controls={controls}
        onClick={() => onSelect(field)}
      >
        {artwork && (
          <Image
            src={artwork.primary}
            width={64}
            height={64}
            sizes="(max-width: 767px) 28px, 36px"
            className="h-9 w-9 shrink-0 object-contain [filter:saturate(.55)_brightness(1.07)_contrast(.94)] opacity-[.72] transition-[filter,opacity] duration-[180ms] pointer-fine:group-hover:filter-none pointer-fine:group-hover:opacity-100 group-aria-pressed:filter-none group-aria-pressed:opacity-100 motion-safe:pointer-fine:transition-transform motion-safe:pointer-fine:duration-300 motion-safe:pointer-fine:group-hover:-translate-y-1 motion-safe:pointer-fine:group-hover:rotate-2 max-md:h-7 max-md:w-7"
            alt=""
          />
        )}
        <span>{displayLabel}</span>
      </FilterChip>
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
      className="grid w-full gap-3"
      aria-label="Explore internship categories"
    >
      <ul className="m-0 flex list-none flex-wrap justify-center gap-3 p-0 max-md:gap-2.5">
        {chips.slice(0, 5).map(renderChip)}
      </ul>
      <ul className="m-0 flex list-none flex-wrap justify-center gap-3 p-0 max-md:gap-2.5">
        {chips.slice(5).map(renderChip)}
        <li className="list-none">
          <LinkButton
            href="/search"
            variant="primary"
            size="chip"
            className="max-md:min-h-14 max-md:gap-2 max-md:px-3 max-md:text-sm"
            aria-label="Browse all internships"
          >
            <span>All</span>
            <ArrowRight
              size={18}
              strokeWidth={1.75}
              className="transition-transform duration-[160ms] ease-landing-out motion-safe:pointer-fine:group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </LinkButton>
        </li>
      </ul>
    </nav>
  );
}
