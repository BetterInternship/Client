import type { Metadata } from "next";
import { createSuperListingMetadata } from "../metadata-utils";

export const metadata: Metadata = createSuperListingMetadata({
  slug: "miro",
  title: "BetterInternship x Miro: Miro-thon!",
  description: "Fight for an internship at Miro",
});

export default function MiroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
