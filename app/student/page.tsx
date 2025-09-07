"use client";

import {
  HeroSection,
  PlatformSection,
  Feature,
} from "@/components/landingStudent/sections";
import { Footer } from "@/components/shared/footer";
import { useAuthContext } from "@/lib/ctx-auth";

export default function HomePage() {
  const { redirectIfLoggedIn } = useAuthContext();
  redirectIfLoggedIn();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      {/* Apply Fast */}
      <Feature />
      {/* Benefits clickable */}
      <PlatformSection />

      <Footer />
    </div>
  );
}
