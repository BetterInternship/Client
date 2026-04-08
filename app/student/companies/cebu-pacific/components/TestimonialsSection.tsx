import type { CompanyTestimonial } from "../data";

type TestimonialsSectionProps = {
  testimonials: CompanyTestimonial[];
};

export function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  return (
    <section className="px-6 py-12 sm:px-8 sm:py-14 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2574BB]/70">
            Testimonials
          </p>
          <h2 className="[font-family:var(--font-cebu-company-heading)] mt-4 text-3xl font-black tracking-[-0.03em] text-[#1f68a9] sm:text-4xl">
            What former interns say about the pace and culture
          </h2>
          <div className="mt-6 h-1 w-20 rounded-full bg-[#f3d98a]" />
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={`${testimonial.name}-${testimonial.role}`}
              className="rounded-[0.33em] border border-[#2574BB]/14 bg-white p-6 shadow-[0_22px_50px_-40px_rgba(37,116,187,0.3)]"
            >
              <p className="[font-family:var(--font-cebu-company-heading)] text-5xl leading-none text-[#f3d98a]">
                &ldquo;
              </p>
              <p className="mt-3 text-base leading-8 text-[#173957]/92">
                {testimonial.quote}
              </p>
              <div className="mt-6 border-t border-[#2574BB]/12 pt-4">
                <p className="[font-family:var(--font-cebu-company-heading)] text-lg font-black text-[#1f68a9]">
                  {testimonial.name}
                </p>
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#35526b]/75">
                  {testimonial.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
