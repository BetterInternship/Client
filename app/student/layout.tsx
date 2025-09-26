import type { Metadata } from "next";
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
import { ModalProvider } from "@/components/providers/ModalProvider"

export const metadata: Metadata = {
  title: "BetterInternship",
  description: "Better Internships Start Here.",
  icons: {
    icon: "/BetterInternshipLogo.ico",
  },
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
              <html lang="en">
                <body className="overflow-x-hidden m-0 p-0">
                  <ModalProvider>
                    <AllowLanding>
                
                        <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
                          <div className="flex-grow max-h-[100dvh] overflow-auto flex flex-col">
                            {children}
                          </div>
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
