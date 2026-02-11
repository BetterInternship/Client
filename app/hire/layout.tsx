import type { Metadata } from "next";
import "../globals.css";
import { AuthContextProvider } from "./authctx";
import { RefsContextProvider } from "@/lib/db/use-refs";
import { AppContextProvider } from "@/lib/ctx-app";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BIMoaContextProvider } from "@/lib/db/use-bi-moa";
import { PostHogProvider } from "../posthog-provider";
import TanstackProvider from "../tanstack-provider";
import Head from "next/head";
import AllowLanding from "./allowLanding";
import { ConversationsContextProvider } from "@/hooks/use-conversation";
import { PocketbaseProvider, usePocketbase } from "@/lib/pocketbase";
import { ModalProvider } from "@/components/providers/ModalProvider";
import { NotificationListener } from "./notification-listener";

const baseUrl =
  process.env.NEXT_PUBLIC_CLIENT_HIRE_URL?.replace(/\/$/, "") ||
  "https://hire.betterinternship.com";
const ogImage = `${baseUrl}/student-preview.png`;

export const metadata: Metadata = {
  title: "Recruiter Dashboard - BetterInternship",
  description: "Manage applications and candidates",
  icons: {
    icon: "/BetterInternshipLogo.ico",
  },
  openGraph: {
    title: "Recruiter Dashboard - BetterInternship",
    description: "Manage applications and candidates",
    url: baseUrl,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "BetterInternship",
      },
    ],
    siteName: "BetterInternship",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recruiter Dashboard - BetterInternship",
    description: "Manage applications and candidates",
    images: [ogImage],
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
      <BIMoaContextProvider>
        <PostHogProvider>
          <HTMLContent>{children}</HTMLContent>
        </PostHogProvider>
      </BIMoaContextProvider>
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
      <PocketbaseProvider type={"employer"}>
        <AppContextProvider>
          <AuthContextProvider>
            <TooltipProvider>
              <ConversationsContextProvider type="employer">
                <html lang="en" className="h-full">
                  <Head>
                    <meta
                      name="viewport"
                      content="width=device-width, initial-scale=1.0"
                    />
                  </Head>
                  <body className="h-full overflow-x-hidden m-0 p-0 antialiased">
                    <ModalProvider>
                      <AllowLanding>
                        <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
                          <div className="flex-grow max-h-[100svh] max-w-[100svw] overflow-auto flex flex-col">
                            <NotificationListener />
                            {children}
                          </div>
                        </div>
                      </AllowLanding>
                    </ModalProvider>
                  </body>
                </html>
              </ConversationsContextProvider>
            </TooltipProvider>
          </AuthContextProvider>
        </AppContextProvider>
      </PocketbaseProvider>
    </TanstackProvider>
  );
};
