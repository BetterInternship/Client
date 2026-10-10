import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@betterinternship/components";
import { LinkButton } from "@/components/ui/temp/button";
import { Brand } from "./brand";
import { landingContainerClassName } from "./layout";

export type LandingLink = {
  label: string;
  href: ComponentProps<typeof Link>["href"];
};

export type LandingHeaderProps = {
  links: LandingLink[];
  action: LandingLink;
  brandHref?: ComponentProps<typeof Brand>["href"];
  className?: string;
};

export function LandingHeader({
  links,
  action,
  brandHref,
  className,
}: LandingHeaderProps) {
  return (
    <header
      className={cn(
        landingContainerClassName,
        "relative z-10 flex min-h-[76px] items-center justify-between gap-6 max-md:grid max-md:min-h-[72px] max-md:grid-cols-[1fr_auto] max-md:gap-x-3 max-md:gap-y-1 max-md:py-3",
        className,
      )}
    >
      <Brand href={brandHref} />
      <nav
        className="flex items-center gap-7 text-[15px] font-[550] leading-[1.5] text-landing-nav max-md:contents max-md:text-xs"
        aria-label="Main navigation"
      >
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="cursor-pointer text-landing-nav transition-colors duration-[180ms] hover:text-landing-blue focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-landing-blue max-md:hidden"
          >
            {link.label}
          </Link>
        ))}
        <LinkButton
          href={action.href}
          variant="outline"
          size="sm"
          className="min-h-0 gap-2 px-4.5 py-2 text-base font-[550] leading-[1.5] hover:border-landing-blue hover:bg-landing-tint hover:text-landing-blue max-md:order-2 max-md:px-4 max-md:py-1.75"
        >
          {action.label}
          <ArrowRight
            size={15}
            className="transition-transform duration-200 ease-landing-out motion-safe:pointer-fine:group-hover/button:translate-x-[3px] motion-reduce:transition-none"
            aria-hidden="true"
          />
        </LinkButton>
      </nav>
    </header>
  );
}
