import { createElement, type HTMLAttributes } from "react";
import { cn } from "@betterinternship/components";

// ! Proposed shared Card variants for the future site-wide UI migration.
export type CardVariant = "listing" | "testimonial" | "surface";

const cardVariants: Record<CardVariant, string> = {
  listing:
    "cursor-pointer rounded-xl border border-landing-border bg-white transition-[border-color,box-shadow] duration-200 pointer-fine:hover:border-landing-border-hover pointer-fine:hover:shadow-landing-interactive focus-within:border-landing-border-hover focus-within:shadow-landing-interactive",
  testimonial:
    "rounded-xl border border-landing-border bg-white text-landing-navy",
  surface: "rounded-xl border border-landing-border bg-white",
};

export function Card({
  as = "div",
  variant = "surface",
  className,
  ...props
}: HTMLAttributes<HTMLElement> & {
  as?: "article" | "div" | "figure";
  variant?: CardVariant;
}) {
  return createElement(as, {
    ...props,
    className: cn(cardVariants[variant], className),
  });
}
