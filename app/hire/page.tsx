"use client";

import {
  LandingHeader,
  HeaderLink,
} from "@/components/landingHire/landing-header";
import { HeroSection } from "@/components/landingHire/sections/hero";
import { FeaturesSection } from "@/components/landingHire/sections/features";
import { FAQsSection } from "@/components/landingHire/sections/faqs";
import { useEffect, useRef, useState } from "react";
import { EndSection } from "@/components/landingHire/sections/end";

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
      href: "#features",
    },
    {
      label: "FAQ",
      href: "#faqs",
    },
  ];

  return (
    <div className="flex flex-col gap-0 p-0">
      <LandingHeader isPastHero={isPastHero} links={headerLinks} />
      <div ref={heroRef}>
        <HeroSection />
      </div>
      <div id="features" className="scroll-mt-64">
        <FeaturesSection />
      </div>
      <div id="faqs" className="scroll-mt-12">
        <FAQsSection />
      </div>
      <EndSection />
    </div>
  );
}
