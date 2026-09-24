import type { Metadata, Viewport } from "next";
import "../globals.css";
import { AuthContextProvider } from "@/lib/ctx-auth";
import { HeaderContextProvider } from "@/lib/ctx-header";
import { RefsContextProvider } from "@/lib/db/use-refs";
import { AppContextProvider } from "@/lib/ctx-app";
import { getRefsData } from "@/lib/db/use-refs-backend";
import { PostHogProvider } from "../posthog-provider";
import TanstackProvider from "../tanstack-provider";
import AllowLanding from "./allowLanding";
import { ModalProvider } from "@/components/providers/modal-provider/ModalProvider";
import MobileNavWrapper from "@/components/shared/mobile-nav-wrapper";
import { SonnerToaster } from "@/components/ui/sonner-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppMQJobsProvider } from "@/components/providers/mq-jobs-provider";
import { FilloutJobsProvider } from "@/hooks/forms/filloutFormProcess";
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
  const refsData = await getRefsData();

  return (
    <RefsContextProvider data={refsData}>
      <PostHogProvider>
        <HTMLContent>{children}</HTMLContent>
      </PostHogProvider>
    </RefsContextProvider>
  );
};

/**
 * I don't like overly-nested components lol.
 *
 * @component
 */

const HTMLContent = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <TanstackProvider>
      <AppContextProvider>
        <AuthContextProvider>
          <TooltipProvider>
            <HeaderContextProvider>
              <html lang="en" className="h-full">
                <body className="h-full overflow-x-hidden m-0 p-0 antialiased">
                  <AppMQJobsProvider>
                    <FilloutJobsProvider>
                      <ModalProvider>
                        <div className="h-screen bg-background overflow-hidden flex flex-col">
                          <div className="relative flex-grow max-h-[100svh] max-w-[100svw] overflow-auto flex flex-col">
                            <AllowLanding>{children}</AllowLanding>
                          </div>
                          <MobileNavWrapper />
                        </div>
                      </ModalProvider>
                    </FilloutJobsProvider>
                  </AppMQJobsProvider>
                  <SonnerToaster />
                </body>
              </html>
            </HeaderContextProvider>
          </TooltipProvider>
        </AuthContextProvider>
      </AppContextProvider>
    </TanstackProvider>
  );
};

export default RootLayout;
