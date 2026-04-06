"use client";

import { type ChangeEvent, type FormEvent, useEffect, useRef } from "react";
import {
  ArrowLeft,
  FileText,
  FolderOpen,
  Globe,
  Loader2,
  Video,
} from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import confetti from "canvas-confetti";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/ui/loader";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CebuPacificSubmissionForm, SubmissionStep } from "./types";

type ApplyPanelProps = {
  form: CebuPacificSubmissionForm;
  submissionStep: SubmissionStep;
  hasSubmitted: boolean;
  submittedEmail: string;
  isSubmitting: boolean;
  isError: boolean;
  resultMessage: string;
  isDevelopment: boolean;
  token: string;
  tokenFail: boolean;
  turnstileSiteKey?: string;
  onFieldChange: (
    field: keyof CebuPacificSubmissionForm,
    value: string,
  ) => void;
  onNextStep: () => void;
  onBackStep: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBackToOverview: () => void;
  onTokenSuccess: (token: string) => void;
  onTokenError: () => void;
};

export function ApplyPanel({
  form,
  submissionStep,
  hasSubmitted,
  submittedEmail,
  isSubmitting,
  isError,
  resultMessage,
  isDevelopment,
  token,
  tokenFail,
  turnstileSiteKey,
  onFieldChange,
  onNextStep,
  onBackStep,
  onSubmit,
  onBackToOverview,
  onTokenSuccess,
  onTokenError,
}: ApplyPanelProps) {
  const prefersReduce = useReducedMotion();
  const hasCelebratedRef = useRef(false);

  useEffect(() => {
    if (!hasSubmitted) {
      hasCelebratedRef.current = false;
      return;
    }

    if (hasCelebratedRef.current || prefersReduce) return;
    if (typeof window === "undefined") return;

    hasCelebratedRef.current = true;

    type ConfettiFn = (
      options?: Record<string, unknown>,
    ) => Promise<null> | null;
    const fireConfetti = confetti as unknown as ConfettiFn;

    void fireConfetti({
      particleCount: 90,
      spread: 74,
      startVelocity: 34,
      origin: { y: 0.65 },
      colors: ["#2574BB", "#4ea1ef", "#f3d98a", "#ffffff"],
    });

    window.setTimeout(() => {
      void fireConfetti({
        particleCount: 60,
        spread: 60,
        startVelocity: 28,
        origin: { x: 0.75, y: 0.68 },
        colors: ["#2574BB", "#f3d98a", "#ffffff"],
      });
    }, 180);
  }, [hasSubmitted, prefersReduce]);

  const stepLabel =
    submissionStep === 1 ? "Challenge Output" : "Contact Details";

  const updateField =
    (field: keyof CebuPacificSubmissionForm) =>
    (
      event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
    ) => {
      onFieldChange(field, event.target.value);
    };

  return (
    <div className="relative overflow-hidden rounded-[0.33em] border-2 border-[#2574BB]/26 bg-white shadow-[0_24px_55px_-35px_rgba(37,116,187,0.52)]">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_92%_8%,rgba(243,217,138,0.26),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.2)_0%,transparent_42%,rgba(255,255,255,0.08)_74%,transparent_100%)]" />
        <div className="relative flex flex-col gap-4 bg-gradient-to-br from-[#edf6ff] via-[#e3efff] to-[#d6e8ff] px-6 py-6 text-[#173957] sm:flex-row sm:items-start sm:justify-between sm:px-8">
          <div>
            <p className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.16em] text-[#1f68a9]/80 sm:text-sm">
              Submit challenge
            </p>
            <p className="[font-family:var(--font-paraluman-heading)] text-2xl font-black leading-[1.16] tracking-[-0.02em] text-[#1f68a9] sm:text-3xl">
              <span className="inline-block w-fit bg-[#f3d98a] px-2 py-0.5">
                No resume needed. Response in 24 hours.
              </span>
            </p>
          </div>

          {!hasSubmitted && (
            <div className="w-full sm:w-auto sm:min-w-64 sm:text-right">
              <p className="[font-family:var(--font-paraluman-mono)] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1f68a9]/85">
                Step {submissionStep} - {stepLabel}
              </p>
              <div className="mt-2 grid w-full grid-cols-2 gap-1.5 sm:ml-auto sm:w-40">
                <span
                  className={cn(
                    "h-1.5 w-full rounded-full transition-colors",
                    submissionStep >= 1 ? "bg-[#2574BB]" : "bg-[#2574BB]/30",
                  )}
                />
                <span
                  className={cn(
                    "h-1.5 w-full rounded-full transition-colors",
                    submissionStep >= 2 ? "bg-[#2574BB]" : "bg-[#2574BB]/30",
                  )}
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-7 sm:px-8 sm:py-8">
          {hasSubmitted ? (
            <motion.div
              initial={
                prefersReduce ? false : { opacity: 0, y: 20, scale: 0.95 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative overflow-hidden rounded-[0.33em] border-2 border-[#2574BB]/35 bg-white p-6 shadow-[0_18px_45px_-35px_rgba(37,116,187,0.6)] sm:p-8"
            >
              {!prefersReduce && (
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%)]"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
                />
              )}
              <motion.div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,116,187,0.18),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(243,217,138,0.12),transparent_55%)]"
                initial={prefersReduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 }}
              />
              <motion.div
                className="relative z-10 flex flex-col gap-4"
                initial={prefersReduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              >
                <p className="[font-family:var(--font-paraluman-heading)] text-2xl font-black uppercase tracking-[-0.02em] text-[#1f68a9] sm:text-3xl">
                  Submission sent
                </p>
                <p className="[font-family:var(--font-paraluman-heading)] text-lg font-black uppercase tracking-[0.02em] text-[#1f68a9]/80 sm:text-xl">
                  You're in
                </p>
                <motion.p
                  className="[font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/70 sm:text-base"
                  initial={prefersReduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
                >
                  Thank you for applying. We sent a confirmation to{" "}
                  <span className="font-bold text-[#1f68a9]">
                    {submittedEmail || "your email"}
                  </span>
                  . You will receive a response within 24 hours.
                </motion.p>
                <motion.div
                  className="pt-1"
                  initial={prefersReduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
                >
                  <Button
                    type="button"
                    onClick={onBackToOverview}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#2574BB] bg-[#2574BB] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:bg-[#1c5a92] hover:shadow-lg"
                  >
                    Back to overview
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <form className="space-y-5" onSubmit={(e) => void onSubmit(e)}>
              <div className="relative overflow-hidden rounded-[0.33em] border border-[#2574BB]/35 bg-gradient-to-br from-[#edf6ff] via-[#e3efff] to-[#d6e8ff] px-4 py-3">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_92%_8%,rgba(243,217,138,0.26),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.2)_0%,transparent_42%,rgba(255,255,255,0.08)_74%,transparent_100%)]" />
                <p className="relative z-10 [font-family:var(--font-paraluman-heading)] text-base font-black uppercase text-[#1f68a9] sm:text-lg">
                  {submissionStep === 1
                    ? "Step 1: Share your challenge output"
                    : "Step 2: Confirm your details"}
                </p>
                <p className="relative z-10 mt-1 [font-family:var(--font-paraluman-mono)] text-xs leading-6 text-[#173957]/85 sm:text-sm">
                  {submissionStep === 1
                    ? "This will be where you submit your challenge output."
                    : "Final step. No resume needed. Guaranteed response in 24 hours."}
                </p>
              </div>

              {submissionStep === 1 && (
                <>
                  <div className="space-y-2">
                    <label className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.1em] text-black/70">
                      Challenge Output Link *
                    </label>

                    <Input
                      required
                      value={form.submissionLink}
                      onChange={updateField("submissionLink")}
                      className="h-11 border-2 border-[#2574BB]/35 bg-white focus:ring-0 [font-family:var(--font-paraluman-mono)]"
                    />
                    <div className="[font-family:var(--font-paraluman-mono)] text-[10px] text-black/55 sm:text-[11px]">
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 [font-family:var(--font-paraluman-mono)] text-[10px] text-black/55 sm:text-[11px]">
                        Submit your CHALLENGE OUTPUT through any of the
                        platforms:
                        <span className="inline-flex items-center gap-1 border rounded-full px-1.5 border-black/55">
                          <FolderOpen className="h-3 w-3 shrink-0" />
                          Google Drive
                        </span>
                        <span className="inline-flex items-center gap-1 border rounded-full px-1.5 border-black/55">
                          <FileText className="h-3 w-3 shrink-0" />
                          Google Docs
                        </span>
                        <span className="inline-flex items-center gap-1 border rounded-full px-1.5 border-black/55">
                          <Globe className="h-3 w-3 shrink-0" />
                          Live Demo
                        </span>
                        <span className="inline-flex items-center gap-1 border rounded-full px-1.5 border-black/55">
                          <Video className="h-3 w-3 shrink-0" />
                          YouTube
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.1em] text-black/70">
                      Application Notes (Optional)
                    </label>
                    <Textarea
                      value={form.submissionNotes}
                      onChange={updateField("submissionNotes")}
                      className="min-h-28 border-2 border-[#2574BB]/35 bg-white focus:ring-0 [font-family:var(--font-paraluman-mono)]"
                    />
                    <p className="[font-family:var(--font-paraluman-mono)] text-[10px] text-black/55 sm:text-[11px]">
                      Add context, constraints, or tradeoffs you want us to
                      notice.
                    </p>
                  </div>
                </>
              )}

              {submissionStep === 2 && (
                <>
                  <div className="space-y-2">
                    <label className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.1em] text-black/70">
                      Email Address *
                    </label>
                    <Input
                      required
                      type="email"
                      value={form.email}
                      onChange={updateField("email")}
                      className="h-11 border-2 border-[#2574BB]/35 bg-white focus:ring-0 [font-family:var(--font-paraluman-mono)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.1em] text-black/70">
                      Full Name *
                    </label>
                    <Input
                      required
                      value={form.fullName}
                      onChange={updateField("fullName")}
                      className="h-11 border-2 border-[#2574BB]/35 bg-white focus:ring-0 [font-family:var(--font-paraluman-mono)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.1em] text-black/70">
                      Facebook Link *
                    </label>
                    <Input
                      required
                      value={form.facebookLink}
                      onChange={updateField("facebookLink")}
                      className="h-11 border-2 border-[#2574BB]/35 bg-white focus:ring-0 [font-family:var(--font-paraluman-mono)]"
                    />
                  </div>

                  {isDevelopment ? (
                    <p className="rounded-[0.33em] bg-[#2574BB]/10 px-3 py-2 [font-family:var(--font-paraluman-mono)] text-xs text-[#1f68a9]">
                      Captcha disabled in development
                    </p>
                  ) : !token ? (
                    <div className="space-y-3">
                      {!tokenFail ? (
                        <Loader>Validating browser...</Loader>
                      ) : (
                        <Badge type="destructive" className="mb-2">
                          Unable to validate captcha. Please refresh and try
                          again.
                        </Badge>
                      )}
                      <Turnstile
                        siteKey={turnstileSiteKey!}
                        onSuccess={onTokenSuccess}
                        onError={onTokenError}
                      />
                    </div>
                  ) : (
                    <div className="rounded-[0.33em] bg-emerald-100 px-3 py-2 [font-family:var(--font-paraluman-mono)] text-xs text-emerald-700">
                      Browser verification complete
                    </div>
                  )}
                </>
              )}

              <div className="flex flex-col sm:flex-row justify-end">
                {submissionStep === 1 ? (
                  <Button
                    type="button"
                    onClick={onNextStep}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#2574BB] bg-[#2574BB] [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:bg-[#1c5a92] hover:shadow-lg sm:w-auto sm:px-8"
                  >
                    Continue to contact details
                  </Button>
                ) : (
                  <div className="flex w-full gap-2 sm:w-auto sm:items-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onBackStep}
                      className="inline-flex h-11 w-1/3 items-center justify-center gap-1.5 rounded-[0.33em] border-2 border-[#2574BB]/35 bg-white px-3 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.08em] text-[#1f68a9] transition-colors hover:bg-[#eef6ff] sm:w-auto"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex h-11 w-2/3 items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#2574BB] bg-[#2574BB] px-6 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:bg-[#1c5a92] hover:shadow-lg sm:min-w-36 sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting
                        </>
                      ) : (
                        "Submit challenge"
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {resultMessage && (
                <div
                  className={cn(
                    "rounded-[0.33em] border-2 px-4 py-3 [font-family:var(--font-paraluman-mono)] text-sm",
                    isError
                      ? "border-red-300 bg-red-50 text-red-700"
                      : "border-emerald-300 bg-emerald-50 text-emerald-700",
                  )}
                >
                  {resultMessage}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
