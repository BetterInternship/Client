"use client";

import { type ChangeEvent, type FormEvent } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  FolderOpen,
  Globe,
  Loader2,
  Video,
} from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/ui/loader";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ParalumanSubmissionForm, SubmissionStep } from "./types";

type ApplyPanelProps = {
  form: ParalumanSubmissionForm;
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
  onFieldChange: (field: keyof ParalumanSubmissionForm, value: string) => void;
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
  const stepLabel =
    submissionStep === 1
      ? "Submission Link"
      : submissionStep === 2
        ? "Personal Info"
        : "Review & Submit";

  const updateField =
    (field: keyof ParalumanSubmissionForm) =>
    (
      event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
    ) => {
      onFieldChange(field, event.target.value);
    };

  return (
    <div className="overflow-hidden rounded-[0.33em] border-2 border-[rgba(114,6,140,0.24)] bg-white shadow-[0_24px_55px_-35px_rgba(114,6,140,0.75)]">
      <div className="flex flex-col gap-4 bg-gradient-to-br from-[#72068c] via-[#5a0570] to-[#4a0460] px-6 py-6 text-white sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <p className="[font-family:var(--font-paraluman-heading)] text-2xl text-white font-black uppercase tracking-[-0.02em] sm:text-3xl">
            Apply
          </p>
        </div>

        {!hasSubmitted && (
          <div className="w-full sm:w-auto sm:min-w-64 sm:text-right">
            <p className="[font-family:var(--font-paraluman-mono)] text-[11px] font-semibold uppercase tracking-[0.08em] text-white/80">
              Step {submissionStep} - {stepLabel}
            </p>
            <div className="mt-2 grid w-full grid-cols-3 gap-1.5 sm:ml-auto sm:w-48">
              <span
                className={cn(
                  "h-1.5 w-full rounded-full transition-colors",
                  submissionStep >= 1 ? "bg-white" : "bg-white/30",
                )}
              />
              <span
                className={cn(
                  "h-1.5 w-full rounded-full transition-colors",
                  submissionStep >= 2 ? "bg-white" : "bg-white/30",
                )}
              />
              <span
                className={cn(
                  "h-1.5 w-full rounded-full transition-colors",
                  submissionStep >= 3 ? "bg-white" : "bg-white/30",
                )}
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-7 sm:px-8 sm:py-8">
        {hasSubmitted ? (
          <div className="relative overflow-hidden rounded-[0.33em] border-2 border-[#72068c]/25 bg-white p-6 shadow-[0_18px_45px_-35px_rgba(114,6,140,0.85)] sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(114,6,140,0.18),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(114,6,140,0.1),transparent_50%)]" />
            <div className="relative z-10 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#72068c]/30 bg-[rgba(114,6,140,0.09)] px-3 py-1 [font-family:var(--font-paraluman-mono)] text-xs uppercase tracking-[0.12em] text-[#72068c]">
                <CheckCircle2 className="h-4 w-4" />
                Application sent
              </div>
              <p className="[font-family:var(--font-paraluman-heading)] text-2xl font-black uppercase tracking-[-0.02em] text-[#72068c] sm:text-3xl">
                You're in.
              </p>
              <p className="[font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/70 sm:text-base">
                Thank you for applying. We sent a confirmation to{" "}
                <span className="font-bold text-[#72068c]">
                  {submittedEmail || "your email"}
                </span>
                . We'll review your submission and get back to you.
              </p>
              <div className="pt-1">
                <Button
                  type="button"
                  onClick={onBackToOverview}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#72068c] bg-gradient-to-r from-[#72068c] to-[#5a0570] px-5 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:shadow-lg"
                >
                  Back to overview
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={(e) => void onSubmit(e)}>
            {submissionStep === 1 && (
              <>
                <div className="space-y-2">
                  <label className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.1em] text-black/70">
                    Application Link *
                  </label>
                  <Input
                    required
                    value={form.submissionLink}
                    onChange={updateField("submissionLink")}
                    className="h-11 border-2 border-[rgba(114,6,140,0.3)] bg-white focus:ring-0 [font-family:var(--font-paraluman-mono)]"
                  />
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 [font-family:var(--font-paraluman-mono)] text-[10px] text-black/55 sm:text-[11px]">
                    <span className="inline-flex items-center gap-1">
                      <FolderOpen className="h-3 w-3 shrink-0" />
                      Google Drive
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="h-3 w-3 shrink-0" />
                      Google Docs
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Globe className="h-3 w-3 shrink-0" />
                      Live Demo
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Video className="h-3 w-3 shrink-0" />
                      YouTube
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="[font-family:var(--font-paraluman-mono)] text-xs font-bold uppercase tracking-[0.1em] text-black/70">
                    Application Notes (Optional)
                  </label>
                  <Textarea
                    value={form.submissionNotes}
                    onChange={updateField("submissionNotes")}
                    className="min-h-28 border-2 border-[rgba(114,6,140,0.3)] bg-white focus:ring-0 [font-family:var(--font-paraluman-mono)]"
                  />
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
                    className="h-11 border-2 border-[rgba(114,6,140,0.3)] bg-white focus:ring-0 [font-family:var(--font-paraluman-mono)]"
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
                    className="h-11 border-2 border-[rgba(114,6,140,0.3)] bg-white focus:ring-0 [font-family:var(--font-paraluman-mono)]"
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
                    className="h-11 border-2 border-[rgba(114,6,140,0.3)] bg-white focus:ring-0 [font-family:var(--font-paraluman-mono)]"
                  />
                </div>

                {isDevelopment ? (
                  <p className="rounded-[0.33em] bg-[rgba(114,6,140,0.1)] px-3 py-2 [font-family:var(--font-paraluman-mono)] text-xs text-[#72068c]">
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

            {submissionStep === 3 && (
              <div className="space-y-4 rounded-[0.33em] border-2 border-[rgba(114,6,140,0.2)] bg-[rgba(114,6,140,0.04)] p-4 sm:p-5">
                <p className="[font-family:var(--font-paraluman-heading)] text-base font-black uppercase tracking-[0.06em] text-[#72068c] sm:text-lg">
                  Review your application
                </p>
                <div className="space-y-2 [font-family:var(--font-paraluman-mono)] text-sm leading-7 text-black/75">
                  <p>
                    <span className="font-semibold text-[#72068c]">Email:</span>{" "}
                    {form.email}
                  </p>
                  <p>
                    <span className="font-semibold text-[#72068c]">
                      Full Name:
                    </span>{" "}
                    {form.fullName}
                  </p>
                  <p>
                    <span className="font-semibold text-[#72068c]">
                      Facebook Link:
                    </span>{" "}
                    {form.facebookLink}
                  </p>
                  <p>
                    <span className="font-semibold text-[#72068c]">
                      Application Link:
                    </span>{" "}
                    {form.submissionLink}
                  </p>
                  {form.submissionNotes.trim() ? (
                    <p>
                      <span className="font-semibold text-[#72068c]">
                        Notes:
                      </span>{" "}
                      {form.submissionNotes}
                    </p>
                  ) : null}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t-2 border-[rgba(114,6,140,0.15)] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="[font-family:var(--font-paraluman-mono)] text-xs text-black/60">
                We will send a confirmation to your email
              </p>

              {submissionStep === 1 ? (
                <Button
                  type="button"
                  onClick={onNextStep}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#72068c] bg-gradient-to-r from-[#72068c] to-[#5a0570] [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:shadow-lg sm:w-auto sm:px-8"
                >
                  Next Step
                </Button>
              ) : submissionStep === 2 ? (
                <div className="flex w-full gap-2 sm:w-auto sm:items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBackStep}
                    className="inline-flex h-11 w-1/3 items-center justify-center gap-1.5 rounded-[0.33em] border-2 border-[rgba(114,6,140,0.35)] bg-white/90 px-3 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.08em] text-[#72068c] transition-colors hover:bg-white sm:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={onNextStep}
                    className="inline-flex h-11 w-2/3 items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#72068c] bg-gradient-to-r from-[#72068c] to-[#5a0570] px-6 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:shadow-lg sm:min-w-36 sm:w-auto"
                  >
                    Review
                  </Button>
                </div>
              ) : (
                <div className="flex w-full gap-2 sm:w-auto sm:items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBackStep}
                    className="inline-flex h-11 w-1/3 items-center justify-center gap-1.5 rounded-[0.33em] border-2 border-[rgba(114,6,140,0.35)] bg-white/90 px-3 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.08em] text-[#72068c] transition-colors hover:bg-white sm:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-11 w-2/3 items-center justify-center gap-2 rounded-[0.33em] border-2 border-[#72068c] bg-gradient-to-r from-[#72068c] to-[#5a0570] px-6 [font-family:var(--font-paraluman-heading)] text-sm font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 sm:min-w-36 sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending
                      </>
                    ) : (
                      "Submit"
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
  );
}
