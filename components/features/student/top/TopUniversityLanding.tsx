"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePostHog } from "@posthog/react";
import { Card, cn } from "@betterinternship/components";
import type {
  PublicTopUniversity,
  TopUniversityPageCard,
} from "@/lib/api/top-page.server";
import { topAccentStyle } from "@/lib/utils/top-page-presentation";
import { topUniversityHeading } from "@/lib/utils/top-page-heading";
import { currentManilaWeek } from "@/lib/utils/manila-week";
import { TopPageBackdrop } from "./TopArtwork";
import { TopDiscordCTA } from "./TopDiscordCTA";
import { TopPageNavbar } from "./TopPageNavbar";
import motionStyles from "./top-motion.module.css";

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
      className="relative min-h-screen w-full shrink-0 overflow-hidden bg-[#f7fbff] max-md:overflow-clip"
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
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#526078]">
          This week&apos;s top internships, picked by category. Choose one to
          see the listings and apply.
        </p>
      </header>

      <div className="relative mx-auto w-full max-w-[1240px] px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {pages.map((page) => (
            <li key={page.id} className="min-w-0">
              <Card
                className={cn(
                  motionStyles.action,
                  "relative flex h-full min-w-0 flex-col gap-2 px-6 py-6 transition-colors duration-200 hover:border-primary/30 hover:shadow-sm max-sm:p-4",
                )}
              >
                <h2 className="text-xl font-semibold tracking-tight text-[#101033]">
                  {/* One link, stretched over the whole card — no other
                      interactive element sits inside it. */}
                  <Link
                    href={`/${university.slug}/top/${page.slug}`}
                    className="static rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary"
                  >
                    {page.name} Internships
                  </Link>
                </h2>
                <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--top-accent-text)]">
                  {page.listing_count > 0
                    ? `Top ${page.listing_count} this week`
                    : "No featured internships this week"}
                  <ArrowRight
                    className={cn("h-4 w-4", motionStyles.arrow)}
                    aria-hidden="true"
                  />
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mx-auto max-w-[1240px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <TopDiscordCTA />
      </div>
    </div>
  );
}
