"use client";

import { useRef } from "react";
import { JetBrains_Mono, Open_Sans, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import { AboutUsSection } from "./components/AboutUsSection";
import { ProfileHero } from "./components/ProfileHero";
import { ProfileListings } from "./components/ProfileListings";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { WhoWeAreSection } from "./components/WhoWeAreSection";
import { cebuPacificProfile } from "./data";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-cebu-company-heading",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-cebu-company-mono",
});

const bodyFont = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cebu-company-body",
});

export default function CebuPacificCompanyProfilePage() {
  const contentRef = useRef<HTMLElement | null>(null);
  const listingsRef = useRef<HTMLElement | null>(null);

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main
      className={cn(
        headingFont.variable,
        monoFont.variable,
        bodyFont.variable,
        "relative isolate min-h-screen bg-[#f7fbff] [font-family:var(--font-cebu-company-body)] text-[#163958]",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_8%_12%,rgba(37,116,187,0.15),transparent_38%),radial-gradient(circle_at_88%_8%,rgba(243,217,138,0.15),transparent_34%),radial-gradient(circle_at_50%_92%,rgba(37,116,187,0.08),transparent_44%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.045)_1px,transparent_1px)] bg-[size:46px_46px] opacity-28"
      />

      <ProfileHero
        profile={cebuPacificProfile}
        onScrollToContent={scrollToContent}
      />

      <section ref={contentRef}>
        <AboutUsSection section={cebuPacificProfile.about} />
        <WhoWeAreSection section={cebuPacificProfile.internCulture} />
        <TestimonialsSection testimonials={cebuPacificProfile.testimonials} />
      </section>

      <section ref={listingsRef}>
        <ProfileListings profile={cebuPacificProfile} />
      </section>
    </main>
  );
}
