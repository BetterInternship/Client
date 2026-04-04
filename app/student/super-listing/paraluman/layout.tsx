import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "BetterInternship x Paraluman News: Multilingual News Delivery Challenge",
  description:
    "Design a practical multilingual publishing solution for Paraluman News that balances speed, accuracy, editorial integrity, and reader trust.",
  openGraph: {
    title: "BetterInternship x Paraluman News Super Listing",
    description:
      "Design a practical multilingual publishing solution for Paraluman News that balances speed, accuracy, editorial integrity, and reader trust.",
    url: "/super-listing/paraluman",
    images: [
      {
        url: "/student-preview.png",
        width: 1200,
        height: 630,
        alt: "BetterInternship x Paraluman News Super Listing",
      },
    ],
    siteName: "BetterInternship",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BetterInternship x Paraluman News Super Listing",
    description:
      "Design a practical multilingual publishing solution for Paraluman News that balances speed, accuracy, editorial integrity, and reader trust.",
    images: ["/student-preview.png"],
  },
};

export default function ParalumanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
