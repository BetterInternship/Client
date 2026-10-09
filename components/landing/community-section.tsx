import { ArrowRight } from "lucide-react";
import type { ComponentProps, HTMLAttributes, ReactNode } from "react";
import { cn } from "@betterinternship/components";
import { LinkButton } from "@/components/ui/temp/button";

export type CommunitySectionProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "title"
> & {
  heading: ReactNode;
  headingId: string;
  artwork: ReactNode;
  action: {
    label: string;
    href: ComponentProps<typeof LinkButton>["href"];
    icon?: ReactNode;
  };
};

export function CommunitySection({
  heading,
  headingId,
  artwork,
  action,
  className,
  ...props
}: CommunitySectionProps) {
  return (
    <section
      className={cn(
        "group relative isolate grid min-h-[360px] grid-cols-[minmax(300px,1fr)_minmax(0,1.35fr)] overflow-hidden rounded-xl border border-[#28355a] bg-[#10142b] text-white transition-[opacity,transform] duration-[360ms] ease-landing-out data-[reveal=pending]:translate-y-2 data-[reveal=pending]:opacity-0 motion-reduce:transition-none max-md:min-h-0 max-md:grid-cols-1",
        className,
      )}
      aria-labelledby={headingId}
      {...props}
    >
      <div
        className="relative min-h-[360px] max-md:min-h-[260px]"
        aria-hidden="true"
      >
        <div className="absolute -bottom-2 left-1/2 h-[24.5625rem] w-[min(calc(100%_+_2rem),33rem)] -translate-x-1/2 transition-transform duration-[550ms] delay-[60ms] ease-landing-out group-data-[reveal=pending]:translate-y-2 group-data-[reveal=pending]:rotate-[-1deg] motion-reduce:transition-none max-md:-bottom-5 max-md:h-[19.9375rem] max-md:w-[min(calc(100%_-_1rem),20.125rem)]">
          {artwork}
        </div>
      </div>
      <div className="min-w-0 self-center py-11 pl-6 pr-12 max-md:p-6">
        <h2
          className="m-0 mb-6 max-w-none text-[clamp(1.875rem,3vw,2.5rem)] font-[750] leading-[1.15] tracking-[-.0875rem] text-white max-md:tracking-[-.0625rem]"
          id={headingId}
        >
          {heading}
        </h2>
        <LinkButton href={action.href} variant="community" size="community">
          {action.icon}
          {action.label}
          <ArrowRight
            size={20}
            className="transition-transform duration-200 ease-landing-out motion-safe:pointer-fine:group-hover/button:translate-x-[3px] motion-reduce:transition-none"
            aria-hidden="true"
          />
        </LinkButton>
      </div>
    </section>
  );
}
