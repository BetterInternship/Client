"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "../authctx";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/lib/ctx-app";

import { FormInput } from "@/components/EditForm";

import { Card } from "@/components/ui/card";
import { Link2, MailCheck, TriangleAlert, User } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { AnimatePresence, motion } from "framer-motion";
import { HeaderTitle } from "@/components/ui/text";
import { useBlurTransition } from "@/components/animata/blur";
import { EmployerService } from "@/lib/api/services";

export default function LoginPage() {
  return (
    <Suspense fallback={<Loader>Loading login...</Loader>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const {
    emailStatus: email_status,
    login,
    redirectIfLoggedIn: redirect_if_logged_in,
  } = useAuthContext();
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
  const [emailNorm, setEmailNorm] = useState(""); // keep a normalized copy for API calls
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const { isMobile } = useAppContext();

  const blurTransition = useBlurTransition();

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

    setEmailNorm(normalized);

    try {
      const email_r = await email_status(normalized);
      const r = await login(normalized, password);

      // @ts-ignore
      if (!email_r?.success) {
        setIsLoading(false);
        // @ts-ignore
        alert(r?.message ?? "Unknown error");
        return;
      }

      // @ts-ignore
      if (r?.success) {
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

        // @ts-ignore
        if (r.god) {
          router.push("/god");
        }

        router.push("/dashboard");
      } else {
        setError("Invalid password.");
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        {...blurTransition}
        className={cn(
          "flex justify-center py-12 pt-12 h-fit overflow-y-auto",
          isMobile ? "px-2" : "px-6",
        )}
      >
        <div className="flex items-center w-full max-w-2xl h-full">
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

            <Card
              className={cn(
                "w-full",
                autoLinkToken && "rounded-tl-none rounded-tr-none",
              )}
            >
              {/* Welcome Message */}
              <HeaderTitle icon={User}>Log in</HeaderTitle>

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

              {/* check email message on successful register */}
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
                    Registration successful. Please check your email for the
                    password.
                  </span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handle_login_request}>
                <div className="flex flex-col gap-4">
                  <FormInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <FormInput
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="flex justify-between items-center w-full text-sm text-gray-500">
                    <a
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                      href="/forgot-password"
                    >
                      Forgot password?
                    </a>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Logging in..." : "Log in"}
                    </Button>
                  </div>
                  <span className="text-sm text-gray-500">
                    Don't have an account?{" "}
                    <a
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                      href="/register"
                    >
                      Register here.
                    </a>
                  </span>
                  <span className="text-muted-foreground text-sm">
                    Need help? Contact us at{" "}
                    <a
                      href="tel://09276604999"
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      0927 660 4999
                    </a>{" "}
                    or on{" "}
                    <a
                      href="viber://add?number=639276604999"
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      Viber
                    </a>
                    .
                  </span>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
