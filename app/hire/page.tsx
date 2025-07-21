"use client";

import {
  HeroSection,
  DemoOne,
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
      {/* Companies showcase */}
      <LogoCarouselBasic />
      {/* Benefits clickable */}
      <DemoOne />

      <div className="dark">
        <Footer />
      </div>
    </div>
  );
}
