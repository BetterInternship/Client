"use client";

import type { ReactNode } from "react";
import { AppContextProvider } from "@/lib/ctx-app";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HeaderContextProvider } from "@/lib/ctx-header";
import { AppMQJobsProvider } from "@/components/providers/mq-jobs-provider";
import { FilloutJobsProvider } from "@/hooks/forms/filloutFormProcess";
import { ModalProvider } from "@/components/providers/modal-provider/ModalProvider";
import MobileNavWrapper from "@/components/shared/mobile-nav-wrapper";
import { SonnerToaster } from "@/components/ui/sonner-toast";
import AllowLanding from "./allowLanding";
import { useAuthContext } from "@/lib/ctx-student-auth";

/** Application-only providers live behind the public homepage's chunk boundary. */
// ! TODO(student-navigation-cleanup): Review navigation placement together with AllowLanding.
// ! The top bar is rendered there, while the bottom bar is rendered here.
// ! Keep this split for the session refactor; revisit it during navigation cleanup.
export default function StudentAppShell({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  return (
    <AppContextProvider>
      <TooltipProvider>
        <HeaderContextProvider>
          <AppMQJobsProvider>
            <FilloutJobsProvider>
              <ModalProvider accountScope={user?.id ?? null}>
                <div className="fixed inset-x-0 top-0 flex h-[100svh] flex-col overflow-hidden bg-background md:relative md:h-[100dvh]">
                  <div className="relative flex min-h-0 flex-1 max-w-[100svw] overflow-y-auto flex-col">
                    <AllowLanding>{children}</AllowLanding>
                  </div>
                  <MobileNavWrapper />
                </div>
              </ModalProvider>
            </FilloutJobsProvider>
          </AppMQJobsProvider>
          <SonnerToaster />
        </HeaderContextProvider>
      </TooltipProvider>
    </AppContextProvider>
  );
}
