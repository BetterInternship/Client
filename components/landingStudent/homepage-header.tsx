import { LandingHeader } from "@/components/landing/landing-header";

const hireHref =
  process.env.NEXT_PUBLIC_CLIENT_HIRE_URL ||
  "https://hire.betterinternship.com";
const loginHref = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;

export function HomepageHeader() {
  return (
    <LandingHeader
      links={[{ label: "For Companies", href: hireHref }]}
      action={{ label: "Log in", href: loginHref }}
    />
  );
}
