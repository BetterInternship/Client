"use client";

import type { ReactNode } from "react";
import {
  useAuthContext,
  useRequireStudentSession,
} from "@/lib/ctx-student-auth";

/** Keep protected page content hidden until the student session is verified. */
export function StudentSessionGate({ children }: { children: ReactNode }) {
  const { status, refreshAuthentication } = useAuthContext();
  useRequireStudentSession();

  if (status === "authenticated") return children;

  if (status === "unavailable") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p role="alert">We couldn’t check your session. Please try again.</p>
        <button
          type="button"
          className="rounded-md border px-4 py-2"
          onClick={() => void refreshAuthentication().catch(() => {})}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6" role="status">
      {status === "anonymous"
        ? "Redirecting to login…"
        : "Checking your session…"}
    </div>
  );
}
