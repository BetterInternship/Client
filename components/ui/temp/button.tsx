import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@betterinternship/components";

// ! Proposed shared Button styles for the future site-wide UI migration.
export type ButtonVariant =
  | "primary"
  | "outline"
  | "chip"
  | "chip-selected"
  | "text"
  | "social"
  | "community";

export type ButtonSize = "sm" | "md" | "chip" | "icon" | "community" | "text";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "rounded-lg border border-landing-blue bg-landing-blue font-semibold text-white pointer-fine:hover:border-landing-blue-hover pointer-fine:hover:bg-landing-blue-hover pointer-fine:hover:text-white",
  outline:
    "rounded-lg border border-landing-control bg-transparent text-landing-nav hover:border-landing-control-hover hover:bg-[rgb(55_65_81_/_6%)] hover:text-landing-nav-hover",
  chip: "rounded-full border border-landing-border bg-white text-landing-navy pointer-fine:hover:border-landing-border-hover",
  "chip-selected":
    "rounded-full border border-landing-secondary-border bg-landing-secondary-tint font-semibold text-landing-secondary-deep focus-visible:outline-2 focus-visible:outline-landing-secondary",
  text: "rounded-md bg-transparent text-landing-blue underline-offset-4 hover:underline",
  social:
    "rounded-sm bg-transparent text-landing-social hover:text-landing-blue",
  community:
    "rounded-lg border-0 bg-landing-community text-white hover:bg-landing-blue-hover hover:text-white motion-safe:active:scale-[.98] motion-safe:active:duration-100",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm leading-[1.5]",
  md: "min-h-11 px-5 text-sm leading-[1.5]",
  chip: "min-h-15 w-max max-w-full gap-2.5 rounded-full px-5 py-3 text-[15px] leading-[1.4] pointer-fine:hover:shadow-landing-interactive motion-safe:pointer-fine:hover:-translate-y-0.5 motion-safe:active:scale-[.98] motion-safe:active:translate-y-0 motion-safe:active:duration-100 motion-safe:aria-disabled:active:scale-100 motion-safe:aria-busy:active:scale-100",
  icon: "h-9 min-h-9 w-9 p-0",
  community: "gap-3.5 px-5.5 py-3.25 text-base leading-[1.5]",
  text: "min-h-0 gap-1 p-0 text-[length:inherit] leading-[inherit]",
};

const buttonBase =
  "group group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-[550] transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-landing-out focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-landing-blue disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-default aria-busy:cursor-wait motion-reduce:transition-none";

function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <Link
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
}
