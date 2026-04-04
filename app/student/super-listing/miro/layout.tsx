import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BetterInternship x Miro: Miro-thon!",
  description: "Fight for an internship at Miro",
  openGraph: {
    title: "BetterInternship x Miro: Miro-thon!",
    description: "Fight for an internship at Miro",
    url: "/super-listing/miro",
    siteName: "BetterInternship",
    type: "website",
    images: [
      {
        url: "/miro-preview.png",
        width: 1200,
        height: 630,
        alt: "BetterInternship x Miro: Miro-thon!",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BetterInternship x Miro: Miro-thon!",
    description: "Fight for an internship at Miro",
    images: ["/miro-preview.png"],
  },
};

export default function MiroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
