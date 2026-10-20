import type { Metadata, Viewport } from "next";
import "../globals.css";
import { inter } from "../fonts";
import { RefsContextProvider } from "@/lib/db/use-refs";
import { getJobRefs } from "@/lib/db/use-refs-backend";
import { PostHogProvider } from "../posthog-provider";
import StudentRouteShell from "./student-route-shell";
import { baseUrl } from "@/lib/site-url";

const ogImage = `${baseUrl}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "BetterInternship",
  description: "Better Internships Start Here.",
  icons: {
    icon: "/BetterInternshipLogo.ico",
  },
  openGraph: {
    title: "BetterInternship",
    description: "Better Internships Start Here.",
    url: baseUrl,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "BetterInternship",
      },
    ],
    siteName: "BetterInternship",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BetterInternship",
    description: "Better Internships Start Here.",
    images: [ogImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * A template for all pages on the site.
 *
 * @component
 */
const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const jobRefs = await getJobRefs();

  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="h-full overflow-x-hidden m-0 p-0 antialiased">
        <RefsContextProvider jobRefs={jobRefs}>
          <PostHogProvider>
            <StudentRouteShell>{children}</StudentRouteShell>
          </PostHogProvider>
        </RefsContextProvider>
      </body>
    </html>
  );
};

export default RootLayout;
