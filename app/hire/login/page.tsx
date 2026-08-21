"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@betterinternship/components";
import { useAuthContext } from "../authctx";
import { cn } from "@betterinternship/components";
import { useAppContext } from "@/lib/ctx-app";

import { FormInput } from "@/components/EditForm";

import { MailCheck, TriangleAlert } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { EmployerService } from "@/lib/api/services";
import { HireAuthShell } from "@/components/features/hire/hire-auth-shell";

export default function LoginPage() {
  return (
    <Suspense fallback={<Loader>Loading login...</Loader>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { login, redirectIfLoggedIn: redirect_if_logged_in } = useAuthContext();
  const queryClient = useQueryClient();

  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  // Set by the IOM "Post a listing" CTA when the company's IOM email already
  // manages a different career employer — carries a signed, short-lived
  // token redeemed right after login to link the two accounts automatically
  // (Docs/plans/CAREER_IOM_LINK_IMPLEMENTATION_PLAN.md §4.2 follow-up). The
  // manual "Link your IOM account" card on company-profile stays as a
  // fallback for anyone who arrives some other way.
  const autoLinkToken = searchParams.get("auto_link");
  const prefillEmail = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const { isMobile } = useAppContext();

  redirect_if_logged_in();

  const normalize = (s: string) => s.trim().toLowerCase();

  const handle_login_request = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const normalized = normalize(email);
    if (!normalized) {
      setIsLoading(false);
      setError("Email is required.");
      return;
    }

    try {
      const r = await login(normalized, password);

      if (r.success) {
        if (autoLinkToken) {
          // Best-effort — a failure here never blocks login. The manual
          // "Link your IOM account" card on company-profile is the fallback.
          try {
            await EmployerService.autoLinkIomAccount(autoLinkToken);
            await queryClient.invalidateQueries({
              queryKey: ["my-employer-profile"],
            });
          } catch {
            // Swallowed intentionally — see comment above.
          }
        }

        if (r.user?.god) {
          router.push("/god");
          return;
        }

        router.push("/dashboard");
      } else {
        if (r.pending_verification) {
          sessionStorage.setItem("hire-registration-email", normalized);
          router.push("/register/verify");
          return;
        }
        setError(r.message || "Invalid password.");
        setIsLoading(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <HireAuthShell
      title="Log in"
      description="Enter your employer account details to access the portal."
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
      <div className="w-full">
        {/* IOM auto-link banner — merged flush with the card below it */}
        {autoLinkToken && (
          <div
            className={cn(
              "flex flex-col items-center gap-3 px-5 py-6 bg-primary/10 text-primary rounded-t-[0.33em]",
            )}
          >
            <div
              className={cn(
                "flex gap-3 items-center",
                isMobile ? "flex-col text-center" : "",
              )}
            >
              <span
                className={cn(
                  "font-semibold justify-center",
                  isMobile ? "text-lg" : "text-xl",
                )}
              >
                You already have a marketplace account. Login to link it.
              </span>
            </div>
            <img
              src="/hire/link-company-accounts.png"
              alt=""
              fetchPriority="high"
              className={cn("h-60", "object-cover")}
            />
          </div>
        )}

        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div
              className={cn(
                "flex gap-2 items-center mb-4 p-3 bg-destructive/10 text-destructive border border-destructive/50 rounded-[0.33em]",
                isMobile ? "flex-col items-start" : "",
              )}
            >
              <TriangleAlert size={isMobile ? 24 : 20} />
              <span className="text-sm justify-center">{error}</span>
            </div>
          )}

          {status === "success" && !error && (
            <div
              className={cn(
                "mb-4 rounded-[0.33em] bg-emerald-600 px-4 py-3 text-white mt-4",
                isMobile
                  ? "flex flex-col items-start gap-2"
                  : "flex items-center gap-2",
              )}
            >
              <MailCheck size={isMobile ? 24 : 20} />
              <span className="text-sm">
                Registration successful. Verify your email to activate your
                account.
              </span>
            </div>
          )}

          {/* Login Form */}
          <form
            onSubmit={(event) => void handle_login_request(event)}
            className="space-y-4"
          >
            <FormInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={false}
            />

            <FormInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={false}
              labelAddon={
                <a
                  className="text-xs text-muted-foreground hover:text-primary"
                  href="/forgot-password"
                >
                  Forgot password?
                </a>
              }
            />
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </div>
      </div>
    </HireAuthShell>
  );
}
