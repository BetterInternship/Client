import { cn } from "@betterinternship/components";

// ! Proposed shared section heading for the future site-wide UI migration.
export function SectionHeading({
  title,
  description,
  className,
  id,
}: {
  title: string;
  description?: string;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("mb-8 max-md:mb-6", className)}>
      <h2
        id={id}
        className="m-0 text-[clamp(1.5625rem,2.7vw,2.25rem)] font-[750] leading-[1.15] tracking-[-.0875rem] text-landing-navy max-md:text-[27px] max-md:tracking-[-.0625rem]"
      >
        {title}
      </h2>
      {description && (
        <p className="mb-0 mt-1.5 text-base leading-[1.5] text-landing-muted max-md:text-sm">
          {description}
        </p>
      )}
    </div>
  );
}
