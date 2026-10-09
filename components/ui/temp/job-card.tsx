import type Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { ComponentProps, HTMLAttributes } from "react";
import { cn } from "@betterinternship/components";
import { Card } from "./card";
import { Badge } from "./badge";
import { LinkButton } from "./button";

// ! Proposed shared JobCard for the future site-wide UI migration.
export type JobCardData = {
  title: string;
  companyName: string;
  location: string;
  workMode: string;
  category: string;
  compensation: string;
  postedLabel: string;
  href: ComponentProps<typeof Link>["href"];
};

export type JobCardProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  job: JobCardData;
};

export function JobCard({ job, className, ...props }: JobCardProps) {
  const {
    title,
    companyName,
    location,
    workMode,
    category,
    compensation,
    postedLabel,
    href,
  } = job;

  return (
    <Card
      as="article"
      variant="listing"
      className={cn(
        "group/job-card relative flex h-full min-w-0 flex-col p-5 max-md:p-4",
        className,
      )}
      aria-label={`${title} at ${companyName}`}
      {...props}
    >
      <h3 className="m-0 mb-1 text-xl font-semibold leading-[1.3] tracking-[-.021875rem] text-landing-navy max-md:text-lg max-md:leading-[1.3]">
        {title}
      </h3>
      <p className="m-0 mb-3.5 text-sm font-medium leading-[1.5] text-landing-muted max-md:mb-2">
        {companyName}
      </p>
      <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] leading-[1.5] text-landing-muted max-md:mb-2">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={15} strokeWidth={1.75} aria-hidden="true" />
          {location}
        </span>
      </div>
      <div className="mb-2.5 flex w-fit flex-wrap gap-2 text-xs font-medium leading-[1.4] text-landing-muted max-md:mb-2">
        {workMode && <Badge variant="secondary">{workMode}</Badge>}
        <Badge>{category}</Badge>
        {compensation && <Badge>{compensation}</Badge>}
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 text-xs leading-[1.5] text-landing-muted">
        <span>{postedLabel}</span>
        <LinkButton
          href={href}
          variant="text"
          size="text"
          className="static hover:no-underline after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-landing-blue"
          aria-label={`View ${title}`}
        >
          View
          <ArrowRight
            className="transition-transform duration-[160ms] ease-landing-out motion-safe:pointer-fine:group-hover/job-card:translate-x-0.5 motion-reduce:transition-none"
            size={14}
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </LinkButton>
      </div>
    </Card>
  );
}

export function JobCardSkeleton({
  className,
  ...props
}: Omit<HTMLAttributes<HTMLElement>, "children">) {
  return (
    <Card
      as="article"
      variant="surface"
      className={cn(
        "flex h-full min-h-52 min-w-0 flex-col p-5 max-md:min-h-42 max-md:p-4",
        className,
      )}
      aria-label="Loading job"
      aria-busy="true"
      {...props}
    >
      <div
        aria-hidden="true"
        className="flex flex-1 flex-col motion-safe:animate-pulse"
      >
        <div className="mb-1 h-6.5 w-4/5 rounded bg-landing-tag" />
        <div className="mb-3.5 h-5.25 w-1/2 rounded bg-landing-tag" />
        <div className="mb-2.5 h-5 w-2/5 rounded bg-landing-tag" />
        <div className="mb-2.5 flex gap-2">
          <div className="h-6 w-16 rounded-full bg-landing-tag" />
          <div className="h-6 w-20 rounded-full bg-landing-tag" />
          <div className="h-6 w-12 rounded-full bg-landing-tag" />
        </div>
        <div className="mt-auto flex justify-between gap-3">
          <div className="h-4.5 w-24 rounded bg-landing-tag" />
          <div className="h-4.5 w-12 rounded bg-landing-tag" />
        </div>
      </div>
    </Card>
  );
}
