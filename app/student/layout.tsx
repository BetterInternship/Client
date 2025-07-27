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
          <PocketbaseProvider type={"user"}>
            <HTMLContent>{children}</HTMLContent>
          </PocketbaseProvider>
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
      <AppContextProvider>
        <AuthContextProvider>
          <ConversationsContextProvider type="user">
            <html lang="en">
              <body className="overflow-x-hidden m-0 p-0">
                <AllowLanding>
                  <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
                    <div className="flex-grow max-h-[100%] overflow-auto flex flex-col">
                      {children}
                    </div>
                  </div>
                </AllowLanding>
              </body>
            </html>
          </ConversationsContextProvider>
        </AuthContextProvider>
      </AppContextProvider>
    </TanstackProvider>
  );
};

export default RootLayout;
