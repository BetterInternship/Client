import type { ComponentProps, ReactNode } from "react";
import { cn } from "@betterinternship/components";
import { Button } from "./button";

// ! Proposed shared FilterChip for the future site-wide UI migration.
export type FilterChipProps = Omit<
  ComponentProps<typeof Button>,
  "variant" | "size" | "aria-pressed"
> & {
  selected?: boolean;
  icon?: ReactNode;
};

export function FilterChip({
  selected = false,
  icon,
  children,
  className,
  ...props
}: FilterChipProps) {
  return (
    <Button
      variant={selected ? "chip-selected" : "chip"}
      size="chip"
      aria-pressed={selected}
      className={cn(
        "min-h-15 gap-2.5 px-5 font-[550] focus-visible:outline-2 focus-visible:outline-landing-secondary max-md:min-h-14 max-md:gap-2 max-md:px-3 max-md:py-3 max-md:text-sm aria-pressed:font-semibold",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </Button>
  );
}
