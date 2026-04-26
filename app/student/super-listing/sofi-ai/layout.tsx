import type { Metadata } from "next";
import { createSuperListingMetadata } from "../metadata-utils";

export const metadata: Metadata = createSuperListingMetadata({
  slug: "sofi-ai",
  title: "BetterInternship x Sofi AI: Frontend AI Product Challenge",
  socialTitle: "BetterInternship x Sofi AI",
  description:
    "Build a practical frontend experience for AI-powered TikTok hook analysis.",
});

export default function SofiAiSuperListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}




