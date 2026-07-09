"use client";

import { LogoCarousel } from "@/components/landingStudent/sections/5thSection/companies";
import { demoLogos } from "@/components/landingStudent/sections/5thSection/sectionpage";

export function SocialProofSection() {
  return (
    <section className="relative h-fit flex flex-col justify-center items-center overflow-hidden px-8 py-24">
      <h2 className="max-w-7xl tracking-tighter">Trusted by these brands</h2>
      <LogoCarousel logos={demoLogos} />
    </section>
  );
}
