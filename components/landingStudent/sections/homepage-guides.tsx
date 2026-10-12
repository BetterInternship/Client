import { getPublishedGuideMetadata } from "@/lib/guides/guide-content-loader";
import { GuideCard } from "@/components/guides/guide-card";
import { SectionHeading } from "@/components/ui/temp/section-heading";
import { LinkButton } from "@/components/ui/temp/button";
import { ArrowRight } from "lucide-react";

/** Server-rendered discovery section. Reuse published content and cards so
 * homepage titles, summaries, and URLs stay in sync with the Guides library. */
export async function HomepageGuides() {
  const guides = (await getPublishedGuideMetadata()).slice(0, 3);
  if (!guides.length) return null;

  return (
    <section
      className="mt-24 max-md:mt-14"
      aria-labelledby="home-guides-heading"
    >
      <div className="mb-8 flex items-end justify-between gap-6 max-md:flex-col max-md:items-start max-md:gap-3">
        <SectionHeading
          id="home-guides-heading"
          title="Your first internship"
          description="Advice to help you apply."
          className="mb-0 max-md:mb-0"
        />
        <LinkButton
          href="/guides"
          variant="text"
          size="text"
          className="gap-2 text-sm font-semibold text-landing-blue-hover hover:no-underline"
        >
          View all guides{" "}
          <ArrowRight
            size={16}
            aria-hidden="true"
            className="motion-safe:transition-transform motion-safe:duration-[160ms] motion-safe:group-hover/button:translate-x-[3px]"
          />
        </LinkButton>
      </div>
      <div className="grid grid-cols-3 gap-x-5 gap-y-0 max-lg:gap-x-3.5 max-md:grid-cols-1 max-md:gap-5">
        {guides.map((guide) => (
          <GuideCard key={guide.slug} guide={guide} />
        ))}
      </div>
    </section>
  );
}
