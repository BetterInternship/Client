import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BetterInternship x FFF: Startup Accelerator Intern",
  description:
    "Scout top AI-native builders, network deeply, and help scale the next startup accelerator.",
  openGraph: {
    title: "BetterInternship x FFF: Startup Accelerator Intern",
    description:
      "Scout top AI-native builders, network deeply, and help scale the next startup accelerator.",
    url: "/super-listing/fff",
    images: [
      {
        url: "/super-listing/fff/opengraph-image",
        width: 1200,
        height: 630,
        alt: "BetterInternship x FFF: Startup Accelerator Intern",
      },
    ],
    siteName: "BetterInternship",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BetterInternship x FFF: Startup Accelerator Intern",
    description:
      "Scout top AI-native builders, network deeply, and help scale the next startup accelerator.",
    images: ["/super-listing/fff/opengraph-image"],
  },
};

export default function FFFLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
