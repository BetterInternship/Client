import { Facebook, Mail, MessageCircle } from "lucide-react";
import { LandingFooter } from "@/components/landing/landing-footer";
import {
  BI_DISCORD_INVITE,
  STUDENT_FORM_GUIDE,
  SUPPORT_EMAIL_LINK,
  SUPPORT_FACEBOOK,
} from "@/constants";

const hireHref =
  process.env.NEXT_PUBLIC_CLIENT_HIRE_URL ||
  "https://hire.betterinternship.com";

export function HomepageFooter() {
  return (
    <LandingFooter
      groups={[
        {
          title: "For Students",
          links: [
            { label: "Find Internships", href: "/search" },
            { label: "Guides", href: STUDENT_FORM_GUIDE },
          ],
        },
        {
          title: "For Companies",
          links: [
            { label: "Post Opportunities", href: hireHref },
            { label: "Contact Us", href: SUPPORT_EMAIL_LINK },
          ],
        },
      ]}
      socialLinks={[
        {
          label: "BetterInternship Discord",
          href: BI_DISCORD_INVITE,
          icon: <MessageCircle size={19} aria-hidden="true" />,
        },
        {
          label: "BetterInternship on Facebook",
          href: SUPPORT_FACEBOOK,
          icon: <Facebook size={19} aria-hidden="true" />,
        },
        {
          label: "Email BetterInternship",
          href: SUPPORT_EMAIL_LINK,
          icon: <Mail size={19} aria-hidden="true" />,
        },
      ]}
      legalLinks={[
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ]}
      copyright={`© ${new Date().getFullYear()} BetterInternship.`}
    />
  );
}
