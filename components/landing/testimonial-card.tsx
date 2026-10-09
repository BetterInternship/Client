import type { HTMLAttributes } from "react";
import { cn } from "@betterinternship/components";
import { Card } from "@/components/ui/temp/card";

export type TestimonialData = {
  quote: string;
  name: string;
  initials: string;
  description?: string;
  details?: string;
};

export function TestimonialCard({
  testimonial,
  className,
  ...props
}: Omit<HTMLAttributes<HTMLElement>, "children"> & {
  testimonial: TestimonialData;
}) {
  return (
    <Card
      as="figure"
      variant="testimonial"
      className={cn(
        "m-0 flex min-h-[15rem] shrink-0 flex-col p-6 max-lg:p-5",
        className,
      )}
      {...props}
    >
      <blockquote className="m-0 mb-6 text-base font-[450] leading-[1.65] tracking-[-.009375rem] text-landing-navy max-lg:text-[15px]">
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-landing-secondary-tint text-xs font-semibold leading-[1.5] text-landing-secondary-deep">
          {testimonial.initials}
        </span>
        <div>
          <strong className="block text-sm font-semibold leading-[1.5] text-landing-navy">
            {testimonial.name}
          </strong>
          {testimonial.description && (
            <span className="mt-0.5 block text-xs leading-[1.5] text-landing-muted">
              {testimonial.description}
            </span>
          )}
        </div>
      </figcaption>
      {testimonial.details && (
        <div className="mt-4 text-xs leading-[1.5] text-landing-muted">
          {testimonial.details}
        </div>
      )}
    </Card>
  );
}
