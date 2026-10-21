import type { Metadata, Viewport } from "next";

import { StudentFoundation } from "@/components/providers/student-foundation";
import { RefsContextProvider } from "@/lib/db/use-refs";
import { getRefsData } from "@/lib/db/use-refs-backend";
import { baseUrl } from "@/lib/site-url";

import { inter } from "../fonts";
import { PostHogProvider } from "../posthog-provider";
import StudentRouteShell from "./student-route-shell";

import "../globals.css";

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

/** Student root layout: site defaults, reference data, and shared providers. */
const StudentRootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const refsData = await getRefsData();

  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="h-full overflow-x-hidden m-0 p-0 antialiased">
        <RefsContextProvider data={refsData}>
          <PostHogProvider>
            <StudentFoundation>
              <StudentRouteShell>{children}</StudentRouteShell>
            </StudentFoundation>
          </PostHogProvider>
        </RefsContextProvider>
      </body>
    </html>
  );
};

export default StudentRootLayout;
