import type { ReactNode } from "react";
import { LandingHeader } from "@/components/landing/landing-header";
import { HomepageFooter } from "@/components/landingStudent/homepage-footer";
import { googleLoginUrl } from "@/lib/api/urls";
import { topAccentStyle } from "@/lib/utils/top-page-presentation";

/** Public visual wrapper only. The parent student layout owns refs and analytics;
 * do not mount duplicate providers here. Artwork matches the landing page. */
export function GuidesShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative isolate min-h-full shrink-0 overflow-x-clip bg-white text-landing-navy [&>main]:relative [&_a:focus-visible]:outline-3 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-landing-blue [&_button:focus-visible]:outline-3 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-landing-blue [&_summary:focus-visible]:outline-3 [&_summary:focus-visible]:outline-offset-4 [&_summary:focus-visible]:outline-landing-blue"
      style={topAccentStyle()}
    >
      <a
        className="absolute left-2 top-2 z-20 -translate-y-[180%] bg-white px-5 py-3 focus:translate-y-0"
        href="#guides-main"
      >
        Skip to content
      </a>
      <LandingHeader
        links={[
          { label: "Find internships", href: "/search" },
          { label: "Guides", href: "/guides", current: true },
          {
            label: "For Companies",
            href:
              process.env.NEXT_PUBLIC_CLIENT_HIRE_URL ||
              "https://hire.betterinternship.com",
          },
        ]}
        action={{
          label: "Log in",
          href: googleLoginUrl(),
        }}
      />
      {children}
      <HomepageFooter />
    </div>
  );
}
