import { LandingHeader } from "@/components/landing/landing-header";
import { googleLoginUrl } from "@/lib/api/urls";

const hireHref =
  process.env.NEXT_PUBLIC_CLIENT_HIRE_URL ||
  "https://hire.betterinternship.com";

export function HomepageHeader() {
  return (
    <LandingHeader
      links={[
        { label: "Guides", href: "/guides" },
        { label: "For Companies", href: hireHref },
      ]}
      action={{ label: "Log in", href: googleLoginUrl() }}
    />
  );
}
