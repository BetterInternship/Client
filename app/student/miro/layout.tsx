import type { Metadata } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_CLIENT_URL || "https://betterinternship.com";
const ogImageUrl = `${baseUrl}/miro-preview.png`;

export const metadata: Metadata = {
  title: "BetterInternship x Miro: Miro-thon!",
  description: "Fight for an internship at Miro",
  openGraph: {
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    images: [ogImageUrl],
  },
};

export default function MiroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
