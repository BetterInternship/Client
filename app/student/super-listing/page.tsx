import { Open_Sans, Space_Grotesk } from "next/font/google";

import PhilippinesInfographicMap from "@/components/features/student/super-listing/philippines-infographic-map";
import { cn } from "@/lib/utils";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-super-listing-heading",
});

const bodyFont = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-super-listing-body",
});

export default function SuperListingsLandingPage() {
  return (
    <main
      className={cn(
        "min-h-screen bg-white [font-family:var(--font-super-listing-body)] [&_h1]:[font-family:var(--font-super-listing-heading)]",
        headingFont.variable,
        bodyFont.variable,
      )}
    >
      <PhilippinesInfographicMap />
    </main>
  );
}
