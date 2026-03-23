import type { Metadata } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_CLIENT_URL || "https://betterinternship.com";
const pageUrl = `${baseUrl}/fff`;
const ogImageUrl = `${baseUrl}/fff/opengraph-image`;

export const metadata: Metadata = {
  title: "BetterInternship x FFF: Startup Accelerator Intern",
  description:
    "Scout top AI-native builders, network deeply, and help scale the next startup accelerator.",
  openGraph: {
    title: "BetterInternship x FFF: Startup Accelerator Intern",
    description:
      "Scout top AI-native builders, network deeply, and help scale the next startup accelerator.",
    url: pageUrl,
    siteName: "BetterInternship",
    type: "website",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BetterInternship x FFF: Startup Accelerator Intern",
    description:
      "Scout top AI-native builders, network deeply, and help scale the next startup accelerator.",
    images: [ogImageUrl],
  },
};

export default function FFFLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
