import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BetterInternship x Anteriore Super Listing",
  description:
    "Build practical product and engineering solutions alongside Anteriore in a high-growth startup environment.",
  openGraph: {
    title: "BetterInternship x Anteriore Super Listing",
    description:
      "Build practical product and engineering solutions alongside Anteriore in a high-growth startup environment.",
    url: "/super-listing/anteriore",
    images: [
      {
        url: "/student-preview.png",
        width: 1200,
        height: 630,
        alt: "BetterInternship x Anteriore Super Listing",
      },
    ],
    siteName: "BetterInternship",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BetterInternship x Anteriore Super Listing",
    description:
      "Build practical product and engineering solutions alongside Anteriore in a high-growth startup environment.",
    images: ["/student-preview.png"],
  },
};

export default function AnterioreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
