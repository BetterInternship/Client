"use client";

/**
 * Finishes the return from login for both student callback pages.
 * Rechecks the shared session, tells other tabs to refresh their login state,
 * then returns to the saved page (or /search). Shows a retry option if verification fails.
 * Does not perform Google login or restore job actions; the destination's buttons handle those.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  broadcastStudentAuthChange,
  useAuthContext,
} from "@/lib/ctx-student-auth";
import { consumePostLoginRedirect } from "@/lib/post-login-redirect";
import { Loader } from "@/components/ui/loader";

export default function StudentSessionCompletion() {
  const { refreshAuthentication } = useAuthContext();
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const complete = async () => {
    setError(null);
    try {
      const user = await refreshAuthentication();
      if (!user)
        throw new Error(
          "Your sign-in could not be verified. Please try again.",
        );
      broadcastStudentAuthChange();
      router.replace(consumePostLoginRedirect());
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not complete sign-in.",
      );
    }
  };
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void complete();
    // Completion consumes the destination once, not on every query-state render.
  }, []);
  return error ? (
    <div className="p-6" role="alert">
      <p>{error}</p>
      <button
        className="mt-3 rounded border px-4 py-2"
        onClick={() => {
          void complete();
        }}
      >
        Retry sign-in
      </button>
    </div>
  ) : (
    <Loader>Completing sign-in…</Loader>
  );
}
