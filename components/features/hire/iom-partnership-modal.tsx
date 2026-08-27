"use client";

import { useState } from "react";
import { ArrowRight, Building2, Link2 } from "lucide-react";
import { EmployerService } from "@/lib/api/services";

export function IomPartnershipModalContent({
  onClose,
}: {
  onClose: () => void;
}) {
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const openIom = async (
    start: () => ReturnType<typeof EmployerService.startIomLogin>,
  ) => {
    const pendingTab = window.open("about:blank", "_blank");
    if (!pendingTab) {
      setError("Allow pop-ups to open Partners.");
      return;
    }

    pendingTab.opener = null;
    setError("");
    setIsPending(true);
    try {
      const result = await start();
      if (!result.success || !result.url) {
        pendingTab.close();
        setError(result.message || "Could not open Partners.");
        return;
      }
      pendingTab.location.href = result.url;
      onClose();
    } catch (cause) {
      pendingTab.close();
      setError(
        cause instanceof Error ? cause.message : "Could not open Partners.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => void openIom(() => EmployerService.startIomLogin())}
          disabled={isPending}
          className="group min-h-72 rounded-[0.33em] border border-gray-200 p-7 text-left transition-colors hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Link2 className="mb-8 h-8 w-8 text-primary" />
          <p className="text-lg font-semibold text-gray-900">
            I already have a Partners account
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Sign in to securely connect your existing account.
          </p>
          <span className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-primary">
            {isPending ? "Opening..." : "Connect account"}
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
        <button
          type="button"
          onClick={() =>
            void openIom(() => EmployerService.startIomRegistration())
          }
          disabled={isPending}
          className="group min-h-72 rounded-[0.33em] border border-gray-200 p-7 text-left transition-colors hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Building2 className="mb-8 h-8 w-8 text-primary" />
          <p className="text-lg font-semibold text-gray-900">
            I need to create a Partners account
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Set up your company account and prepare to partner with
            universities.
          </p>
          <span className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-primary">
            {isPending ? "Opening..." : "Create account"}
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </>
  );
}
