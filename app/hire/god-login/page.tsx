"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, cn } from "@betterinternship/components";
import { TriangleAlert } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { FormInput } from "@/components/EditForm";
import { HireOtpInput } from "@/components/features/hire/hire-otp-input";
import { HireAuthShell } from "@/components/features/hire/hire-auth-shell";
import { useOtpVerification } from "@/hooks/use-otp-verification";
import { isValidEmail } from "@/lib/utils";
import { useAppContext } from "@/lib/ctx-app";
import { useAuthContext } from "../authctx";

// Temporary: this page moves to the tools site under ARCH-028
// (OPAQUE_SESSIONS_MIGRATION_PLAN.md O1). Keep it small.

/** Only ever send a god back into the god area, never to another site. */
const safeNext = (next: string | null) =>
  next && next.startsWith("/god") && !next.startsWith("//") ? next : "/god";

export default function GodLoginPage() {
  return (
    <Suspense fallback={<Loader>Loading login...</Loader>}>
      <GodLoginContent />
    </Suspense>
  );
}

function GodLoginContent() {
  const { god, godLoading, requestGodLoginOtp, verifyGodLoginOtp } =
    useAuthContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isMobile } = useAppContext();
  const next = safeNext(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [hasSentCode, setHasSentCode] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    if (!godLoading && god) router.replace(next);
  }, [god, godLoading, next, router]);

  const {
    activateOtp,
    activating,
    countdown,
    error,
    isCoolingDown,
    otpInputProps,
    resetOtp,
    requestOtp,
    sending,
  } = useOtpVerification({
    email: email.trim().toLowerCase(),
    requestOtpAction: requestGodLoginOtp,
    activateOtpAction: verifyGodLoginOtp,
    autoActivate: {
      enabled: hasSentCode,
      failureMessage: "Invalid or expired code.",
      networkErrorMessage: "Couldn't verify your code. Try again.",
      onSuccess: () => router.replace(next),
    },
  });

  const sendCode = async () => {
    if (!isValidEmail(email)) {
      setLoginError("Enter a valid email.");
      return;
    }

    setLoginError("");
    const result = await requestOtp({
      failureMessage: "Couldn't request a code. Try again.",
    });
    if (result?.success) setHasSentCode(true);
  };

  const submitCode = async () => {
    const result = await activateOtp(otpInputProps.value, {
      failureMessage: "Invalid or expired code.",
      networkErrorMessage: "Couldn't verify your code. Try again.",
    });
    if (result?.success) router.replace(next);
  };

  return (
    <HireAuthShell
      title={hasSentCode ? "Check your email" : "Administrator log in"}
      description={
        hasSentCode ? (
          <span className="block">
            If an administrator account exists, we sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">{email}</span>.
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setHasSentCode(false);
                resetOtp();
                setLoginError("");
              }}
            >
              Wrong email?
            </Button>
          </span>
        ) : (
          "Enter your administrator email and we'll send you a six-digit sign-in code."
        )
      }
    >
      <form
        className="w-full space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void (hasSentCode ? submitCode() : sendCode());
        }}
      >
        {(loginError || error) && (
          <div
            className={cn(
              "flex gap-2 rounded-[0.33em] border border-destructive/50 bg-destructive/10 p-3 text-destructive",
              isMobile ? "flex-col items-start" : "items-center",
            )}
          >
            <TriangleAlert size={isMobile ? 24 : 20} />
            <span className="text-sm">{loginError || error}</span>
          </div>
        )}

        {!hasSentCode && (
          <FormInput
            label="Administrator email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setLoginError("");
            }}
            maxLength={80}
            placeholder="you@betterinternship.com"
          />
        )}

        {hasSentCode && (
          <div className="space-y-4">
            <HireOtpInput {...otpInputProps} autoFocus disabled={activating} />
            <div className="text-center">
              <button
                type="button"
                onClick={() => void sendCode()}
                disabled={sending || isCoolingDown}
                className="cursor-pointer text-sm text-muted-foreground hover:text-primary disabled:cursor-default disabled:opacity-50"
              >
                {sending
                  ? "Sending..."
                  : isCoolingDown
                    ? `Resend code in ${countdown}s`
                    : "Resend code"}
              </button>
            </div>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={
            sending ||
            activating ||
            !isValidEmail(email) ||
            (hasSentCode && otpInputProps.value.length < 6)
          }
        >
          {activating
            ? "Verifying..."
            : sending
              ? "Sending..."
              : hasSentCode
                ? "Verify and log in"
                : "Send sign-in code"}
        </Button>
      </form>
    </HireAuthShell>
  );
}
