"use client";

import { Manrope, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";
import { cebuPacificStoryModel } from "./cebu-pacific-story";
import { ScrollStoryView } from "./components/ScrollStoryView";

const displayFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-cebu-story-display",
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
        displayFont.variable,
        bodyFont.variable,
        "[font-family:var(--font-cebu-story-body)]",
      )}
    />
  );
}
