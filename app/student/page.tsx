"use client";

import { HeroSection, Feature } from "@/components/landingStudent/sections";
import Testimonials from "@/components/landingStudent/sections/3rdSection/testimonials";
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
      <Testimonials />

      <Footer />
    </div>
  );
}
