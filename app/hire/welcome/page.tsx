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
        "flex justify-center py-12 pt-12 h-full overflow-y-auto",
        isMobile ? "px-2" : "px-6",
      )}
    >
      <div className="flex justify-center items-center w-full max-w-2xl h-full">
        {state.status === "loading" && <Loader>Loading your invite...</Loader>}

        {state.status === "invalid" && (
          <AnimatePresence>
            <motion.div {...blurTransition} className="w-full">
              <Card className="flex flex-col gap-4 w-full">
                <HeaderTitle icon={TriangleAlert}>
                  This link isn't valid
                </HeaderTitle>
                <p className="text-sm text-gray-500">
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
              <Card className="flex flex-col gap-4 w-full">
                <HeaderTitle icon={CheckCircle2}>You're all set</HeaderTitle>
                <p className="text-sm text-gray-500">
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
              <Card className="flex flex-col gap-4 w-full">
                <HeaderTitle icon={PartyPopper}>
                  {state.employerName
                    ? `Welcome, ${state.employerName}!`
                    : "Welcome!"}
                </HeaderTitle>
                <p className="text-sm text-gray-500">
                  Your candidates are waiting — set a password to get started.
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
