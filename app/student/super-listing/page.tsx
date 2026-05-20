import { JetBrains_Mono, Open_Sans, Space_Grotesk } from "next/font/google";

import PhilippinesInfographicMap from "@/components/features/student/super-listing/philippines-infographic-map";
import { cn } from "@/lib/utils";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-challenge-ph-heading",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-challenge-ph-mono",
});

const bodyFont = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-challenge-ph-body",
});

export default function SuperListingsLandingPage() {
  return (
    <main
      className={cn(
        "min-h-screen bg-[#001138] [font-family:var(--font-challenge-ph-body)]",
        headingFont.variable,
        monoFont.variable,
        bodyFont.variable,
      )}
    >
      <PhilippinesInfographicMap />
    </main>
  );
}
