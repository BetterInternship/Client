"use client";

import {
  LandingHeader,
  HeaderLink,
} from "@/components/landingHire/landing-header";
import {
  HeroSection,
  Preview,
  FAQ,
  LogoCarouselBasic,
} from "@/components/landingHire/sections";
import { ConnectUniversitySection } from "@/components/landingHire/sections/connect-university";
import { useEffect, useRef, useState } from "react";

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [isPastHero, setIsPastHero] = useState(false);

  useEffect(() => {
    const heroElement = heroRef.current;
    if (!heroElement) return;

    const heroImage = heroElement.querySelector("img");
    if (!heroImage) return;

    const navHeight = window.innerWidth < 768 ? 64 : 80;

    const observer = new IntersectionObserver(
      ([entry]) => setIsPastHero(!entry.isIntersecting),
      {
        root: null,
        threshold: 0,
        rootMargin: `-${navHeight}px 0px 0px 0px`,
      },
    );

    observer.observe(heroImage);
    return () => observer.disconnect();
  }, []);

  const headerLinks: HeaderLink[] = [
    {
      label: "Why BetterInternship",
      href: "#why",
    },
    {
      label: "FAQ",
      href: "#faq",
    },
    {
      label: "About Us",
      href: "#about",
    },
  ];

  return (
    <div className="flex flex-col gap-0 p-0">
      <LandingHeader isPastHero={isPastHero} links={headerLinks} />
      <div ref={heroRef}>
        <HeroSection />
      </div>
      <ConnectUniversitySection />
      {/* FAQ */}
      <FAQ />

      {/* Call To Action */}
      <Preview />

      {/* Companies showcase */}
      <LogoCarouselBasic />
    </div>
  );
}
