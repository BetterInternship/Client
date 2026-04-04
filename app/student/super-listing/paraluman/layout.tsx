import type { Metadata } from "next";
import { createSuperListingMetadata } from "../metadata-utils";

export const metadata: Metadata = createSuperListingMetadata({
  slug: "paraluman",
  title:
    "BetterInternship x Paraluman News: Multilingual News Delivery Challenge",
  socialTitle: "BetterInternship x Paraluman News Super Listing",
  description:
    "Design a practical multilingual publishing solution for Paraluman News that balances speed, accuracy, editorial integrity, and reader trust.",
});

export default function ParalumanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
