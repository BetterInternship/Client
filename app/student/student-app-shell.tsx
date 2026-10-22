"use client";

import type { ReactNode } from "react";
import { AppContextProvider } from "@/lib/ctx-app";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HeaderContextProvider } from "@/lib/ctx-header";
import { AppMQJobsProvider } from "@/components/providers/mq-jobs-provider";
import { FilloutJobsProvider } from "@/hooks/forms/filloutFormProcess";
import { ModalProvider } from "@/components/providers/modal-provider/ModalProvider";
import { StudentBottomNavigation } from "@/components/features/student/navigation/student-bottom-navigation";
import { SonnerToaster } from "@/components/ui/sonner-toast";
import StudentPageLayout from "./student-page-layout";
import { useAuthContext } from "@/lib/ctx-student-auth";

/** Application-only providers live behind the public homepage's chunk boundary. */
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
                  <div
                    data-student-scroll
                    className="relative flex min-h-0 flex-1 max-w-[100svw] overflow-y-auto flex-col"
                  >
                    <StudentPageLayout>{children}</StudentPageLayout>
                  </div>
                  <StudentBottomNavigation />
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
