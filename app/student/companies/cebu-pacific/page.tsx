"use client";

import { IBM_Plex_Mono, Manrope, Sora } from "next/font/google";
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

export default function CebuPacificCompanyProfilePage() {
  return (
    <ScrollStoryView
      model={cebuPacificStoryModel}
      className={cn(
        headingFont.variable,
        monoFont.variable,
        bodyFont.variable,
        "[font-family:var(--font-cebu-story-body)]",
      )}
    />
  );
}
