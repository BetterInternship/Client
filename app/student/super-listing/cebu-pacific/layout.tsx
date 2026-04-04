import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BetterInternship x Cebu Pacific: Digital Travel Experience Challenge",
  description:
    "Design practical product solutions that improve the Cebu Pacific passenger journey across booking, check-in, and support.",
  openGraph: {
    title: "BetterInternship x Cebu Pacific Super Listing",
    description:
      "Design practical product solutions that improve the Cebu Pacific passenger journey across booking, check-in, and support.",
    url: "/super-listing/cebu-pacific",
    images: [
      {
        url: "/student-preview.png",
        width: 1200,
        height: 630,
        alt: "BetterInternship x Cebu Pacific Super Listing",
      },
    ],
    siteName: "BetterInternship",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BetterInternship x Cebu Pacific Super Listing",
    description:
      "Design practical product solutions that improve the Cebu Pacific passenger journey across booking, check-in, and support.",
    images: ["/student-preview.png"],
  },
};

export default function CebuPacificLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
