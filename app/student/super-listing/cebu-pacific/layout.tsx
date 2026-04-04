import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BetterInternship x Cebu Pacific: Digital Travel Experience Challenge",
  description:
    "Design practical product solutions that improve the Cebu Pacific passenger journey across booking, check-in, and support.",
  openGraph: {
    title: "BetterInternship x Cebu Pacific Super Listing",

    url: "/super-listing/cebu-pacific",
    siteName: "BetterInternship",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BetterInternship x Cebu Pacific Super Listing",
  },
};

export default function CebuPacificLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
