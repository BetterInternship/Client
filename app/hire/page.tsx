"use client";

import {
  HeroSection,
  TimelineDemo,
  Preview,
  FAQ,
  LogoCarouselBasic
} from "@/components/landingHire/sections";
import { Navigation } from "@/components/landingHire/navigation";
import { Footer } from "@/components/shared/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen dark dark:bg-black">
      {/* Navbar */}
      <Navigation />
      {/* Hero Section */}
      <HeroSection />
      {/* Benefits clickable */}
      <div>
        <TimelineDemo />
      </div>
      {/* FAQ */}
      <FAQ/>


      {/* Call To Action */}
      <Preview />

        {/* Companies showcase */}
      <LogoCarouselBasic />

      <div className="dark">
        <Footer />
      </div>
    </div>
  );
}
