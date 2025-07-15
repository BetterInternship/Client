import type { Metadata } from "next";
import "../globals.css";
import { AuthContextProvider } from "./authctx";
import { RefsContextProvider } from "@/lib/db/use-refs";
import { AppContextProvider } from "@/lib/ctx-app";
import Header from "@/components/features/hire/header";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Footer } from "@/components/shared/footer";
import { MoaContextProvider } from "@/lib/db/use-moa";
import { PostHogProvider } from "../posthog-provider";
import TanstackProvider from "../tanstack-provider";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Recruiter Dashboard - BetterInternship",
  description: "Manage applications and candidates",
  icons: {
    icon: "/BetterInternshipLogo.ico",
  },
};

/**
 * Hire root layout
 *
 * @component
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RefsContextProvider>
      <MoaContextProvider>
        <HTMLContent>{children}</HTMLContent>
      </MoaContextProvider>
    </RefsContextProvider>
  );
}

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
  "use client";

  return (
    <TanstackProvider>
      <AppContextProvider>
        <AuthContextProvider>
          <TooltipProvider>
            <Sonner />
            <PostHogProvider>
              <html
                lang="en"
                className="min-w-fit w-full h-[100vh] overflow-hidden"
              >
                <Head>
                  <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                  />
                </Head>
                <body className="h-full overflow-hidden">
                  <div className="flex flex-col h-full">
                    <Header />
                    <div className="flex w-full flex-1 overflow-hidden">
                      {children}
                    </div>
                    <Footer />
                  </div>
                </body>
              </html>
            </PostHogProvider>
          </TooltipProvider>
        </AuthContextProvider>
      </AppContextProvider>
    </TanstackProvider>
  );
};
