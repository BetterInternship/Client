import type { Metadata } from "next";
import { createSuperListingMetadata } from "../metadata-utils";

export const metadata: Metadata = createSuperListingMetadata({
  slug: "anteriore",
  title: "BetterInternship x Anteriore Super Listing",
  description:
    "Build practical product and engineering solutions alongside Anteriore in a high-growth startup environment.",
});

export default function AnterioreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
