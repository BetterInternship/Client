import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { BooleanCheckIcon } from "./icons";

const badge_variants = cva(
  [
    "border",
    "border-transparent",
    "cursor-default",
    "font-semibold",
    "inline-flex",
    "items-center",
    "px-[0.75em]",
    "py-[0.25em]",
    "rounded-[0.33em]",
    "select-none",
    "text-xs",
    "transition-colors",
    "whitespace-nowrap",
  ],
  {
    variants: {
      type: {
        default: ["border-gray-300", "text-gray-700"],
        primary: ["bg-primary", "text-primary-foreground"],
        accent: ["bg-accent", "text-accent-foreground"],
        supportive: ["bg-supportive", "text-supportive-foreground"],
        warning: ["bg-warning", "text-warning-foreground"],
        destructive: ["bg-destructive", "text-destructive-foreground"],
      },
      strength: {
        default: ["opacity-100"],
        medium: ["opacity-80"],
        light: ["opacity-50"],
        invisible: ["opacity-0"],
      },
    },
    defaultVariants: {
      type: "default",
      strength: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badge_variants> {}

export function Badge({ className, type, strength, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badge_variants({ type, strength }), className)}
      {...props}
    />
  );
}

export function BoolBadge({
  state,
  onValue,
  offValue,
  onScheme = "supportive",
  offScheme = "accent",
  className = "",
  ...props
}: {
  state: boolean | null | undefined;
  onValue: string;
  offValue: string;
  onScheme?: "default" | "primary" | "accent" | "supportive" | "destructive";
  offScheme?: "default" | "primary" | "accent" | "supportive" | "destructive";
  className?: string;
}) {
  return (
    <Badge
      type={state ? onScheme : offScheme}
      {...props}
      className={cn("pointer-events-none rounded-[0.33em]", className)}
    >
      <BooleanCheckIcon checked={state} />
      {state ? onValue : offValue}
    </Badge>
  );
}

Badge.displayName = "Badge";
