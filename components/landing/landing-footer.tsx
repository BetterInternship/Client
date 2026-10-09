import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@betterinternship/components";
import { LinkButton } from "@/components/ui/temp/button";
import { Brand } from "./brand";
import { landingContainerClassName } from "./layout";
import type { LandingLink } from "./landing-header";

export type LandingFooterProps = {
  groups: { title: string; links: LandingLink[] }[];
  socialLinks: (LandingLink & { icon: ReactNode })[];
  legalLinks: LandingLink[];
  copyright: ReactNode;
  brandHref?: ComponentProps<typeof Brand>["href"];
  className?: string;
};

export function LandingFooter({
  groups,
  socialLinks,
  legalLinks,
  copyright,
  brandHref,
  className,
}: LandingFooterProps) {
  return (
    <footer
      className={cn(
        "relative z-10 border-t border-landing-border bg-landing-footer pt-10 pb-6",
        className,
      )}
    >
      <div
        className={cn(
          landingContainerClassName,
          "grid grid-cols-[minmax(0,1fr)_150px_150px] items-baseline gap-8 pb-4 max-[900px]:grid-cols-[1.4fr_1fr_1fr] max-[480px]:grid-cols-2",
        )}
      >
        <div className="max-[480px]:col-span-full">
          <Brand href={brandHref} size="compact" />
          <nav
            className="mt-2 flex gap-1"
            aria-label="Social and contact links"
          >
            {socialLinks.map((link) => (
              <LinkButton
                key={link.label}
                href={link.href}
                variant="social"
                size="icon"
                aria-label={link.label}
              >
                {link.icon}
              </LinkButton>
            ))}
          </nav>
        </div>
        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h3 className="m-0 mb-3 text-[13px] font-bold leading-[1.5] text-landing-navy">
              {group.title}
            </h3>
            {group.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="mt-2 block cursor-pointer text-[13px] leading-[1.7] text-landing-muted hover:text-landing-blue focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-landing-blue"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div
        className={cn(
          landingContainerClassName,
          "flex items-center justify-start gap-6 pt-2 text-xs leading-[1.7] text-landing-muted max-[480px]:flex-col max-[480px]:items-start",
        )}
      >
        <nav
          className="flex flex-wrap items-center gap-x-6 gap-y-3"
          aria-label="Legal"
        >
          {legalLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="cursor-pointer text-landing-muted focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-landing-blue"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="m-0 ml-auto text-xs leading-[1.7] text-landing-muted">
          {copyright}
        </p>
      </div>
    </footer>
  );
}
