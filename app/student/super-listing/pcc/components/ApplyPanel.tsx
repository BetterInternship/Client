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
import type { PccSubmissionForm, SubmissionStep } from "./types";

type ApplyPanelProps = {
  form: PccSubmissionForm;
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
  onFieldChange: (field: keyof PccSubmissionForm, value: string) => void;
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

  const updateField =
    (field: keyof PccSubmissionForm) =>
    (
      event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
    ) => {
      onFieldChange(field, event.target.value);
    };

  return (
    <div className="space-y-6">
      <div className="max-w-3xl space-y-3 border-b pb-5">
        <h2 className="[font-family:var(--font-paraluman-heading)] text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-[#173f69]">
          Submit your challenge output.
        </h2>
        <p className="[font-family:var(--font-paraluman-body)] text-base leading-7 text-[#173957]/72 sm:text-lg sm:leading-8">
          Again,{" "}
          <span className="font-bold text-warning">
            no resume needed. Reponse within 24 hours.
          </span>
        </p>
      </div>

      <div className="overflow-hidden">
        <div className="px-0 py-6 sm:py-8">
          {hasSubmitted ? (
            <motion.div
              initial={
                prefersReduce ? false : { opacity: 0, y: 20, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
              className="p-0"
            >
              <div className="space-y-4">
                <p className="[font-family:var(--font-paraluman-mono)] text-[10px] font-semibold uppercase tracking-[0.22em] text-[#1f68a9]/64 sm:text-[11px]">
                  Submission sent
                </p>
                <p className="[font-family:var(--font-paraluman-heading)] text-3xl font-medium tracking-[-0.04em] text-[#173f69] sm:text-4xl">
                  You&apos;re in.
                </p>
                <p className="max-w-2xl [font-family:var(--font-paraluman-body)] text-base leading-7 text-[#173957]/74 sm:text-lg sm:leading-8">
                  Thank you for applying. We sent a confirmation to{" "}
                  <span className="font-semibold text-[#173f69]">
                    {submittedEmail || "your email"}
                  </span>
                  . You will receive a response within 24 hours.
                </p>
                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={onBackToOverview}
                    className="inline-flex h-11 items-center justify-center rounded-md bg-[#173f69] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-medium tracking-[-0.02em] text-white transition-all duration-200 hover:bg-[#123456]"
                  >
                    Back to overview
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <form className="space-y-6" onSubmit={(e) => void onSubmit(e)}>
              <p className="[font-family:var(--font-paraluman-heading)] text-lg font-bold tracking-[-0.03em] text-[#173f69]">
                {submissionStep === 1
                  ? "Step 1/2: Paste the single best link to your prototype, video, or document."
                  : "Step 2/2: Add your contact details so the team can review and reply quickly."}
              </p>

              {submissionStep === 1 && (
                <>
                  <div className="space-y-2.5">
                    <label className="[font-family:var(--font-paraluman-body)] font-semibold text-[#173957] opacity-60 text-xs">
                      Challenge Output Link *
                    </label>
                    <Input
                      required
                      value={form.submissionLink}
                      onChange={updateField("submissionLink")}
                      className="h-12 border-[#2574BB]/14 bg-white [font-family:var(--font-paraluman-body)] text-base shadow-none focus-visible:ring-[#2574BB]/25"
                    />
                    <div className="flex flex-wrap gap-2 pt-1 [font-family:var(--font-paraluman-body)] text-[11px] text-[#173957]/56 sm:text-xs">
                      Accepted Links:
                      <span className="inline-flex items-center gap-1">
                        <FolderOpen className="h-3.5 w-3.5" />
                        Google Drive,
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        Google Docs,
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5" />
                        Live Demo,
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Video className="h-3.5 w-3.5" />
                        YouTube
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="[font-family:var(--font-paraluman-body)] font-semibold text-[#173957] opacity-60 text-xs">
                      Application Notes
                    </label>
                    <Textarea
                      value={form.submissionNotes}
                      onChange={updateField("submissionNotes")}
                      placeholder="Add context, constraints, and tradeoffs you want Philippine Chamber of Commerce reviewers to notice."
                      className="min-h-32 border-[#2574BB]/14 bg-white [font-family:var(--font-paraluman-body)] text-base shadow-none focus-visible:ring-[#2574BB]/25"
                    />
                  </div>
                </>
              )}

              {submissionStep === 2 && (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2.5 sm:col-span-2">
                      <label className="[font-family:var(--font-paraluman-body)] font-semibold text-[#173957] opacity-60 text-xs">
                        Email Address *
                      </label>
                      <Input
                        required
                        type="email"
                        value={form.email}
                        onChange={updateField("email")}
                        className="h-12 border-[#2574BB]/14 bg-white [font-family:var(--font-paraluman-body)] text-base shadow-none focus-visible:ring-[#2574BB]/25"
                      />
                    </div>

                    <div className="space-y-2.5">
                      <label className="[font-family:var(--font-paraluman-body)] font-semibold text-[#173957] opacity-60 text-xs">
                        Full Name *
                      </label>
                      <Input
                        required
                        value={form.fullName}
                        onChange={updateField("fullName")}
                        className="h-12 border-[#2574BB]/14 bg-white [font-family:var(--font-paraluman-body)] text-base shadow-none focus-visible:ring-[#2574BB]/25"
                      />
                    </div>

                    <div className="space-y-2.5">
                      <label className="[font-family:var(--font-paraluman-body)] font-semibold text-[#173957] opacity-60 text-xs">
                        Facebook Link *
                      </label>
                      <Input
                        required
                        value={form.facebookLink}
                        onChange={updateField("facebookLink")}
                        className="h-12 border-[#2574BB]/14 bg-white [font-family:var(--font-paraluman-body)] text-base shadow-none focus-visible:ring-[#2574BB]/25"
                      />
                    </div>
                  </div>

                  {isDevelopment ? (
                    <p className="border-t border-[#2574BB]/10 pt-4 [font-family:var(--font-paraluman-body)] text-sm text-[#1f68a9]">
                      Captcha disabled in development.
                    </p>
                  ) : !token ? (
                    <div className="space-y-3 border-t border-[#2574BB]/10 pt-4">
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
                    <div className="border-t border-emerald-200 pt-4 [font-family:var(--font-paraluman-body)] text-sm text-emerald-700">
                      Browser verification complete.
                    </div>
                  )}
                </>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                {submissionStep === 1 ? (
                  <Button
                    type="button"
                    onClick={onNextStep}
                    className="inline-flex h-11 items-center justify-center rounded-md bg-[#173f69] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-medium tracking-[-0.02em] text-white transition-all duration-200 hover:bg-[#123456]"
                  >
                    Continue to contact details
                  </Button>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onBackStep}
                      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md border border-[#2574BB]/14 bg-white px-5 [font-family:var(--font-paraluman-heading)] text-sm font-medium tracking-[-0.02em] text-[#173f69] transition-colors duration-200 hover:bg-[#edf5ff]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#173f69] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-medium tracking-[-0.02em] text-white transition-all duration-200 hover:bg-[#123456]"
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
                    "rounded-[1rem] border px-4 py-3 [font-family:var(--font-paraluman-body)] text-sm",
                    isError
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700",
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
