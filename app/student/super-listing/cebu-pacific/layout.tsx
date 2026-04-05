import type { Metadata } from "next";
import { createSuperListingMetadata } from "../metadata-utils";

export const metadata: Metadata = createSuperListingMetadata({
  slug: "cebu-pacific",
  title: "BetterInternship x Cebu Pacific: Digital Travel Experience Challenge",
  socialTitle: "BetterInternship x Cebu Pacific Super Listing",
  description:
    "Design practical product solutions that improve the Cebu Pacific passenger journey across booking, check-in, and support.",
});

export default function CebuPacificLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
