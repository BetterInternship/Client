import type { Metadata, Viewport } from "next";
import "../globals.css";
import { AuthContextProvider } from "@/lib/ctx-auth";
import { RefsContextProvider } from "@/lib/db/use-refs";
import { AppContextProvider } from "@/lib/ctx-app";
import { BIMoaContextProvider } from "@/lib/db/use-bi-moa";
import { PostHogProvider } from "../posthog-provider";
import TanstackProvider from "../tanstack-provider";
import AllowLanding from "./allowLanding";
import { ConversationsContextProvider } from "@/hooks/use-conversation";
import { PocketbaseProvider } from "@/lib/pocketbase";
import { ModalProvider } from "@/components/providers/ModalProvider";
import MobileNavWrapper from "@/components/shared/mobile-nav-wrapper";

export const metadata: Metadata = {
  title: "BetterInternship",
  description: "Better Internships Start Here.",
  icons: {
    icon: "/BetterInternshipLogo.ico",
  },
  openGraph: {
    title: "BetterInternship",
    description: "Better Internships Start Here.",
    url: "https://betterinternship.com",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "BetterInternship Logo",
      },
    ],
    siteName: "BetterInternship",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BetterInternship",
    description: "Better Internships Start Here.",
    images: ["/logo.png"],
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
export const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <RefsContextProvider>
      <BIMoaContextProvider>
        <PostHogProvider>
          <HTMLContent>{children}</HTMLContent>
        </PostHogProvider>
      </BIMoaContextProvider>
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
      <PocketbaseProvider type={"user"}>
        <AppContextProvider>
          <AuthContextProvider>
            <ConversationsContextProvider type="user">
              <html lang="en" className="h-full">
                <body className="h-full overflow-x-hidden m-0 p-0 antialiased">
                  <ModalProvider>
                    <AllowLanding>
                      <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
                        <div className="relative flex-grow max-h-[100svh] max-w-[100svw] overflow-auto flex flex-col">
                          {children}
                        </div>
                        <MobileNavWrapper />
                      </div>
                    </AllowLanding>
                  </ModalProvider>
                </body>
              </html>
            </ConversationsContextProvider>
          </AuthContextProvider>
        </AppContextProvider>
      </PocketbaseProvider>
    </TanstackProvider>
  );
};

export default RootLayout;
