import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "BetterInternship x Paraluman News: Multilingual News Delivery Challenge",
  description:
    "Design a practical multilingual publishing solution for Paraluman News that balances speed, accuracy, editorial integrity, and reader trust.",
  openGraph: {
    title:
      "BetterInternship x Paraluman News: Multilingual News Delivery Challenge",
    description:
      "Design a practical multilingual publishing solution for Paraluman News that balances speed, accuracy, editorial integrity, and reader trust.",
    url: "/super-listing/paraluman",
    siteName: "BetterInternship",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "BetterInternship x Paraluman News: Multilingual News Delivery Challenge",
    description:
      "Design a practical multilingual publishing solution for Paraluman News that balances speed, accuracy, editorial integrity, and reader trust.",
  },
};

export default function ParalumanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
