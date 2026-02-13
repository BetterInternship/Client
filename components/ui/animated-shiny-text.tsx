import { ReactNode } from "react";
import { cn } from "@/lib/utils"; // if you have it; otherwise remove cn

export function AnimatedShinyText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  // Inherits font-size/weight from parent; just paints the text
  return (
    <span className={cn("shiny-text inline-block align-baseline", className)}>
      {children}
    </span>
  );
}
