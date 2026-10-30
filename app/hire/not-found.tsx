"use client";

import { LandingHeader } from "@/components/landingHire/landing-header";
import { NotFoundPage } from "@/components/not-found/not-found-page";

export default function HireNotFound() {
  return (
    <NotFoundPage
      header={<LandingHeader />}
      fixedHeader
      spriteSrc="/homepage/hero-briefcase.webp"
      spriteAlt="Glossy blue briefcase"
    />
  );
}
