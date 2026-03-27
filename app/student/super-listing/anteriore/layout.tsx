import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BetterInternship x Anteriore Super Listing",
  openGraph: {
    title: "BetterInternship x Anteriore Super Listing",

    url: "/super-listing/anteriore",
    siteName: "BetterInternship",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BetterInternship x Anteriore Super Listing",
  },
};

export default function AnterioreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
