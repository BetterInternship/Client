import type { Metadata } from "next";
import { createSuperListingMetadata } from "../metadata-utils";

export const metadata: Metadata = createSuperListingMetadata({
  slug: "sofi-ai-marketing",
  title: "BetterInternship x Sofi AI: Marketing Intern",
  socialTitle: "BetterInternship x Sofi AI",
  description:
    "Lead the marketing launch for GIA, SOFI AI's creator analytics product.",
});

export default function SofiAiSuperListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
