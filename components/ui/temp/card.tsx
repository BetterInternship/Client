import { createElement, type HTMLAttributes } from "react";
import { cn } from "@betterinternship/components";

// ! Proposed shared Card variants for the future site-wide UI migration.
export type CardVariant = "interactive" | "surface";

const cardVariants: Record<CardVariant, string> = {
  // For a whole-card link or action. The caller supplies the semantic link/button.
  interactive:
    "cursor-pointer rounded-xl border border-landing-border bg-white transition-[border-color,box-shadow,translate] duration-200 ease-landing-out motion-safe:pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:border-landing-border-hover pointer-fine:hover:shadow-landing-interactive focus-within:border-landing-border-hover focus-within:shadow-landing-interactive motion-reduce:transition-none",
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
