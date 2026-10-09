import { getHomepageFields } from "./homepage-data";
import type { RefsData } from "@/lib/db/db.types";
import { HomepageArtwork, HomepageSectionSprite } from "./homepage-artwork";
import { HomepageCommunity } from "./sections/homepage-community";
import { HomepageFaq } from "./sections/homepage-faq";
import { HomepageFooter } from "./homepage-footer";
import { HomepageHeader } from "./homepage-header";
import { HomepageOpportunityBrowser } from "./sections/homepage-opportunity-browser";
import { HomepageTestimonials } from "./sections/homepage-testimonials";
import { SectionHeading } from "@/components/ui/temp/section-heading";
import { HomepageMotion } from "./homepage-motion";
import { topAccentStyle } from "@/lib/utils/top-page-presentation";
import { cn } from "@betterinternship/components";
import { landingContainerClassName as homepageContainerClassName } from "@/components/landing/layout";

// Supplied example copy. Replace with approved student testimonials.
const testimonials = [
  {
    quote:
      "I found my internship in just a few days. The one-click apply made the whole process so much easier.",
    name: "Andrea T.",
    program: "Communication Arts",
    role: "Marketing Intern",
    setup: "On-site",
    initials: "AT",
  },
  {
    quote:
      "I was able to find a company with an MOA for our university. Super useful for students!",
    name: "Miguel R.",
    program: "Computer Science",
    role: "Software Engineering Intern",
    setup: "Hybrid",
    initials: "MR",
  },
  {
    quote:
      "The listings are updated and relevant. I got interviews from two companies within a week!",
    name: "Janelle S.",
    program: "Information Systems",
    role: "Data Analyst Intern",
    setup: "Remote",
    initials: "JS",
  },
];

export function StudentHomepage({ refs }: { refs: RefsData }) {
  const fields = getHomepageFields(refs.job_categories);

  return (
    <HomepageMotion
      className="relative isolate min-h-full w-full shrink-0 overflow-x-clip text-landing-navy [&_a]:cursor-pointer [&_button:not(:disabled)]:cursor-pointer [&_[role=button]]:cursor-pointer"
      style={{
        ...topAccentStyle(),
        background: "linear-gradient(#fff, var(--top-surface) 50rem)",
      }}
    >
      <HomepageArtwork />
      <HomepageHeader />

      <main className="relative z-10 pb-12">
        <section
          className={cn(
            homepageContainerClassName,
            "flex flex-col items-center pt-32 text-center md:max-lg:pt-26 max-md:pt-9",
          )}
          aria-labelledby="home-heading"
        >
          <h1
            className="m-0 text-[clamp(3.25rem,5.8vw,5.375rem)] font-[750] leading-[.98] tracking-[-.225rem] text-landing-navy motion-safe:animate-landing-introduce max-md:text-[clamp(2.25rem,9vw,3.5rem)] max-md:leading-[1.02] max-md:tracking-[-.0875rem]"
            id="home-heading"
          >
            <span className="block">Better internships</span>
            <span className="block">start here</span>
          </h1>
          <p className="mb-8 mt-5 text-lg leading-[1.5] text-landing-nav motion-safe:animate-landing-introduce motion-safe:[animation-delay:60ms] max-md:mb-7 max-md:mt-4.5 max-md:text-[15px]">
            Discover opportunities across the Philippines.
          </p>
          <HomepageOpportunityBrowser fields={fields} />
        </section>

        <div className={homepageContainerClassName}>
          <HomepageTestimonials testimonials={testimonials} />
          <HomepageCommunity />

          <section
            className="relative isolate mt-25 transition-[opacity,transform] duration-[360ms] ease-landing-out data-[reveal=pending]:translate-y-2 data-[reveal=pending]:opacity-0 motion-reduce:transition-none max-md:mt-14"
            id="faq"
            aria-labelledby="home-faq-heading"
            data-home-reveal
          >
            <HomepageSectionSprite name="bulb" placement="faq" />
            <SectionHeading
              title="Frequently asked questions"
              id="home-faq-heading"
            />
            <HomepageFaq />
          </section>
        </div>
      </main>

      <HomepageFooter />
    </HomepageMotion>
  );
}
