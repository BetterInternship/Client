"use client";

import { Manrope } from "next/font/google";
import { cn } from "@/lib/utils";
import { cebuPacificStoryModel } from "./cebu-pacific-story";
import { ScrollStoryView } from "./components/ScrollStoryView";

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cebu-story-body",
});

export default function CebuPacificCompanyProfilePage() {
  return (
    <ScrollStoryView
      model={cebuPacificStoryModel}
      className={cn(bodyFont.variable, "[font-family:var(--font-cebu-story-body)]")}
    />
  );
}
