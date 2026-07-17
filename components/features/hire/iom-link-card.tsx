"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/EditForm";
import { EmployerService } from "@/lib/api/services";
import { Employer } from "@/lib/db/db.types";

/**
 * "Link your IOM account" card (plan §5.3). Career employer proves control
 * of an existing IOM company by TIN; confirmation goes to the IOM company's
 * own email (never shown here beyond the censored form), so this card just
 * shows request/pending/linked states.
 */
export function IomLinkCard({ profile }: { profile: Employer }) {
  return (
    <Suspense fallback={null}>
      <IomLinkCardContent profile={profile} />
    </Suspense>
  );
}

function IomLinkCardContent({ profile }: { profile: Employer }) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [tin, setTin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [startingRegistration, setStartingRegistration] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The confirm click is a full-page redirect back here — force a fresh
  // profile fetch so a just-linked tin isn't hidden behind a stale
  // persisted query cache (see project_persisted_query_cache_staleness).
  useEffect(() => {
    if (searchParams.get("linked") === "1") {
      queryClient.invalidateQueries({ queryKey: ["my-employer-profile"] });
    }
  }, [searchParams, queryClient]);

  const isLinked = !!profile.tin;

  const handleSubmit = async () => {
    const trimmed = tin.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await EmployerService.requestIomLink(trimmed);
      if (!result.success) {
        setError(result.message || "Could not send confirmation email.");
        return;
      }
      setPendingEmail(result.censoredEmail);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send confirmation email.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartRegistration = async () => {
    setStartingRegistration(true);
    setError(null);
    try {
      const result = await EmployerService.startIomRegistration();
      if (!result.success || !result.url) {
        setError(result.message || "Could not start IOM registration.");
        return;
      }
      window.location.href = result.url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not start IOM registration.",
      );
      setStartingRegistration(false);
    }
  };

  if (isLinked) {
    return (
      <Card className="flex-row items-center gap-3 px-5 py-4">
        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
        <div>
          <p className="text-sm font-medium text-gray-900">
            Linked to your IOM account
          </p>
          <p className="text-muted-foreground text-sm">
            Your MOA badges here now come from your IOM profile.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-3 px-5 py-4">
      <div>
        <p className="text-sm font-medium text-gray-900">Link your IOM account</p>
        <p className="text-muted-foreground text-sm">
          Already registered on the IOM platform? Link your account to show your
          MOA status on BetterInternship.
        </p>
      </div>

      {pendingEmail ? (
        <p className="text-sm text-gray-700">
          Confirmation sent to <b>{pendingEmail}</b>. Click the link in that
          email to finish linking.
        </p>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <FormInput
            label=""
            required={false}
            placeholder="Enter your IOM TIN"
            value={tin}
            setter={setTin}
            className="flex-1"
          />
          <Button onClick={handleSubmit} disabled={submitting || !tin.trim()}>
            {submitting ? "Sending..." : "Link account"}
          </Button>
        </div>
      )}

      {!pendingEmail && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-muted-foreground text-sm">
            Not registered on IOM yet?{" "}
            <button
              type="button"
              onClick={handleStartRegistration}
              disabled={startingRegistration}
              className="text-primary cursor-pointer underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {startingRegistration
                ? "Redirecting..."
                : "Sign a MOA with universities"}
            </button>
          </p>
        </div>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}
    </Card>
  );
}
