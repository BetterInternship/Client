"use client";

import { LandingHeader } from "@/components/landingHire/landing-header";
import { HeroSection } from "@/components/landingHire/sections/hero";
import { FeaturesSection } from "@/components/landingHire/sections/features";
import { FAQsSection } from "@/components/landingHire/sections/faqs";
import { useEffect, useRef, useState } from "react";
import { EndSection } from "@/components/landingHire/sections/end";
import { SocialProofSection } from "@/components/landingHire/sections/social-proof";
import { Footer } from "@/components/shared/footer";

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

  return (
    <div className="flex flex-col gap-0 p-0">
      <LandingHeader isPastHero={isPastHero} />
      <div ref={heroRef}>
        <HeroSection />
      </div>
      <SocialProofSection />
      <div id="features" className="scroll-mt-64">
        <FeaturesSection />
      </div>
      <div id="faqs" className="scroll-mt-12">
        <FAQsSection />
      </div>
      <EndSection />
      <Footer />
    </div>
  );
}
