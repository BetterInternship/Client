"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/EditForm";
import { Button } from "@/components/ui/button";
import { EmployerAuthService } from "@/lib/api/hire.api";
import { useAuthContext } from "../authctx";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/lib/ctx-app";
import { CheckCircle2, PartyPopper, TriangleAlert } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { HeaderTitle } from "@/components/ui/text";
import { useBlurTransition } from "@/components/animata/blur";
import { Loader } from "@/components/ui/loader";

/**
 * First-magic-link onboarding page for passwordless employers.
 */
export default function WelcomePage() {
  return (
    <Suspense fallback={<Loader>Loading your invite...</Loader>}>
      <WelcomeContent />
    </Suspense>
  );
}

type OnboardState =
  | { status: "loading" }
  | { status: "invalid" }
  | { status: "already-onboarded" }
  | { status: "form"; employerName: string };

const FROSTED_CARD =
  "bg-white/90 backdrop-blur-md border-white/70 shadow-2xl shadow-black/10";

function WelcomeLogo() {
  return (
    <div className="flex justify-center pb-4">
      <img
        src="/BetterInternshipLogo.png"
        alt="BetterInternship"
        className="h-32 w-32 rounded-full border border-gray-200 object-contain"
      />
    </div>
  );
}

function WelcomeContent() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") ?? "";
  const hash = searchParams.get("hash") ?? "";
  const router = useRouter();
  const { refreshAuthentication } = useAuthContext();
  const { isMobile } = useAppContext();
  const blurTransition = useBlurTransition();

  const [state, setState] = useState<OnboardState>({ status: "loading" });
  const [password, setPassword] = useState("");
  const [reenterPassword, setReenterPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkStatus = async () => {
      if (!uid || !hash) {
        if (!cancelled) setState({ status: "invalid" });
        return;
      }

      try {
        const r = await EmployerAuthService.getOnboardStatus(uid, hash);
        if (cancelled) return;

        if (!r.valid) {
          setState({ status: "invalid" });
        } else if (!r.needs_onboarding) {
          setState({ status: "already-onboarded" });
        } else {
          setState({ status: "form", employerName: r.employer_name ?? "" });
        }
      } catch {
        if (!cancelled) setState({ status: "invalid" });
      }
    };

    void checkStatus();
    return () => {
      cancelled = true;
    };
  }, [uid, hash]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !reenterPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password !== reenterPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const r = await EmployerAuthService.onboard(uid, hash, password);

      if (!r.success) {
        setError(r.message || "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      await refreshAuthentication();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "relative z-0 flex justify-center py-12 pt-12 h-full overflow-y-auto",
        isMobile ? "px-2" : "px-6",
      )}
    >
      <div className="absolute inset-0 -z-10 overflow-hidden bg-[#eef1f6]">
        <img
          src={isMobile ? "/hire/welcome-mobile.png" : "/hire/welcome.png"}
          alt=""
          fetchPriority="high"
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            isMobile ? "object-[center_80%]" : "object-[40%_center]",
          )}
        />
      </div>

      <div className="relative z-10 flex justify-center items-center w-full max-w-md h-full">
        {state.status === "loading" && (
          <div
            className={cn(
              "flex flex-col items-center gap-4 px-10 py-8 rounded-[0.33em]",
              FROSTED_CARD,
              "border",
            )}
          >
            <WelcomeLogo />
            <Loader>Loading your invite...</Loader>
          </div>
        )}

        {state.status === "invalid" && (
          <AnimatePresence>
            <motion.div {...blurTransition} className="w-full">
              <Card className={cn("flex flex-col gap-4 w-full", FROSTED_CARD)}>
                <WelcomeLogo />
                <HeaderTitle icon={TriangleAlert}>
                  This link isn't valid
                </HeaderTitle>
                <p className="text-sm text-gray-600">
                  If you already have a password, log in below; otherwise use
                  Forgot password to set one.
                </p>
                <div className="flex justify-between items-center w-full text-sm text-gray-500">
                  <a
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                    href="/forgot-password"
                  >
                    Forgot password?
                  </a>
                  <a
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                    href="/login"
                  >
                    Log in here.
                  </a>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}

        {state.status === "already-onboarded" && (
          <AnimatePresence>
            <motion.div {...blurTransition} className="w-full">
              <Card className={cn("flex flex-col gap-4 w-full", FROSTED_CARD)}>
                <WelcomeLogo />
                <HeaderTitle icon={CheckCircle2}>You're all set</HeaderTitle>
                <p className="text-sm text-gray-600">
                  This account already has a password set.
                </p>
                <div className="flex justify-end items-center w-full">
                  <a
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                    href="/dashboard"
                  >
                    Go to your dashboard.
                  </a>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}

        {state.status === "form" && (
          <AnimatePresence>
            <motion.div {...blurTransition} className="w-full">
              <Card className={cn("flex flex-col gap-4 w-full", FROSTED_CARD)}>
                <WelcomeLogo />
                <HeaderTitle icon={PartyPopper}>
                  {state.employerName
                    ? `Welcome, ${state.employerName}!`
                    : "Welcome!"}
                </HeaderTitle>
                <p className="text-sm text-gray-600">
                  Your have applicants waiting!
                  <br /> Set a password for your account to view them.
                </p>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 justify-center">
                      {error}
                    </p>
                  </div>
                )}
                <form onSubmit={(e) => void handleSubmit(e)}>
                  <div className="flex flex-col gap-4">
                    <FormInput
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <FormInput
                      label="Re-enter your password"
                      type="password"
                      value={reenterPassword}
                      onChange={(e) => setReenterPassword(e.target.value)}
                      required
                    />
                    <div className="flex justify-end items-center w-full">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Getting started..." : "Get started →"}
                      </Button>
                    </div>
                  </div>
                </form>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
