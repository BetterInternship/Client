import type { Metadata, Viewport } from "next";
import "../globals.css";
import { AuthContextProvider } from "@/lib/ctx-auth";
import { RefsContextProvider } from "@/lib/db/use-refs";
import { AppContextProvider } from "@/lib/ctx-app";
import { MoaContextProvider } from "@/lib/db/use-moa";
import { PostHogProvider } from "../posthog-provider";
import TanstackProvider from "../tanstack-provider";
import AllowLanding from "./allowLanding";
import { ConversationsContextProvider } from "@/hooks/use-conversation";
import { PocketbaseProvider } from "@/lib/pocketbase";
import { ModalProvider } from "@/components/providers/ModalProvider";

export const metadata: Metadata = {
  title: "BetterInternship",
  description: "Better Internships Start Here.",
  icons: {
    icon: "/BetterInternshipLogo.ico",
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
      <MoaContextProvider>
        <PostHogProvider>
          <HTMLContent>{children}</HTMLContent>
        </PostHogProvider>
      </MoaContextProvider>
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
                      <div className="min-h-[100dvh] bg-gray-50 flex flex-col pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
                        <div className="flex-1 overflow-y-auto">{children}</div>
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
