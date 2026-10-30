import type { ReactNode } from "react";
import { StudentNavigation } from "@/components/features/student/navigation/student-navigation";
import { HomepageFooter } from "@/components/landingStudent/homepage-footer";
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
        className="absolute left-2 top-2 z-50 -translate-y-[180%] bg-white px-5 py-3 focus:translate-y-0"
        href="#guides-main"
      >
        Skip to content
      </a>
      <StudentNavigation
        preset="public"
        links={[
          { label: "Guides", href: "/guides", current: true },
          {
            label: "For Companies",
            href:
              process.env.NEXT_PUBLIC_CLIENT_HIRE_URL ||
              "https://hire.betterinternship.com",
          },
        ]}
      />
      {children}
      <HomepageFooter />
    </div>
  );
}
