import type { Metadata } from "next";
import "../globals.css";
import { AuthContextProvider } from "@/lib/ctx-auth";
import { RefsContextProvider } from "@/lib/db/use-refs";
import Header from "@/components/features/student/header";
import { AppContextProvider } from "@/lib/ctx-app";
import { Footer } from "@/components/shared/footer";
import { MoaContextProvider } from "@/lib/db/use-moa";
import { PostHogProvider } from "../posthog-provider";
import TanstackProvider from "../tanstack-provider";
import AllowLanding from "./allowLanding";

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
      <AppContextProvider>
        <AuthContextProvider>
          <html lang="en">
            <body>
              <AllowLanding>
                <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
                  <div className="flex-grow max-h-[100%] overflow-hidden flex flex-col">
                    {children}
                  </div>
                </div>
              </AllowLanding>
            </body>
          </html>
        </AuthContextProvider>
      </AppContextProvider>
    </TanstackProvider>
  );
};

export default RootLayout;
