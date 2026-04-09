"use client";

import { IBM_Plex_Mono, Manrope, Playfair_Display, Sora } from "next/font/google";
import { cn } from "@/lib/utils";
import { cebuPacificStoryModel } from "./cebu-pacific-story";
import { ScrollStoryView } from "./components/ScrollStoryView";

const headingFont = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cebu-story-heading",
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cebu-story-mono",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cebu-story-body",
});

const heroTitleFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-cebu-hero-title",
});

export default function CebuPacificCompanyProfilePage() {
  return (
    <ScrollStoryView
      model={cebuPacificStoryModel}
      className={cn(
        headingFont.variable,
        monoFont.variable,
        bodyFont.variable,
        heroTitleFont.variable,
        "[font-family:var(--font-cebu-story-body)]",
      )}
    />
  );
}
