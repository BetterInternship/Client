import type { Metadata } from "next";

const title = "Sofi AI | BetterInternship";
const description =
  "Meet Sofi AI, a Filipino AI company building human-sounding support automation for online businesses.";
const socialTitle = "BetterInternship x Sofi AI";
const imageUrl = "/companies/sofi-ai/og";
const canonicalUrl = "/companies/sofi-ai";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: socialTitle,
    description,
    url: canonicalUrl,
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: socialTitle,
      },
    ],
    siteName: "BetterInternship",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description,
    images: [imageUrl],
  },
};

export default function SofiAiCompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
