"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { usePostHog } from "@posthog/react";
import { Card, cn } from "@betterinternship/components";
import type {
  PublicTopUniversity,
  TopUniversityPageCard,
} from "@/lib/api/top-page.server";
import { topAccentStyle } from "@/lib/utils/top-page-presentation";
import {
  DEFAULT_TOP_PAGE_ACCENT,
  topUniversityHeading,
} from "@/lib/utils/top-page-heading";
import { currentManilaWeek } from "@/lib/utils/manila-week";
import { topArtworkFilter } from "@/lib/utils/top-page-presentation";
import { TopPageBackdrop } from "./TopArtwork";
import { topCategoryArtworkBySlug } from "./top-category-artwork";
import { TopDiscordCTA } from "./TopDiscordCTA";
import { TopPageNavbar } from "./TopPageNavbar";
import motionStyles from "./top-motion.module.css";

const artworkSaturationVariations = [0.9, 1, 1.1] as const;

function categoryImageFilter(siteFilter: string, pageIndex: number) {
  const saturation =
    artworkSaturationVariations[pageIndex % artworkSaturationVariations.length];
  return [siteFilter === "none" ? null : siteFilter, `saturate(${saturation})`]
    .filter(Boolean)
    .join(" ");
}

/**
 * A university's landing page, /<university>
 * (Docs/plans/TOP_PAGES_UNIVERSITY_PLAN.md D12): its name as the heading and
 * a card per live category, each linking to /<university>/top/<slug>. It is
 * the index of the university's Top pages — there is nothing to apply to
 * here, so no listings, no partner control and no ?week= handling.
 */
export function TopUniversityLanding({
  university,
  pages,
}: {
  university: PublicTopUniversity;
  pages: TopUniversityPageCard[];
}) {
  const posthog = usePostHog();
  const week = currentManilaWeek();
  const siteArtworkFilter = topArtworkFilter(
    university.accent_hex ?? DEFAULT_TOP_PAGE_ACCENT,
  );

  // Once per mount: StrictMode's double effect and re-renders must not
  // double-count a visit (same guard as TopPageWeekWatcher).
  const sentRef = useRef(false);
  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;

    posthog.capture("top_university_viewed", {
      university_id: university.id,
      university_slug: university.slug,
      category_count: pages.length,
    });
  }, [posthog, university.id, university.slug, pages.length]);

  return (
    <div
      style={topAccentStyle(university.accent_hex)}
      className="relative min-h-screen w-full shrink-0 overflow-hidden bg-[var(--top-surface)] max-md:overflow-clip"
    >
      <TopPageBackdrop />
      <TopPageNavbar />
      <header className="relative mx-auto max-w-[1240px] px-4 pt-9 max-sm:pt-6 sm:px-6 lg:px-8 lg:pt-12">
        <span className="text-base font-medium leading-6 text-[#526078] tabular-nums sm:text-lg">
          {week.label}
        </span>
        <h1 className="mt-1 text-4xl font-bold leading-[1.08] tracking-tight text-[#101033] max-sm:text-[32px] max-sm:leading-[1.12] sm:text-5xl lg:text-[52px]">
          {topUniversityHeading(university.name)}
        </h1>
      </header>

      <div className="relative mx-auto w-full max-w-[1240px] px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <ul className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-5">
          {pages.map((page, index) => {
            const artwork = topCategoryArtworkBySlug[page.slug];
            const tintFilter = categoryImageFilter(siteArtworkFilter, index);
            return (
              <li key={page.id} className="min-w-0">
                <Card
                  className={cn(
                    motionStyles.action,
                    "relative h-full min-w-0 overflow-hidden rounded-[1.1rem] border border-[#e6e9ef] bg-white p-3 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[#cfd5df] hover:shadow-[0_10px_28px_rgba(31,45,68,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-4",
                  )}
                >
                  <Link
                    href={`/${university.slug}/top/${page.slug}`}
                    className="group relative block rounded-[0.85rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <div
                      className="relative grid aspect-[1.55] place-items-center overflow-hidden rounded-[0.85rem]"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--top-accent-text) 7%, white)",
                      }}
                      aria-hidden="true"
                    >
                      {artwork && (
                        <Image
                          src={artwork.primary}
                          alt=""
                          width={384}
                          height={384}
                          className="relative z-10 h-auto w-[min(68%,210px)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-2 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:rotate-0"
                          style={{ filter: tintFilter }}
                          sizes="(min-width: 1024px) 210px, (min-width: 640px) 190px, 68vw"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 px-1 pb-1 pt-3">
                      <div className="min-w-0">
                        <h2 className="line-clamp-2 text-[15px] font-semibold leading-5 tracking-tight text-[#101033]">
                          {page.name}
                        </h2>
                        <p className="mt-1 text-xs font-medium text-[#101033]">
                          {page.listing_count > 0
                            ? `Top ${page.listing_count} this week`
                            : "No featured internships this week"}
                        </p>
                      </div>
                      <ArrowRight
                        className={cn(
                          "h-4 w-4 shrink-0 text-[#101033]",
                          motionStyles.arrow,
                        )}
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="relative mx-auto max-w-[1240px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <TopDiscordCTA />
      </div>
    </div>
  );
}
