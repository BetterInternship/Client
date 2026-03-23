import type { Metadata } from "next";

const ogImageUrl = "https://fff-hub.com/opengraph.jpg";

export const metadata: Metadata = {
  title: "BetterInternship x FFF: Startup Accelerator Intern",
  description:
    "Scout top AI-native builders, network deeply, and help scale the next startup accelerator.",
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

export default function FFFLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
