import type { Metadata } from "next";
import { createSuperListingMetadata } from "../metadata-utils";

export const metadata: Metadata = createSuperListingMetadata({
  slug: "pcc",
  title:
    "BetterInternship x Philippine Chamber of Commerce: Business Innovation Challenge",
  socialTitle: "BetterInternship x Philippine Chamber of Commerce",
  description:
    "Design practical solutions that reduce business-process friction and improve member outcomes for Philippine enterprises.",
});

export default function PccSuperListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
