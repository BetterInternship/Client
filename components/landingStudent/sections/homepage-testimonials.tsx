"use client";

import { useId } from "react";
import { Marquee } from "@/components/landing/marquee";
import { TestimonialCard } from "@/components/landing/testimonial-card";
import { SectionHeading } from "@/components/ui/temp/section-heading";

interface Testimonial {
  quote: string;
  name: string;
  program: string;
  role: string;
  setup: string;
  initials: string;
}

export function HomepageTestimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const headingId = useId();

  return (
    <section
      className="relative isolate w-full pt-22 transition-[opacity,transform] duration-[360ms] ease-landing-out data-[reveal=pending]:translate-y-2 data-[reveal=pending]:opacity-0 motion-reduce:transition-none max-sm:pt-16"
      aria-labelledby={headingId}
      data-home-reveal
    >
      <SectionHeading
        title="Loved by students"
        description="What students are saying about BetterInternship."
        id={headingId}
      />
      <Marquee label="Student testimonials">
        {testimonials.map((student) => (
          <TestimonialCard
            key={student.name}
            className="w-[var(--marquee-item-width)]"
            testimonial={{
              quote: student.quote,
              name: student.name,
              initials: student.initials,
              description: student.program,
              details: `${student.role} · ${student.setup}`,
            }}
          />
        ))}
      </Marquee>
    </section>
  );
}
