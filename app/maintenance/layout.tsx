import type { Metadata, Viewport } from "next";
import "../globals.css";
import bg2 from "../../public/bg2.png";
import { AppContextProvider } from "@/lib/ctx-app";
import { AuthContextProvider } from "@/lib/ctx-auth";
import { HeaderContextProvider } from "@/lib/ctx-header";
import { RefsContextProvider } from "@/lib/db/use-refs";
import { getRefsData } from "@/lib/db/use-refs-backend";
import { ModalProvider } from "@/components/providers/modal-provider/ModalProvider";
import Header from "@/components/features/student/header";
import { SonnerToaster } from "@/components/ui/sonner-toast";
import { ClientProcessesProvider } from "@betterinternship/components";
import { PostHogProvider } from "../posthog-provider";
import TanstackProvider from "../tanstack-provider";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "BetterInternship is under maintenance",
  description: "A tiny waiting room for BetterInternship outages.",
  icons: {
    icon: "/BetterInternshipLogo.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function MaintenanceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const refsData = await getRefsData();

  return (
    <html lang="en" className="h-full">
      <body className="h-full m-0 overflow-hidden p-0 antialiased">
        <RefsContextProvider data={refsData}>
          <PostHogProvider>
            <TanstackProvider>
              <AppContextProvider>
                <AuthContextProvider>
                  <HeaderContextProvider>
                    <ClientProcessesProvider>
                      <ModalProvider>
                        <div className="relative flex h-screen flex-col overflow-hidden bg-slate-50">
                          <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
                            style={{ backgroundImage: `url(${bg2.src})` }}
                          />
                          <Suspense>
                            <Header showActions={false} transparent />
                          </Suspense>
                          <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-auto">
                            {children}
                          </div>
                        </div>
                      </ModalProvider>
                    </ClientProcessesProvider>
                    <SonnerToaster />
                  </HeaderContextProvider>
                </AuthContextProvider>
              </AppContextProvider>
            </TanstackProvider>
          </PostHogProvider>
        </RefsContextProvider>
      </body>
    </html>
  );
}
