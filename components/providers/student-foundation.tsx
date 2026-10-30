"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContextProvider } from "@/lib/ctx-student-auth";
import { NavigationBehaviorProvider } from "@/components/features/student/navigation/navigation-behavior";

/**
 * Gives every student page a shared data cache, login state, and navigation behavior.
 * Heavier features, like form-job tracking and modals, stay in StudentAppShell.
 */
export function StudentFoundation({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, gcTime: 30 * 60_000 } },
      }),
  );
  useEffect(() => {
    try {
      // ! legacy storage cleanup!
      // Old student caches included private records without an account owner.
      // Never hydrate those records into the new shared cache.
      localStorage.removeItem("REACT_QUERY_OFFLINE_CACHE");
      localStorage.removeItem("bi.mq-jobs.form-fillout");
    } catch {
      // Storage may be unavailable; session verification still works.
    }
  }, []);
  return (
    <QueryClientProvider client={client}>
      <AuthContextProvider>
        <NavigationBehaviorProvider>{children}</NavigationBehaviorProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
}
