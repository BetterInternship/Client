import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@betterinternship/components";

export type BrandProps = Omit<
  ComponentProps<typeof Link>,
  "href" | "children"
> & {
  href?: ComponentProps<typeof Link>["href"];
  size?: "default" | "compact";
};

export function Brand({
  href = "/",
  size = "default",
  className,
  ...props
}: BrandProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center font-[750] leading-[1.5] tracking-[-.0375rem] text-landing-navy focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-landing-blue",
        size === "compact"
          ? "gap-2 text-base max-md:gap-1.5"
          : "gap-3 text-lg max-md:gap-1.5 max-md:text-base",
        className,
      )}
      aria-label="BetterInternship home"
      {...props}
    >
      <Image
        src="/homepage-logo.png"
        width={36}
        height={36}
        alt=""
        className="h-6 w-6"
      />
      <span>BetterInternship</span>
    </Link>
  );
}
