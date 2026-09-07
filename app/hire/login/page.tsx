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
import { type AuthResponse } from "@/lib/api/hire.api";
import { useAppContext } from "@/lib/ctx-app";
import { useAuthContext } from "../authctx";

export default function LoginPage() {
  return (
    <Suspense fallback={<Loader>Loading login...</Loader>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { isAuthenticated, loading, requestLoginOtp, user, verifyLoginOtp } =
    useAuthContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isMobile } = useAppContext();
  const autoLinkToken = searchParams.get("auto_link");
  const next = searchParams.get("next") ?? "dashboard";
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [hasSentCode, setHasSentCode] = useState(false);
  const [loginError, setLoginError] = useState("");
  const continuationPath = autoLinkToken
    ? `/dashboard?${new URLSearchParams({ auto_link: autoLinkToken, next }).toString()}`
    : "/dashboard";

  useEffect(() => {
    if (!loading && isAuthenticated()) {
      router.replace(user?.god ? "/god" : continuationPath);
    }
  }, [continuationPath, isAuthenticated, loading, router, user]);

  const completeLogin = (response: AuthResponse | undefined) => {
    if (response?.user?.god) {
      router.replace("/god");
      return;
    }

    if (autoLinkToken) {
      router.replace(continuationPath);
      return;
    }

    router.replace("/dashboard");
  };

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
    requestOtpAction: requestLoginOtp,
    activateOtpAction: verifyLoginOtp,
    autoActivate: {
      enabled: hasSentCode,
      failureMessage: "Invalid or expired code.",
      networkErrorMessage: "Couldn't verify your code. Try again.",
      onSuccess: (result) =>
        completeLogin(result.response as AuthResponse | undefined),
    },
  });

  const sendCode = async () => {
    if (!isValidEmail(email)) {
      setLoginError("Enter a valid work email.");
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
    if (result?.success) {
      completeLogin(result.response as AuthResponse | undefined);
    }
  };

  return (
    <HireAuthShell
      title={hasSentCode ? "Check your email" : "Log in"}
      description={
        hasSentCode ? (
          <span className="block">
            If an eligible account exists, we sent a 6-digit code to{" "}
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
          "Enter your work email and we'll send you a six-digit sign-in code."
        )
      }
      footer={
        <>
          Don&apos;t have an account?{" "}
          <a className="font-medium text-primary" href="/register">
            Register here
          </a>
          .
        </>
      }
    >
      <form
        className="w-full space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void (hasSentCode ? submitCode() : sendCode());
        }}
      >
        {autoLinkToken && (
          <div className="rounded-[0.33em] bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
            Sign in to link your company account.
          </div>
        )}

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
            label="Work email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setLoginError("");
            }}
            maxLength={80}
            placeholder="you@company.com"
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
                className="text-sm text-muted-foreground hover:text-primary disabled:opacity-50"
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
