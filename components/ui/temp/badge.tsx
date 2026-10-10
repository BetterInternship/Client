import type { HTMLAttributes } from "react";
import { cn } from "@betterinternship/components";

// ! Proposed shared Badge for the future site-wide UI migration.
export type BadgeVariant = "neutral" | "primary" | "secondary";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-landing-tag text-landing-muted",
  primary: "bg-landing-tint text-landing-blue",
  secondary: "bg-landing-secondary-tint text-landing-secondary-deep",
};

export function Badge({
  variant = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.25 py-0.75 text-xs font-medium leading-[1.4]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
